"use client";

import { Heart, ThumbsUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { GalleryEntry } from "@/lib/gallery/feed";

/**
 * The two vote counts of a card, kept apart: hearts on this site (counted by
 * worker/votes.ts) and reactions on the GitHub comment (counted by the sync).
 * See lib/gallery/votes.ts for how the Top order combines them.
 */

const VOTES_PATH = "/gallery/votes";
const LIKED_KEY = "tuios-gallery-liked";
const TURNSTILE_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export type SiteVotes = {
  counts: Record<string, number>;
  siteKey: string | null;
  writable: boolean;
};

type Turnstile = {
  render(
    el: HTMLElement,
    opts: {
      sitekey: string;
      action: string;
      appearance: "interaction-only";
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
    },
  ): string;
  remove(id: string): void;
};

/** The site's heart counts, read once. Missing counts read as zero. */
export function useSiteVotes() {
  const [votes, setVotes] = useState<SiteVotes>({
    counts: {},
    siteKey: null,
    writable: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch(VOTES_PATH, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json || typeof json !== "object") return;
        const counts: Record<string, number> = {};
        for (const [id, n] of Object.entries(json.counts ?? {})) {
          if (typeof n === "number" && Number.isInteger(n) && n >= 0)
            counts[id] = n;
        }
        setVotes({
          counts,
          siteKey: typeof json.siteKey === "string" ? json.siteKey : null,
          writable: json.writable === true && typeof json.siteKey === "string",
        });
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const setCount = useCallback((id: string, count: number) => {
    setVotes((v) => ({ ...v, counts: { ...v.counts, [id]: count } }));
  }, []);

  return { votes, setCount };
}

function readLiked(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(LIKED_KEY) ?? "[]");
    return new Set(
      Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [],
    );
  } catch {
    return new Set();
  }
}

function writeLiked(liked: Set<string>) {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...liked]));
  } catch {
    // Private mode: the mark lasts for this page only.
  }
}

let turnstileLoad: Promise<Turnstile> | null = null;

function loadTurnstile(): Promise<Turnstile> {
  turnstileLoad ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = () => {
      const t = (window as unknown as { turnstile?: Turnstile }).turnstile;
      if (t) resolve(t);
      else reject(new Error("Turnstile did not load"));
    };
    script.onerror = () => {
      turnstileLoad = null;
      reject(new Error("Turnstile did not load"));
    };
    document.head.appendChild(script);
  });
  return turnstileLoad;
}

/**
 * A Turnstile token for one vote. The widget shows only when Cloudflare wants
 * the visitor to click, in a small box at the bottom of the screen.
 */
async function voteToken(siteKey: string): Promise<string> {
  const turnstile = await loadTurnstile();
  const box = document.createElement("div");
  box.className = "fixed right-4 bottom-4 z-50";
  document.body.appendChild(box);
  try {
    return await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), 60_000);
      const done = (fn: () => void) => {
        clearTimeout(timer);
        fn();
      };
      const id = turnstile.render(box, {
        sitekey: siteKey,
        action: "like",
        appearance: "interaction-only",
        callback: (token) => done(() => resolve(token)),
        "error-callback": () => done(() => reject(new Error("check failed"))),
        "expired-callback": () => done(() => reject(new Error("expired"))),
      });
      box.dataset.widget = id;
    });
  } finally {
    if (box.dataset.widget) turnstile.remove(box.dataset.widget);
    box.remove();
  }
}

/** The heart button. Without the Turnstile keys it shows the count only. */
export function HeartButton({
  entry,
  votes,
  setCount,
}: {
  entry: GalleryEntry;
  votes: SiteVotes;
  setCount: (id: string, count: number) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const count = votes.counts[entry.id] ?? 0;

  useEffect(() => setLiked(readLiked().has(entry.id)), [entry.id]);

  const toggle = async () => {
    if (!votes.writable || !votes.siteKey || busy) return;
    setBusy(true);
    setProblem(null);
    const like = !liked;
    try {
      const token = await voteToken(votes.siteKey);
      const res = await fetch(VOTES_PATH, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: entry.id, like, token }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || typeof json?.count !== "number") {
        setProblem(
          typeof json?.error === "string" ? json.error : "The vote failed.",
        );
        return;
      }
      setCount(entry.id, json.count);
      const marks = readLiked();
      if (like) marks.add(entry.id);
      else marks.delete(entry.id);
      writeLiked(marks);
      setLiked(like);
    } catch {
      setProblem("The check failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const label = votes.writable
    ? liked
      ? `Remove your like. ${count} likes on this site.`
      : `Like this setup. ${count} likes on this site.`
    : `${count} likes on this site. Likes open soon.`;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!votes.writable || busy}
      aria-pressed={votes.writable ? liked : undefined}
      aria-label={label}
      title={problem ?? label}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-fd-muted-foreground text-xs tabular-nums transition-colors enabled:hover:bg-fd-accent enabled:hover:text-fd-foreground disabled:cursor-default"
    >
      <Heart
        className={`size-3.5 ${liked ? "fill-fd-primary text-fd-primary" : ""}`}
      />
      <span>{count}</span>
      {problem ? <span className="sr-only">{problem}</span> : null}
    </button>
  );
}

/** The GitHub reaction count, with a link to react on the comment. */
export function GithubVotes({ entry }: { entry: GalleryEntry }) {
  if (entry.github === undefined) return null;
  return (
    <a
      href={entry.url}
      target="_blank"
      rel="nofollow ugc noopener"
      title="React to the comment on GitHub"
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-fd-muted-foreground text-xs tabular-nums transition-colors hover:bg-fd-accent hover:text-fd-foreground"
    >
      <ThumbsUp className="size-3.5" />
      <span>{entry.github}</span>
      <span>on GitHub</span>
    </a>
  );
}
