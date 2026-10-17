/**
 * The hearts on gallery cards: one Durable Object, GalleryVotes, holds every
 * like in its SQLite storage. One object serialises every write, so a like
 * and its count cannot race, which KV counters would. It needs no resource
 * made by hand: the migration in wrangler.jsonc creates it on deploy.
 *
 *   GET  /gallery/votes  {counts, siteKey, writable}, cached at the edge 60 s
 *   POST /gallery/votes  {id, like, token} -> {count, liked}
 *
 * A heart is cheap to fake compared with a GitHub reaction, so it is guarded
 * and counted apart (see lib/gallery/votes.ts for how the two combine).
 *
 * # Privacy
 *
 * No raw IP address is stored. A like is keyed by SHA-256(salt, IP, entry),
 * where salt is a random value the object makes each UTC day and deletes the
 * next. A key cannot be turned back into an address, and two entries' keys of
 * one visitor cannot be linked. So one visitor can like an entry once a day,
 * and can take a like back on the day it was given. No cookie is set; the
 * page keeps its own "liked" marks in localStorage, and Turnstile sets what
 * it needs.
 *
 * # The guards on a POST, in order
 *
 * 1. POST only, from this origin (Origin and Sec-Fetch-Site), as JSON, with a
 *    small body.
 * 2. Read-only until TURNSTILE_SECRET (a secret) and TURNSTILE_SITE_KEY (a
 *    public var in wrangler.jsonc) are both set: 503.
 * 3. The id must name an entry of the current feed or the seed, so a vote
 *    cannot make a key of its own.
 * 4. At most RATE_LIMIT attempts per IP (hashed as above) per RATE_WINDOW_MS.
 * 5. A Cloudflare Turnstile token, checked with siteverify, for this host
 *    and the "like" action.
 */

import { parseFeed } from "../lib/gallery/feed";
import seed from "../lib/gallery/gallery-seed.json";
import type { MediaBucket } from "./media";

export const VOTES_PATH = "/gallery/votes";

/** Attempts one IP may make in one window. */
export const RATE_LIMIT = 20;
export const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY = 2048;
const COUNTS_CACHE = "public, max-age=60";
const ENTRY_ID = /^(?:\d{1,12}|seed-[a-z0-9-]{1,40})$/;
const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** The part of a Durable Object's SQL storage this code uses. */
export type SqlStorage = {
  exec(
    query: string,
    ...bindings: (string | number | null)[]
  ): { toArray(): Record<string, unknown>[] };
};

type VoteState = { storage: { sql: SqlStorage } };

