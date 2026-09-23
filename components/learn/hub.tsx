"use client";

import {
  ArrowRight,
  Check,
  Cpu,
  Gamepad2,
  Lock,
  SquareTerminal,
  Trophy,
} from "lucide-react";
import { useCallback } from "react";
import { formatTime } from "@/lib/learn/engine";
import type { Progress } from "@/lib/learn/progress";
import { runSetup, type TuiosInstance } from "@/lib/learn/runtime";
import { tracks } from "@/lib/learn/tracks";
import type { SetupCommand, Track } from "@/lib/learn/types";
import { useEngineStatus } from "./hooks";
import { Keycap, useHeldKeys } from "./keycaps";
import { LiveTerminal } from "./live-terminal";

/** The hero's buttons, for the first tracks in order. */
const HERO_LABELS = ["Start from zero", "I know tmux", "I know zellij"];

/** What the hero terminal plays by itself once it is up. */
const HERO_DEMO: SetupCommand[] = [
  { command: "newWindow", wait: 450 },
  { command: "mode", args: ["terminal"], wait: 250 },
  { command: "type", args: ["neofetch\r"], wait: 1500 },
  { input: "\x02|", wait: 700 },
  { command: "type", args: ["ls\r"], wait: 1100 },
  { input: "\x02-", wait: 700 },
  { command: "type", args: ["colors\r"], wait: 300 },
];

export function Hub({
  progress,
  onStart,
  onPlay,
}: {
  progress: Progress;
  onStart: (track: Track) => void;
  onPlay: () => void;
}) {
  const onReady = useCallback(async (t: TuiosInstance) => {
    await new Promise<void>((resolve) => t.onFirstFrame(resolve));
    await runSetup(t, HERO_DEMO, () => t.exited());
  }, []);

  return (
    <>
      <section className="hero-wash">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-12 text-center md:px-6 md:pt-16">
          <span className="fade-up inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card/70 py-1 pr-3 pl-1 font-mono text-xs backdrop-blur">
            <span className="rounded-full bg-fd-primary px-2 py-0.5 text-fd-primary-foreground">
              Live
            </span>
            <span className="text-fd-muted-foreground">
              The real tuios, running in this tab
            </span>
          </span>
          <h1 className="fade-up mt-6 font-bold text-4xl leading-[1.08] [animation-delay:60ms] md:text-6xl">
            Learn tuios in 5 minutes.
            <br />
            <span className="learn-gradient-text">In your browser.</span>
          </h1>
          <p className="fade-up mt-5 max-w-xl text-fd-muted-foreground text-lg [animation-delay:120ms]">
            Press real keys, watch real windows move. Nothing to install,
            nothing to break.
          </p>
          <div className="fade-up mt-7 flex flex-col items-center gap-3 [animation-delay:180ms] sm:flex-row">
            {tracks.slice(0, HERO_LABELS.length).map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onStart(t)}
                className={
                  i === 0
                    ? "group inline-flex items-center gap-3 rounded-xl bg-fd-primary py-2 pr-4 pl-2 font-medium font-mono text-fd-primary-foreground text-sm shadow-fd-primary/25 shadow-lg transition-transform hover:-translate-y-0.5"
                    : "group inline-flex items-center gap-3 rounded-xl border border-fd-border bg-fd-background/60 py-2 pr-4 pl-2 font-medium font-mono text-sm transition-colors hover:border-fd-primary/50"
                }
              >
                <kbd
                  className={`inline-flex size-7 items-center justify-center rounded-md font-mono text-xs ${
                    i === 0
                      ? "bg-black/15"
                      : "border border-fd-border bg-fd-card"
                  }`}
                >
                  {i + 1}
                </kbd>
                {HERO_LABELS[i]}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>

        <div className="fade-up mx-auto mt-10 w-full max-w-5xl px-4 [animation-delay:240ms] md:px-6">
          <WindowChrome>
            <LiveTerminal
              className="h-[340px] rounded-t-none border-t-0 md:h-[460px]"
              fontSize={13}
              onReady={onReady}
              label="tuios, running live. Click to try it."
            />
          </WindowChrome>
          <HeroCaption />
        </div>
      </section>

      <section
        id="tracks"
        className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 pt-16 md:px-6"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-fd-primary text-sm">Pick a track</p>
            <h2 className="mt-2 font-bold text-2xl md:text-3xl">
              What do your fingers know?
            </h2>
          </div>
          <p className="hidden font-mono text-fd-muted-foreground text-xs sm:block">
            press <Keycap label="1" size="sm" /> to{" "}
            <Keycap label={String(tracks.length)} size="sm" />, or{" "}
            <Keycap label="0" size="sm" /> to play
          </p>
        </div>
        <div
          className={`mt-8 grid gap-4 sm:grid-cols-2 ${tracks.length > 2 ? "lg:grid-cols-3" : ""}`}
        >
          {tracks.map((t, i) => (
            <TrackCard
              key={t.id}
              track={t}
              index={i}
              progress={progress[t.id]}
              onStart={() => onStart(t)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onPlay}
          className="group mt-4 flex w-full flex-col items-start gap-4 rounded-2xl border border-fd-border border-dashed bg-fd-card/60 p-5 text-left transition-all duration-200 hover:border-fd-primary/60 hover:bg-fd-card sm:flex-row sm:items-center"
        >
          <Keycap label="0" />
          <div>
            <h3 className="font-bold text-xl">
              Free play{" "}
              <Gamepad2 className="ml-1 inline size-5 text-[var(--brand-a)]" />
            </h3>
            <p className="mt-1 text-fd-muted-foreground text-sm">
              No steps, no timer. The real tuios and a cheat sheet you can
              click.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-sm sm:ml-auto">
            Play
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </button>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pt-20 pb-24 md:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Fact icon={<Cpu />} title="The real tuios">
            The same Go code you install, compiled to WebAssembly.
          </Fact>
          <Fact icon={<SquareTerminal />} title="A pretend shell">
            Try <code>ls</code>, <code>cat</code>, <code>neofetch</code>,{" "}
            <code>top</code> or <code>rain</code>. Nothing can break.
          </Fact>
          <Fact icon={<Lock />} title="Stays in your browser">
            No account, no tracking. Nothing is sent anywhere.
          </Fact>
        </div>
      </section>
    </>
  );
}

function WindowChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl shadow-2xl shadow-fd-primary/15">
      <div className="flex h-9 items-center gap-2 rounded-t-xl border border-[#2a2a3c] border-b-0 bg-[#181825] px-4">
        <span className="size-3 rounded-full bg-[#f38ba8]/80" />
        <span className="size-3 rounded-full bg-[#f9e2af]/80" />
        <span className="size-3 rounded-full bg-[#a6e3a1]/80" />
        <span className="mx-auto pr-12 font-mono text-[#7f849c] text-xs">
          guest@tuios: ~
        </span>
      </div>
      {children}
    </div>
  );
}

/** Under the hero: the ctrl+b warm-up while it loads, then an invitation. */
function HeroCaption() {
  const status = useEngineStatus();
  const held = useHeldKeys();
  const ctrl = held.has("ctrl");
  const b = held.has("b");
  const loading = status.phase === "loading" || status.phase === "idle";
  return (
    <div className="mt-4 flex min-h-10 flex-wrap items-center justify-center gap-2 text-center font-mono text-fd-muted-foreground text-sm">
      {loading ? (
        <>
          <span>While it loads, press</span>
          <Keycap label="ctrl" size="sm" held={ctrl} />
          <span>+</span>
          <Keycap label="b" size="sm" held={b} />
          <span className={ctrl && b ? "learn-pop text-[var(--brand-a)]" : ""}>
            {ctrl && b
              ? "That is the leader key. Nice."
              : "the key tuios is built around."}
          </span>
        </>
      ) : status.phase === "ready" ? (
        <span>It is live. Click in and play, or pick a track below.</span>
      ) : null}
    </div>
  );
}

function TrackCard({
  track,
  index,
  progress,
  onStart,
}: {
  track: Track;
  index: number;
  progress?: Progress[string];
  onStart: () => void;
}) {
  const total = track.steps.length;
  const done = Math.min(total, progress?.done.length ?? 0);
  return (
    <button
      type="button"
      onClick={onStart}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-fd-primary/60 hover:shadow-fd-primary/10 hover:shadow-xl"
    >
      <MiniTiles seed={index} />
      <div className="flex items-center gap-3">
        <Keycap label={String(index + 1)} />
        <span className="rounded-full border border-fd-border px-2.5 py-0.5 font-mono text-fd-muted-foreground text-xs">
          {track.audience}
        </span>
      </div>
      <h3 className="mt-5 font-bold text-xl">{track.title}</h3>
      <p className="mt-1.5 text-fd-muted-foreground text-sm leading-relaxed">
        {track.blurb}
      </p>
      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between font-mono text-fd-muted-foreground text-xs">
          <span>
            {total} steps · {track.minutes} min
          </span>
          {progress?.finished && progress.best ? (
            <span className="inline-flex items-center gap-1 text-[var(--brand-a)]">
              <Trophy className="size-3.5" />
              best {formatTime(progress.best)}
            </span>
          ) : done > 0 ? (
            <span>
              {done}/{total}
            </span>
          ) : null}
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fd-border/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--brand-a)] to-[var(--brand-b)] transition-[width] duration-500"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
        <span className="mt-4 inline-flex items-center gap-1.5 font-mono font-semibold text-sm">
          {progress?.finished ? (
            <>
              <Check className="size-4 text-[#9ece6a]" /> Play again
            </>
          ) : (
            "Start"
          )}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
}

