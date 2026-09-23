"use client";

import {
  ArrowRight,
  Check,
  Copy,
  Download,
  ImageIcon,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { InstallTabs } from "@/components/home/install-tabs";
import { elapsed, formatTime, type LessonState } from "@/lib/learn/engine";
import { chordParts, keyLabel } from "@/lib/learn/keys";
import { readProgress } from "@/lib/learn/progress";
import {
  canvasBlob,
  drawShareCard,
  type ShareData,
  shareText,
} from "@/lib/learn/share";
import { findTrack } from "@/lib/learn/tracks";
import type { Track } from "@/lib/learn/types";

/** Distinct chords the track taught, for the card. */
export function learnedChords(track: Track, count = 6) {
  const seen = new Set<string>();
  const skip = new Set(["enter", "esc"]);
  for (const step of track.steps) {
    if (step.explainer) continue;
    for (const k of step.keys) {
      if (typeof k !== "string" || skip.has(k) || /^\d$/.test(k)) continue;
      seen.add(chordParts(k).map(keyLabel).join("+"));
    }
  }
  return [...seen].slice(0, count);
}

function useIcon() {
  const [icon, setIcon] = useState<HTMLImageElement | undefined>();
  useEffect(() => {
    const img = new Image();
    img.onload = () => setIcon(img);
    img.src = "/tuios-icon.png";
  }, []);
  return icon;
}

/** The share card as a canvas, redrawn when the data changes. */
export function ShareCanvas({
  data,
  canvasRef,
  className,
}: {
  data: ShareData;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  className?: string;
}) {
  const own = useRef<HTMLCanvasElement>(null);
  const ref = canvasRef ?? own;
  const icon = useIcon();
  useEffect(() => {
    if (ref.current) drawShareCard(ref.current, data, icon);
  }, [data, icon, ref]);
  return (
    <canvas
      ref={ref}
      width={1200}
      height={630}
      role="img"
      aria-label={`Share card: I learned tuios in ${formatTime(data.seconds)}`}
      className={className}
    />
  );
}

export function FinishPanel({
  track,
  lesson,
  onRestart,
  onExit,
  onPickTrack,
  onClose,
}: {
  track: Track;
  lesson: LessonState;
  onRestart: () => void;
  onExit: () => void;
  onPickTrack: (id: string) => void;
  /** Hides the panel so the reader can keep playing in the final layout. */
  onClose: () => void;
}) {
  const seconds = elapsed(lesson, Date.now());
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);
  const data = useMemo<ShareData>(
    () => ({
      trackTitle: track.title,
      minutes: track.minutes,
      seconds,
      results: lesson.results,
      keys: learnedChords(track),
    }),
    [track, seconds, lesson.results],
  );
  const canvas = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const best = readProgress()[track.id]?.best;
  const clean = lesson.results.filter((r) => r === "clean").length;
  const next = (track.next ?? [])
    .map((id) => findTrack(id))
    .filter((t): t is Track => Boolean(t));
  const text = shareText(data);

  const flash = (what: string) => {
    setCopied(what);
    setTimeout(() => setCopied(null), 1600);
  };

  const copyImage = async () => {
    if (!canvas.current) return;
    try {
      const blob = await canvasBlob(canvas.current);
      if (!blob) return;
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      flash("image");
    } catch {
      download();
    }
  };

  const download = async () => {
    if (!canvas.current) return;
    const blob = await canvasBlob(canvas.current);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tuios-${track.id}-${formatTime(seconds).replace(":", "m")}s.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      flash("text");
    } catch {
      // Clipboard refused; the text is on screen to select.
    }
  };

  const intent = encodeURIComponent(text);

  return (
    <div className="learn-fade absolute inset-0 z-[70] overflow-y-auto bg-black/45 backdrop-blur-[2px]">
      <div className="relative mx-auto my-8 w-[min(1040px,calc(100%-2rem))] rounded-2xl border border-fd-border bg-fd-card p-6 shadow-2xl md:p-8">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close and keep playing"
          title="Keep playing (esc)"
          className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
        >
          <X className="size-4" />
        </button>
        <div className="grid gap-8 md:grid-cols-[1fr_1.15fr]">
          <div className="flex flex-col gap-5">
            <p className="font-mono text-[var(--brand-a)] text-sm">
              {track.title} · done
            </p>
            <h2 className="font-bold text-4xl leading-tight">
              You did it in{" "}
              <span className="learn-gradient-text">{formatTime(seconds)}</span>
            </h2>
            <p className="text-fd-muted-foreground">
              {lesson.results.length} steps, {clean} with no help.
              {best && best < seconds
                ? ` Your best is ${formatTime(best)}.`
                : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {learnedChords(track, 10).map((k) => (
                <kbd key={k} className="lk" data-size="sm">
                  {k}
                </kbd>
              ))}
            </div>

            <div className="mt-2 flex flex-col gap-2">
              <p className="font-mono text-fd-muted-foreground text-xs tracking-widest">
                KEEP GOING
              </p>
              {next.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onPickTrack(t.id)}
                  className="group flex items-center justify-between rounded-xl border border-fd-border bg-fd-background/60 px-4 py-3 text-left transition-colors hover:border-fd-primary/60"
                >
                  <span>
                    <span className="block font-mono font-semibold">
                      {t.title}
                    </span>
                    <span className="text-fd-muted-foreground text-sm">
                      {t.blurb}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-fd-foreground" />
                </button>
              ))}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={onRestart}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-3 py-1.5 font-mono text-fd-muted-foreground text-xs hover:text-fd-foreground"
                >
                  <RotateCcw className="size-3.5" /> Beat your time
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-3 py-1.5 font-mono text-fd-muted-foreground text-xs hover:text-fd-foreground"
                >
                  All tracks
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <ShareCanvas
              data={data}
              canvasRef={canvas}
              className="aspect-[1200/630] w-full rounded-xl border border-fd-border shadow-lg"
            />
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={copyImage} primary>
                {copied === "image" ? (
                  <Check className="size-4" />
                ) : (
                  <ImageIcon className="size-4" />
                )}
                {copied === "image" ? "Copied" : "Copy image"}
              </ActionButton>
              <ActionButton onClick={download}>
                <Download className="size-4" /> Download
              </ActionButton>
              <ActionButton onClick={copyText}>
                {copied === "text" ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied === "text" ? "Copied" : "Copy text"}
              </ActionButton>
              <a
                href={`https://x.com/intent/post?text=${intent}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-3 py-2 font-mono text-fd-muted-foreground text-sm hover:text-fd-foreground"
              >
                Post on X
              </a>
              <a
                href={`https://bsky.app/intent/compose?text=${intent}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-3 py-2 font-mono text-fd-muted-foreground text-sm hover:text-fd-foreground"
              >
                Bluesky
              </a>
            </div>
            <pre className="m-0 whitespace-pre-wrap rounded-lg border border-fd-border bg-fd-background/60 p-3 font-mono text-fd-muted-foreground text-xs">
              {text}
            </pre>
          </div>
        </div>

        <div className="mt-8 border-fd-border border-t pt-6">
          <p className="font-semibold">Now run it for real</p>
          <p className="mt-1 text-fd-muted-foreground text-sm">
            Same keys, your own shell. Pick one:
          </p>
          <InstallTabs className="mt-3" />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  primary,
  children,
}: {
  onClick: () => void;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "inline-flex items-center gap-2 rounded-lg bg-fd-primary px-3.5 py-2 font-medium font-mono text-fd-primary-foreground text-sm hover:opacity-90"
          : "inline-flex items-center gap-2 rounded-lg border border-fd-border px-3 py-2 font-mono text-fd-muted-foreground text-sm hover:text-fd-foreground"
      }
    >
      {children}
    </button>
  );
}