function json(body: unknown, status = 200, cache = "no-store") {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cache,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * The Durable Object. It is reached only from the Worker below, never from
 * the internet, so it trusts the shape of what it is sent.
 */
export class GalleryVotes {
  private sql: SqlStorage;
  private now: () => number;

  constructor(state: VoteState, _env?: unknown, now: () => number = Date.now) {
    this.sql = state.storage.sql;
    this.now = now;
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS likes (entry TEXT NOT NULL, voter TEXT NOT NULL, PRIMARY KEY (entry, voter))",
    );
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS salts (day TEXT PRIMARY KEY, salt TEXT NOT NULL)",
    );
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS hits (key TEXT PRIMARY KEY, win INTEGER NOT NULL, n INTEGER NOT NULL)",
    );
  }

  /** Today's salt, made on first use. Older salts are deleted. */
  private salt(): string {
    const day = new Date(this.now()).toISOString().slice(0, 10);
    const row = this.sql
      .exec("SELECT salt FROM salts WHERE day = ?", day)
      .toArray()[0];
    if (row) return row.salt as string;
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const salt = [...bytes]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    this.sql.exec("DELETE FROM salts WHERE day <> ?", day);
    this.sql.exec("INSERT INTO salts (day, salt) VALUES (?, ?)", day, salt);
    return salt;
  }

  /** Records one attempt by ip and reports whether it is within the limit. */
  async limit(ip: string): Promise<boolean> {
    const key = await sha256(`${this.salt()}|${ip}|rate`);
    const win = Math.floor(this.now() / RATE_WINDOW_MS);
    this.sql.exec("DELETE FROM hits WHERE win < ?", win);
    const row = this.sql
      .exec("SELECT n FROM hits WHERE key = ?", key)
      .toArray()[0];
    const n = (row ? Number(row.n) : 0) + 1;
    this.sql.exec(
      "INSERT INTO hits (key, win, n) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET n = excluded.n, win = excluded.win",
      key,
      win,
      n,
    );
    return n <= RATE_LIMIT;
  }

  /** Adds or takes back ip's like of entry, and returns the new count. */
  async vote(
    ip: string,
    entry: string,
    like: boolean,
  ): Promise<{ count: number; liked: boolean }> {
    const voter = await sha256(`${this.salt()}|${ip}|${entry}`);
    if (like) {
      this.sql.exec(
        "INSERT OR IGNORE INTO likes (entry, voter) VALUES (?, ?)",
        entry,
        voter,
      );
    } else {
      this.sql.exec(
        "DELETE FROM likes WHERE entry = ? AND voter = ?",
        entry,
        voter,
      );
    }
    const row = this.sql
      .exec("SELECT COUNT(*) AS n FROM likes WHERE entry = ?", entry)
      .toArray()[0];
    return { count: Number(row?.n ?? 0), liked: like };
  }

  /** Every entry's count. */
  counts(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const row of this.sql
      .exec("SELECT entry, COUNT(*) AS n FROM likes GROUP BY entry")
      .toArray()) {
      out[row.entry as string] = Number(row.n);
    }
    return out;
  }

  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/counts") return json({ counts: this.counts() });
    const body = (await request.json()) as {
      ip: string;
      id: string;
      like: boolean;
    };
    if (pathname === "/limit") return json({ ok: await this.limit(body.ip) });
    if (pathname === "/vote")
      return json(await this.vote(body.ip, body.id, body.like));
    return json({ error: "not found" }, 404);
  }
}

/** The Worker's bindings for votes. */
export type VoteEnv = {
  VOTES?: { idFromName(name: string): unknown; get(id: unknown): Fetcher };
  MEDIA?: MediaBucket;
  TURNSTILE_SECRET?: string;
  TURNSTILE_SITE_KEY?: string;
};

/** What the vote handler needs from outside, replaced in tests. */
export type VoteDeps = {
  /** The entry IDs a vote may name. */
  knownIds: (env: VoteEnv) => Promise<Set<string>>;
  /** fetch, for siteverify. */
  fetch: typeof fetch;
  /** The edge cache, when there is one. */
  cache?: Cache;
};

let idCache: { at: number; ids: Set<string> } | null = null;

/** The seed IDs and the current feed's IDs, kept for a minute. */
export async function knownEntryIds(env: VoteEnv): Promise<Set<string>> {
  if (idCache && Date.now() - idCache.at < 60_000) return idCache.ids;
  const ids = new Set(parseFeed(seed).map((e) => e.id));
  const found = env.MEDIA ? await env.MEDIA.get("gallery/gallery.json") : null;
  if (found && "body" in found) {
    try {
      for (const e of parseFeed(await new Response(found.body).json()))
        ids.add(e.id);
    } catch {
      // A broken feed leaves the seed.
    }
  }
  idCache = { at: Date.now(), ids };
  return ids;
}

function store(env: VoteEnv): Fetcher | null {
  if (!env.VOTES) return null;
  return env.VOTES.get(env.VOTES.idFromName("gallery"));
}

async function call<T>(stub: Fetcher, path: string, body?: unknown) {
  const res = await stub.fetch(
    `https://votes${path}`,
    body === undefined
      ? undefined
      : {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        },
  );
  return (await res.json()) as T;
}

function writable(env: VoteEnv): boolean {
  return Boolean(env.TURNSTILE_SECRET && env.TURNSTILE_SITE_KEY && env.VOTES);
}

