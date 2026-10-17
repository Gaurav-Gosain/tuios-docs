import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import {
  GalleryVotes,
  handleVotes,
  RATE_LIMIT,
  type SqlStorage,
  type VoteDeps,
  type VoteEnv,
} from "./votes";

const ORIGIN = "https://tuios.dev";
const URL_ = `${ORIGIN}/gallery/votes`;

/** A Durable Object's SQL storage over an in-memory SQLite database. */
function sqlStorage(): SqlStorage {
  const db = new Database(":memory:");
  return {
    exec(query, ...bindings) {
      const rows = db.query(query).all(...bindings) as Record<
        string,
        unknown
      >[];
      return { toArray: () => rows };
    },
  };
}

type Rig = {
  env: VoteEnv;
  deps: VoteDeps;
  votes: GalleryVotes;
  verified: string[];
  setNow(t: number): void;
};

const PEPPER = "0123456789abcdef0123456789abcdef0123456789abcdef";

function rig(
  opts: { secret?: boolean; turnstile?: unknown; pepper?: string } = {},
): Rig {
  let now = Date.parse("2026-10-17T12:00:00Z");
  const votes = new GalleryVotes(
    { storage: { sql: sqlStorage() } },
    opts.pepper === undefined ? undefined : { VOTE_PEPPER: opts.pepper },
    () => now,
  );
  const verified: string[] = [];
  const stub = {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      votes.fetch(new Request(input, init)),
  } as unknown as Fetcher;
  const env: VoteEnv = {
    VOTES: { idFromName: () => "id", get: () => stub },
    ...(opts.secret === false
      ? {}
      : { TURNSTILE_SECRET: "secret", TURNSTILE_SITE_KEY: "site" }),
  };
  const deps: VoteDeps = {
    knownIds: async () => new Set(["123", "456"]),
    fetch: (async (_url: RequestInfo | URL, init?: RequestInit) => {
      const form = init?.body as FormData;
      verified.push(String(form.get("response")));
      return Response.json(
        opts.turnstile ?? {
          success: form.get("response") === "good",
          action: "like",
          hostname: "tuios.dev",
        },
      );
    }) as typeof fetch,
  };
  return {
    env,
    deps,
    votes,
    verified,
    setNow: (t) => {
      now = t;
    },
  };
}

