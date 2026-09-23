"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { EngineManifest } from "@/lib/learn/runtime";
import { tracks } from "@/lib/learn/tracks";
import { absoluteUrl } from "@/lib/site";
import { ShareCanvas } from "./finish-panel";
import { TillyFigure } from "./tilly-figure";
import { TrackPreview } from "./track-preview";

const SAMPLE = {
  trackTitle: "The basics",
  minutes: 4,
  seconds: 252,
  results: [
    "clean",
    "clean",
    "clean",
    "hinted",
    "clean",
    "clean",
    "clean",
    "clean",
    "clean",
    "clean",
    "clean",
    "clean",
  ] as const,
  keys: ["n", "i", "ctrl+b", "tab", "z", "t"],
};

/**
 * What running tuios here would download, in MB, from engine.json. Null until
 * it is known, or when there is no engine.
 */
function useDownloadSize() {
  const [size, setSize] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    fetch("/learn/engine.json", { cache: "no-cache" })
      .then((res) => (res.ok ? (res.json() as Promise<EngineManifest>) : null))
      .then((m) => {
        const bytes = m?.totalBytes ?? m?.wasmBytes;
        if (live && bytes) setSize((bytes / 1e6).toFixed(0));
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);
  return size;
}

/**
 * Phones get a preview that plays by itself instead of the engine download:
 * learning keys needs a keyboard. The link can be copied for later.
 */
export function MobileLearn({ onTryAnyway }: { onTryAnyway: () => void }) {
  const [trackId, setTrackId] = useState(tracks[0].id);
  const [copied, setCopied] = useState(false);
  const track = tracks.find((t) => t.id === trackId) ?? tracks[0];
  const url = absoluteUrl("/learn");
  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  const size = useDownloadSize();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // The URL is on screen to select by hand.
    }
  };

  return (
    <div className="hero-wash">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 pt-10 pb-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card/70 py-1 pr-3 pl-1 font-mono text-xs">
            <span className="rounded-full bg-fd-primary px-2 py-0.5 text-fd-primary-foreground">
              Learn
            </span>
            <span className="text-fd-muted-foreground">
              5 minutes, hands on
            </span>
          </span>
          <h1 className="mt-5 font-bold text-4xl leading-tight">
            Learn tuios{" "}
            <span className="learn-gradient-text">by doing it.</span>
          </h1>
          <p className="mt-3 text-fd-muted-foreground">
            The real tuios runs right in the page. It wants a keyboard, so grab
            a computer. Here is a taste.
          </p>
        </div>

        <div
          className="flex gap-2 overflow-x-auto [scrollbar-width:none]"
          role="tablist"
        >
          {tracks.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === trackId}
              onClick={() => setTrackId(t.id)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-sm transition-colors ${
                t.id === trackId
                  ? "border-fd-primary bg-fd-primary/10 text-fd-foreground"
                  : "border-fd-border text-fd-muted-foreground"
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>

        <TrackPreview key={track.id} track={track} />

        <div className="rounded-2xl border border-fd-border bg-fd-card p-5">
          <div className="flex items-start gap-3">
            <TillyFigure
              className="size-14 shrink-0"
              title="Tilly, the tuios mascot"
            />
            <div>
              <p className="font-semibold">Open this on a computer</p>
              <p className="mt-1 text-fd-muted-foreground text-sm">
                Then press real keys and watch real windows move. Tilly, the
                little CRT here, walks you through it.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-4 py-2 font-medium font-mono text-fd-primary-foreground text-sm"
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Link2 className="size-4" />
              )}
              {copied ? "Link copied" : "Remind me: copy link"}
            </button>
            {canShare ? (
              <button
                type="button"
                onClick={() =>
                  navigator
                    .share({ title: "Learn tuios", url })
                    .catch(() => undefined)
                }
                className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-4 py-2 font-mono text-sm"
              >
                <Share2 className="size-4" /> Share
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <p className="mb-2 font-mono text-fd-muted-foreground text-xs tracking-widest">
            WHAT YOU GET AT THE END
          </p>
          <ShareCanvas
            data={{ ...SAMPLE, results: [...SAMPLE.results] }}
            className="aspect-[1200/630] w-full rounded-xl border border-fd-border shadow-lg"
          />
        </div>

        <button
          type="button"
          onClick={onTryAnyway}
          className="mx-auto font-mono text-fd-muted-foreground text-xs underline underline-offset-4"
        >
          I have a keyboard. Run it here{size ? ` (${size} MB)` : ""}.
        </button>
      </div>
    </div>
  );
}