/** Checks a Turnstile token with siteverify. */
export async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string,
  host: string,
  doFetch: typeof fetch,
): Promise<boolean> {
  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  form.set("remoteip", ip);
  try {
    const res = await doFetch(SITEVERIFY, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(5000),
    });
    const out = (await res.json()) as {
      success?: boolean;
      action?: string;
      hostname?: string;
    };
    return (
      out.success === true &&
      out.action === "like" &&
      (out.hostname === undefined || out.hostname === host)
    );
  } catch {
    return false;
  }
}

/** Answers /gallery/votes. */
export async function handleVotes(
  request: Request,
  env: VoteEnv,
  ctx: { waitUntil(p: Promise<unknown>): void } | undefined,
  deps: VoteDeps = {
    knownIds: knownEntryIds,
    fetch,
    cache: typeof caches !== "undefined" ? caches.default : undefined,
  },
): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === "GET" || request.method === "HEAD") {
    return counts(request, url, env, ctx, deps);
  }
  if (request.method !== "POST") {
    return new Response("Method Not Allowed\n", {
      status: 405,
      headers: { Allow: "GET, HEAD, POST" },
    });
  }

  const site = request.headers.get("sec-fetch-site");
  if (
    request.headers.get("origin") !== url.origin ||
    (site !== null && site !== "same-origin")
  ) {
    return json({ error: "Send the vote from the gallery page." }, 403);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return json({ error: "Send the vote as JSON." }, 415);
  }
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_BODY) return json({ error: "The vote is too large." }, 413);
  const text = await request.text();
  if (text.length > MAX_BODY)
    return json({ error: "The vote is too large." }, 413);
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: "The vote is not JSON." }, 400);
  }
  const { id, like, token } = body ?? {};
  if (
    typeof id !== "string" ||
    !ENTRY_ID.test(id) ||
    typeof like !== "boolean" ||
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > MAX_BODY
  ) {
    return json({ error: "The vote has the wrong shape." }, 400);
  }

  const stub = store(env);
  if (!writable(env) || !stub || !env.TURNSTILE_SECRET) {
    return json({ error: "Likes are read-only now.", readOnly: true }, 503);
  }
  if (!(await deps.knownIds(env)).has(id)) {
    return json({ error: "The gallery has no entry with this id." }, 404);
  }
  const ip = request.headers.get("cf-connecting-ip");
  if (!ip) return json({ error: "The request has no client address." }, 400);

  const { ok } = await call<{ ok: boolean }>(stub, "/limit", { ip });
  if (!ok) {
    const res = json({ error: "Too many votes. Try again later." }, 429);
    res.headers.set("Retry-After", String(RATE_WINDOW_MS / 1000));
    return res;
  }
  if (
    !(await verifyTurnstile(
      token,
      env.TURNSTILE_SECRET,
      ip,
      url.hostname,
      deps.fetch,
    ))
  ) {
    return json({ error: "The check failed. Try again." }, 403);
  }
  const result = await call<{ count: number; liked: boolean }>(stub, "/vote", {
    ip,
    id,
    like,
  });
  return json(result);
}

async function counts(
  request: Request,
  url: URL,
  env: VoteEnv,
  ctx: { waitUntil(p: Promise<unknown>): void } | undefined,
  deps: VoteDeps,
): Promise<Response> {
  const key = new Request(`${url.origin}${VOTES_PATH}`, { method: "GET" });
  const hit = deps.cache ? await deps.cache.match(key) : undefined;
  let res = hit;
  if (!res) {
    const stub = store(env);
    const data = stub
      ? await call<{ counts: Record<string, number> }>(stub, "/counts")
      : { counts: {} };
    res = json(
      {
        counts: data.counts,
        siteKey: writable(env) ? (env.TURNSTILE_SITE_KEY ?? null) : null,
        writable: writable(env),
      },
      200,
      COUNTS_CACHE,
    );
    if (deps.cache) {
      const put = deps.cache.put(key, res.clone());
      if (ctx) ctx.waitUntil(put);
      else await put;
    }
  }
  if (request.method === "HEAD") return new Response(null, res);
  return res;
}