function post(
  body: unknown,
  headers: Record<string, string> = {},
  ip = "203.0.113.7",
) {
  return new Request(URL_, {
    method: "POST",
    headers: {
      Origin: ORIGIN,
      "Sec-Fetch-Site": "same-origin",
      "Content-Type": "application/json",
      "CF-Connecting-IP": ip,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function vote(
  r: Rig,
  body: Record<string, unknown>,
  headers?: Record<string, string>,
  ip?: string,
) {
  const res = await handleVotes(
    post({ token: "good", ...body }, headers, ip),
    r.env,
    undefined,
    r.deps,
  );
  return {
    status: res.status,
    body: (await res.json()) as Record<string, unknown>,
  };
}

describe("the vote handler", () => {
  test("a like counts once per visitor", async () => {
    const r = rig();
    expect((await vote(r, { id: "123", like: true })).body).toEqual({
      count: 1,
      liked: true,
    });
    expect((await vote(r, { id: "123", like: true })).body.count).toBe(1);
    expect(
      (await vote(r, { id: "123", like: true }, {}, "198.51.100.2")).body.count,
    ).toBe(2);
  });

  test("an unlike takes the visitor's like back, and only theirs", async () => {
    const r = rig();
    await vote(r, { id: "123", like: true });
    await vote(r, { id: "123", like: true }, {}, "198.51.100.2");
    const res = await vote(r, { id: "123", like: false });
    expect(res.body).toEqual({ count: 1, liked: false });
    expect((await vote(r, { id: "123", like: false })).body.count).toBe(1);
  });

  test("no raw IP is stored", async () => {
    const r = rig();
    await vote(r, { id: "123", like: true });
    const db = JSON.stringify(
      (r.votes as unknown as { sql: SqlStorage }).sql
        .exec("SELECT * FROM likes")
        .toArray(),
    );
    expect(db).not.toContain("203.0.113.7");
  });

  test("a new day has a new salt", async () => {
    const r = rig();
    await vote(r, { id: "123", like: true });
    r.setNow(Date.parse("2026-10-18T12:00:00Z"));
    // Yesterday's like stays, and cannot be taken back today.
    expect((await vote(r, { id: "123", like: false })).body.count).toBe(1);
  });

  test("with VOTE_PEPPER a like lasts: no second like the next day", async () => {
    const r = rig({ pepper: PEPPER });
    expect((await vote(r, { id: "123", like: true })).body.count).toBe(1);
    r.setNow(Date.parse("2026-10-18T12:00:00Z"));
    expect((await vote(r, { id: "123", like: true })).body.count).toBe(1);
    r.setNow(Date.parse("2026-11-30T12:00:00Z"));
    expect((await vote(r, { id: "123", like: true })).body.count).toBe(1);
    // Another IP still counts, and the first IP can take its like back later.
    expect(
      (await vote(r, { id: "123", like: true }, {}, "198.51.100.2")).body.count,
    ).toBe(2);
    expect((await vote(r, { id: "123", like: false })).body.count).toBe(1);
  });

  test("with VOTE_PEPPER the key is an HMAC, never the IP or a plain hash", async () => {
    const keys = async (pepper: string) => {
      const r = rig({ pepper });
      await vote(r, { id: "123", like: true });
      return (r.votes as unknown as { sql: SqlStorage }).sql
        .exec("SELECT voter FROM likes")
        .toArray()
        .map((row) => String(row.voter));
    };
    const [a] = await keys(PEPPER);
    const [b] = await keys(`${PEPPER}x`);
    expect(a).toStartWith("p:");
    expect(a).not.toContain("203.0.113.7");
    expect(a).not.toBe(b);
    const plain = new Bun.CryptoHasher("sha256")
      .update("like|203.0.113.7|123")
      .digest("hex");
    expect(a).not.toContain(plain);
  });

  test("a short VOTE_PEPPER falls back to the daily salt", async () => {
    const r = rig({ pepper: "short" });
    await vote(r, { id: "123", like: true });
    r.setNow(Date.parse("2026-10-18T12:00:00Z"));
    expect((await vote(r, { id: "123", like: true })).body.count).toBe(2);
  });

  test("an id the feed does not have is refused and makes no key", async () => {
    const r = rig();
    for (const id of ["999"]) {
      expect((await vote(r, { id, like: true })).status).toBe(404);
    }
    for (const id of ["../x", "abc", "seed-amber", "1".repeat(13), ""]) {
      expect((await vote(r, { id, like: true })).status).toBe(400);
    }
    expect(r.votes.counts()).toEqual({});
  });

  test("the rate limit stops an IP after RATE_LIMIT attempts", async () => {
    const r = rig();
    for (let i = 0; i < RATE_LIMIT; i++) {
      expect((await vote(r, { id: "123", like: i % 2 === 0 })).status).toBe(
        200,
      );
    }
    const over = await vote(r, { id: "123", like: true });
    expect(over.status).toBe(429);
    // Another address is not limited.
    expect(
      (await vote(r, { id: "123", like: true }, {}, "198.51.100.2")).status,
    ).toBe(200);
    // The next window is open again.
    r.setNow(Date.parse("2026-10-17T12:10:00Z"));
    expect((await vote(r, { id: "123", like: true })).status).toBe(200);
  });

  test("a failed Turnstile check counts nothing", async () => {
    const r = rig();
    const res = await vote(r, { id: "123", like: true, token: "bad" });
    expect(res.status).toBe(403);
    expect(r.verified).toEqual(["bad"]);
    expect(r.votes.counts()).toEqual({});
  });

  test("a token for another action or host is refused", async () => {
    for (const turnstile of [
      { success: true, action: "login", hostname: "tuios.dev" },
      { success: true, action: "like", hostname: "evil.example" },
      { success: true, action: "like" },
    ]) {
      const r = rig({ turnstile });
      expect((await vote(r, { id: "123", like: true })).status).toBe(403);
    }
  });

  test("without the secret the hearts are read-only", async () => {
    const r = rig({ secret: false });
    const res = await vote(r, { id: "123", like: true });
    expect(res.status).toBe(503);
    expect(res.body.readOnly).toBe(true);
    expect(r.verified).toEqual([]);
    const get = await handleVotes(new Request(URL_), r.env, undefined, r.deps);
    expect(await get.json()).toEqual({
      counts: {},
      siteKey: null,
      writable: false,
    });
  });

  test("a vote from another origin or method is refused", async () => {
    const r = rig();
    expect(
      (await vote(r, { id: "123", like: true }, { Origin: "https://x.dev" }))
        .status,
    ).toBe(403);
    expect(
      (
        await vote(
          r,
          { id: "123", like: true },
          { "Sec-Fetch-Site": "cross-site" },
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await vote(
          r,
          { id: "123", like: true },
          { "Content-Type": "text/plain" },
        )
      ).status,
    ).toBe(415);
    const put = await handleVotes(
      new Request(URL_, { method: "PUT" }),
      r.env,
      undefined,
      r.deps,
    );
    expect(put.status).toBe(405);
    expect(r.votes.counts()).toEqual({});
  });

  test("GET lists the counts with a short edge cache", async () => {
    const r = rig();
    await vote(r, { id: "456", like: true });
    const res = await handleVotes(new Request(URL_), r.env, undefined, r.deps);
    expect(res.headers.get("cache-control")).toBe("public, max-age=60");
    expect(await res.json()).toEqual({
      counts: { "456": 1 },
      siteKey: "site",
      writable: true,
    });
  });
});