/** A small BSP layout in the card corner, different per card. */
function MiniTiles({ seed }: { seed: number }) {
  const layouts = [
    [
      [0, 0, 50, 100],
      [50, 0, 50, 50],
      [50, 50, 50, 50],
    ],
    [
      [0, 0, 100, 50],
      [0, 50, 50, 50],
      [50, 50, 50, 50],
    ],
    [
      [0, 0, 33, 100],
      [33, 0, 67, 60],
      [33, 60, 67, 40],
    ],
  ];
  const rects = layouts[seed % layouts.length];
  return (
    <div
      aria-hidden
      className="absolute top-5 right-5 h-12 w-20 opacity-60 transition-opacity group-hover:opacity-100"
    >
      {rects.map(([x, y, w, h], i) => (
        <div
          key={`${x}-${y}`}
          className="absolute p-[2px]"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${w}%`,
            height: `${h}%`,
          }}
        >
          <div
            className="h-full rounded-[3px] border"
            style={{
              borderColor: i === 0 ? "var(--brand-a)" : "var(--brand-b)",
              background:
                i === 0
                  ? "color-mix(in oklab, var(--brand-a) 18%, transparent)"
                  : "color-mix(in oklab, var(--brand-b) 10%, transparent)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function Fact({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-fd-border bg-fd-card p-5 [&_code]:rounded [&_code]:bg-fd-accent/60 [&_code]:px-1 [&_code]:text-[0.8125rem]">
      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary [&_svg]:size-4.5">
        {icon}
      </span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1.5 text-fd-muted-foreground text-sm leading-relaxed">
        {children}
      </p>
    </div>
  );
}
