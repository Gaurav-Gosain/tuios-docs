"use client";

import {
  ArrowRight,
  Check,
  Clock,
  Eye,
  MousePointerClick,
  RotateCcw,
  SkipForward,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand";
import { chordParts } from "@/lib/learn/keys";
import {
  elapsed,
  formatTime,
  initialView,
  type LessonView,
  lessonReduce,
} from "@/lib/learn/lesson-state";
import type { Track } from "@/lib/learn/lessons";
import { markFinished, markStep } from "@/lib/learn/progress";
import type { TuiosInstance } from "@/lib/learn/runtime";
import { playSound } from "@/lib/learn/sound";
import { isNudge, TillyScript } from "@/lib/learn/tilly";
import { hush, say } from "@/lib/learn/tilly-store";
import type {
  LessonDoneData,
  LessonStepData,
  StepResult,
  TuiosEvent,
  TuiosState,
} from "@/lib/learn/types";
import { ExplainerArt } from "./explainer-art";
import { FinishPanel } from "./finish-panel";
import { useModalOverlay, useReducedMotion, useTicker } from "./hooks";
import { KeySequence, useHeldKeys } from "./keycaps";
import { LiveTerminal } from "./live-terminal";
import { ModeBadge } from "./mode-badge";
import { TillyControls, TillyGuide, usePrefs } from "./tilly";

/** How many rows the keys learned list shows. */
const SHELF_ROWS = 5;

/** The least time the card shows a finished step, with its tick. */
const DONE_MS = 700;

/** How long the finished lesson plays before the finish panel opens. */
const FINISH_MS = 1700;

/**
 * One track, full screen: the live terminal, the step card beside it, and the
 * finish panel at the end. The lesson engine runs in tuios: this page starts
 * it with tuios.lesson("start"), draws the lesson.* events it sends, and
 * passes on Show me, Skip and Got it. It keeps no step logic.
 */
export function Lesson({
  track,
  onExit,
  onRestart,
  onPickTrack,
  onProgress,
  resumeFrom = 0,
}: {
  /** Steps already done on an earlier visit. The engine plays them quickly. */
  resumeFrom?: number;
  track: Track;
  onExit: () => void;
  onRestart: () => void;
  onPickTrack: (id: string) => void;
  onProgress: () => void;
}) {
  const reduced = useReducedMotion();
  const held = useHeldKeys();
  const [sim, setSim] = useState<Set<string>>(() => new Set());
  const [tstate, setTstate] = useState<TuiosState | null>(null);
  const [view, setView] = useState<LessonView>(initialView);
  // A step just completed. The card shows a tick; Tilly does the praising, and
  // when Tilly is hidden the card adds a plain "Done" so the reader still sees it.
  const [justDone, setJustDone] = useState(false);
  const prefs = usePrefs();
  const [termFocused, setTermFocused] = useState(false);
  const [leftTerminal, setLeftTerminal] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  // Steps whose "alt chords not arriving" note the reader closed.
  const [altNoteClosed, setAltNoteClosed] = useState<Set<string>>(
    () => new Set(),
  );

  const viewRef = useRef<LessonView>(initialView);
  const tuiosRef = useRef<TuiosInstance | null>(null);
  const alive = useRef(true);
  // Events held back while a finished step's card shows its tick.
  const holdUntil = useRef(0);
  const held_ = useRef<TuiosEvent[]>([]);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const [script] = useState(() => new TillyScript());
  // The nudges Tilly already gave, as "step:kind", so each comes once.
  const nudged = useRef(new Set<string>());

  useTicker(view.phase === "running", 1000);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (flushTimer.current) clearTimeout(flushTimer.current);
      try {
        tuiosRef.current?.api.lesson("stop");
      } catch {
        // The program is gone already.
      }
      hush();
    };
  }, []);

  const focusTerminal = useCallback(() => {
    tuiosRef.current?.term.focus();
    setLeftTerminal(false);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    focusTerminal();
  }, [focusTerminal]);

  const lesson = useCallback((cmd: string, ...args: string[]) => {
    const err = tuiosRef.current?.api.lesson(cmd, ...args);
    if (err) console.warn(`tuios.lesson(${cmd}): ${err}`);
  }, []);

  /** What the page does beyond the card for one lesson event. */
  const sideEffects = useCallback(
    (event: TuiosEvent, before: LessonView) => {
      const t = tuiosRef.current;
      const d = event.data ?? {};
      switch (event.type) {
        case "lesson.start":
          if (!Number(d.from ?? 0)) say(script.greet(track));
          break;
        case "lesson.step": {
          const step = d as unknown as LessonStepData;
          if (step.explainer) {
            setTimeout(
              () =>
                cardRef.current
                  ?.querySelector<HTMLElement>("[data-primary]")
                  ?.focus(),
              50,
            );
          } else {
            focusTerminal();
          }
          break;
        }
        case "lesson.press": {
          const chord = String(d.chord ?? "");
          setSim(d.down ? new Set(chordParts(chord)) : new Set());
          break;
        }
        case "lesson.hint": {
          const nudge = String(d.nudge ?? "");
          if (!nudge || !isNudge(nudge)) break;
          const id = `${d.index}:${nudge}`;
          if (nudged.current.has(id)) break;
          nudged.current.add(id);
          say(script.nudge(nudge));
          break;
        }
        case "lesson.done": {
          const done = d as unknown as LessonDoneData;
          markStep(track.id, done.id);
          onProgress();
          const args: string[] = [];
          if (done.finished) args.push("big");
          if (reducedRef.current) args.push("still");
          t?.api.command("celebrate", ...args);
          if (done.finished) {
            say(script.finish(track, done.results ?? []));
          } else {
            say(
              script.react({
                explainer: !!before.step?.explainer,
                event: (done.event ?? null) as TuiosEvent | null,
                lastAction: done.lastAction,
                result: done.result,
              }),
            );
          }
          setJustDone(true);
          setTimeout(() => alive.current && setJustDone(false), 900);
          break;
        }
        case "lesson.finish":
          markFinished(track.id, Number(d.seconds ?? 0));
          onProgress();
          setTimeout(() => alive.current && setShowPanel(true), FINISH_MS);
          break;
      }
    },
    [track, script, onProgress, focusTerminal],
  );

  const apply = useCallback(
    (event: TuiosEvent) => {
      const before = viewRef.current;
      const next = lessonReduce(before, event);
      viewRef.current = next;
      if (next !== before) setView(next);
      sideEffects(event, before);
      if (event.type === "lesson.done") {
        holdUntil.current = performance.now() + DONE_MS;
      }
    },
    [sideEffects],
  );

  const flush = useCallback(() => {
    flushTimer.current = null;
    const rest = holdUntil.current - performance.now();
    if (rest > 0) {
      flushTimer.current = setTimeout(flush, rest);
      return;
    }
    while (held_.current.length && alive.current) {
      const e = held_.current.shift() as TuiosEvent;
      apply(e);
      if (holdUntil.current > performance.now()) {
        flushTimer.current = setTimeout(flush, DONE_MS);
        return;
      }
    }
  }, [apply]);

  const onEvent = useCallback(
    (event: TuiosEvent) => {
      if (event.state) setTstate(event.state);
      if (event.type === "mode") {
        playSound(
          event.data?.to === "terminal" ? "tickTerminal" : "tickWindow",
        );
      }
      if (!event.type.startsWith("lesson.")) return;
      // A finished step keeps its card, with the tick, a moment before the
      // next step's card replaces it. Show me's key presses still light caps.
      const waiting =
        held_.current.length > 0 || holdUntil.current > performance.now();
      if (waiting && event.type !== "lesson.press") {
        held_.current.push(event);
        if (!flushTimer.current) flushTimer.current = setTimeout(flush, 0);
        return;
      }
      apply(event);
    },
    [apply, flush],
  );

  const onReady = useCallback(
    async (t: TuiosInstance) => {
      tuiosRef.current = t;
      t.onEvent(onEvent);
      try {
        setTstate(t.api.state());
      } catch {
        // Not ready to answer yet; the first event fills it in.
      }
      await new Promise<void>((resolve) => t.onFirstFrame(resolve));
      if (!alive.current) return;
      if (resumeFrom > 0) lesson("start", track.id, String(resumeFrom));
      else lesson("start", track.id);
    },
    [onEvent, track, resumeFrom, lesson],
  );

  const showMe = () => {
    focusTerminal();
    lesson("showMe");
  };

  const skip = () => {
    focusTerminal();
    lesson("skip");
  };

  const gotIt = () => lesson("next");

  // Esc three times inside a second leaves the terminal. Esc alone is a real
  // tuios key, so it cannot be the way out.
  useEffect(() => {
    const times: number[] = [];
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (!stageRef.current?.contains(document.activeElement)) return;
      const now = performance.now();
      times.push(now);
      while (times.length && now - times[0] > 900) times.shift();
      if (times.length >= 3) {
        times.length = 0;
        tuiosRef.current?.term.blur();
        (document.activeElement as HTMLElement | null)?.blur?.();
        cardRef.current?.querySelector<HTMLElement>("button")?.focus();
        setLeftTerminal(true);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  // The page behind neither scrolls nor takes focus while the lesson is open.
  useModalOverlay(rootRef);

  const phase = view.phase;
  const step = view.step;
  const holdingCard = view.done;
  const shownIndex = view.index;
  const hint = view.hint;
  const level =
    phase === "running" && step && !step.explainer && !holdingCard
      ? (hint?.level ?? 0)
      : 0;
  const altBlocked =
    phase === "running" &&
    !holdingCard &&
    !!step &&
    !altNoteClosed.has(step.id) &&
    !!hint?.altBlocked;
  const noWindow = !holdingCard && !!hint?.noWindow;
  const waitingLine = !holdingCard && hint?.waiting ? step?.waiting : "";
  const allHeld = new Set([...held, ...sim]);
  const catching = view.catchingUp;
  const seconds = phase === "booting" ? 0 : elapsed(view, Date.now());
  const doneCount = view.results.length;
  const results: StepResult[] = view.results;
  const total = view.total || track.steps.length;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[60] flex flex-col bg-fd-background"
      // For tests/learn/tracks.mjs, which drives every track in a browser.
      data-learn-phase={phase}
      data-learn-step={view.index}
      data-learn-holding={holdingCard ? "" : undefined}
    >
      <header className="flex h-14 shrink-0 items-center gap-4 border-fd-border border-b px-4 md:px-6">
        <Link
          href="/learn"
          onClick={(e) => {
            e.preventDefault();
            onExit();
          }}
          className="flex items-center gap-2 font-mono font-semibold text-sm"
        >
          <BrandMark size={24} />
          <span>
            learn <span className="text-fd-muted-foreground">/</span>{" "}
            <span className="learn-gradient-text">{track.title}</span>
          </span>
        </Link>
        <ol
          className="mx-auto hidden items-center gap-1.5 md:flex"
          aria-label="Progress"
        >
          {track.steps.map((s, i) => {
            const r = results[i];
            const current = i === view.index && phase !== "finished";
            return (
              <li
                key={s.id}
                title={s.title}
                className={`h-2 rounded-full transition-all duration-300 ${
                  current ? "w-7 bg-[var(--brand-a)]" : "w-2"
                } ${
                  r === "clean"
                    ? "bg-[var(--brand-a)]"
                    : r === "hinted"
                      ? "bg-[var(--brand-b)]"
                      : r === "skipped"
                        ? "bg-fd-muted-foreground/40"
                        : current
                          ? ""
                          : "bg-fd-border"
                }`}
              />
            );
          })}
        </ol>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <span className="mr-1 inline-flex items-center gap-1.5 font-mono text-fd-muted-foreground text-sm tabular-nums sm:mr-2">
            <Clock className="size-3.5" />
            {formatTime(seconds)}
          </span>
          <TillyControls />
          <button
            type="button"
            onClick={onRestart}
            aria-label="Restart"
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-fd-muted-foreground text-xs transition-colors hover:bg-fd-accent hover:text-fd-foreground"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>
          <button
            type="button"
            onClick={onExit}
            aria-label="Leave"
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-fd-muted-foreground text-xs transition-colors hover:bg-fd-accent hover:text-fd-foreground"
          >
            <X className="size-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-5 lg:flex-row">
        <div className="relative min-h-0 min-w-0 flex-1">
          <LiveTerminal
            className="absolute inset-0"
            stageRef={stageRef}
            escapable={false}
            onReady={onReady}
            onFocusChange={(f) => {
              setTermFocused(f);
              if (f) setLeftTerminal(false);
            }}
            label={`tuios, running live. Current step: ${step?.title ?? "done"}`}
          >
            {catching !== null ? (
              <span className="learn-pop absolute top-5 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/15 bg-[#1e1e2e]/90 px-4 py-2 font-mono text-[#cdd6f4] text-sm shadow-xl backdrop-blur">
                Back to step {catching + 1}. Playing the steps you did.
              </span>
            ) : null}
            {phase === "running" &&
            step &&
            !step.explainer &&
            !termFocused &&
            catching === null ? (
              // It sits above tuios's last two rows: the window's bottom
              // border, with its mode label in the middle, and the dock.
              <button
                type="button"
                onClick={focusTerminal}
                className="learn-pop absolute bottom-20 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-[#1e1e2e]/90 px-4 py-2 font-mono text-[#cdd6f4] text-sm shadow-xl backdrop-blur transition-colors hover:border-[#bb9af7]"
              >
                <MousePointerClick className="size-4 text-[#bb9af7]" />
                {leftTerminal
                  ? "You are out. Click to go back in."
                  : "Click here, then press the keys"}
              </button>
            ) : null}
          </LiveTerminal>
        </div>

        <aside
          ref={cardRef}
          className="flex max-h-[46%] shrink-0 flex-col gap-4 overflow-y-auto lg:max-h-none lg:w-[380px]"
        >
          <div className="flex flex-col gap-5 rounded-xl border border-fd-border bg-fd-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-fd-muted-foreground text-xs tracking-widest">
                {phase === "booting"
                  ? "GETTING READY"
                  : step
                    ? `STEP ${shownIndex + 1} / ${total}`
                    : "DONE"}
              </span>
              {justDone ? (
                <span className="learn-pop inline-flex items-center gap-1 font-mono font-semibold text-[#9ece6a] text-sm">
                  <Check className="size-4" />
                  <span className={prefs.tillyHidden ? undefined : "sr-only"}>
                    Done
                  </span>
                </span>
              ) : null}
            </div>

            <ModeBadge state={tstate} />

            {step ? (
              <div key={step.id} className="learn-slide flex flex-col gap-4">
                <div>
                  <h2 className="font-bold text-2xl text-fd-foreground leading-tight">
                    {step.title}
                  </h2>
                  {step.note ? (
                    <p className="mt-1.5 text-fd-muted-foreground text-sm">
                      {step.note}
                    </p>
                  ) : null}
                </div>

                {step.explainer ? (
                  <div className="flex flex-col gap-3">
                    <KeySequence items={step.keys} size="md" />
                    <ExplainerArt art={step.explainer.art} />
                    <p className="text-fd-muted-foreground text-sm leading-relaxed">
                      {step.explainer.body}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        data-primary
                        onClick={gotIt}
                        className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-4 py-2 font-medium font-mono text-fd-primary-foreground text-sm transition-opacity hover:opacity-90"
                      >
                        Got it
                        <ArrowRight className="size-4" />
                      </button>
                      <a
                        href={step.explainer.href}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-fd-muted-foreground text-xs underline decoration-fd-primary/50 underline-offset-4 hover:text-fd-foreground"
                      >
                        {step.explainer.linkText}
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="py-1">
                      <KeySequence
                        items={step.keys}
                        size="xl"
                        pressed={holdingCard ? step.keys.length : view.pressed}
                        held={allHeld}
                        pulseNext={level >= 1}
                      />
                    </div>
                    {noWindow ? (
                      <p className="learn-fade rounded-lg border border-[#e0af68]/40 bg-[#e0af68]/10 px-3 py-2 text-sm">
                        No window open. Press{" "}
                        <kbd className="lk" data-size="sm">
                          n
                        </kbd>{" "}
                        to open one.
                      </p>
                    ) : view.wrongMode ? (
                      <p className="learn-fade rounded-lg border border-[#e0af68]/40 bg-[#e0af68]/10 px-3 py-2 text-sm">
                        {step.needs === "window"
                          ? "You are typing into the shell. Press ctrl+b, then esc, to get to window mode."
                          : "You are in window mode. Press i to type into the shell."}
                      </p>
                    ) : waitingLine ? (
                      <p className="learn-fade text-fd-muted-foreground text-sm leading-relaxed">
                        {waitingLine}
                      </p>
                    ) : level >= 1 ? (
                      <p className="learn-fade text-fd-muted-foreground text-sm leading-relaxed">
                        <span className="font-mono text-[var(--brand-a)]">
                          hint{" "}
                        </span>
                        {step.hint}
                      </p>
                    ) : null}
                    {altBlocked && step ? (
                      <div
                        role="note"
                        className="learn-fade flex items-start gap-2 rounded-lg border border-[#e0af68]/40 bg-[#e0af68]/10 px-3 py-2 text-sm"
                      >
                        <p className="flex-1 leading-relaxed">
                          Option chords not arriving? A window manager such as
                          AeroSpace, Rectangle or Raycast may be taking them.
                          Pause it or unbind the key, or rebind tuios.
                        </p>
                        <button
                          type="button"
                          aria-label="Close this note"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() =>
                            setAltNoteClosed((prev) =>
                              new Set(prev).add(step.id),
                            )
                          }
                          className="-mr-1 rounded p-0.5 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={showMe}
                        disabled={phase !== "running" || holdingCard}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 font-mono text-sm transition-colors disabled:opacity-50 ${
                          level >= 2
                            ? "learn-glow border-[var(--brand-a)] bg-[var(--brand-a)]/10 text-fd-foreground"
                            : "border-fd-border text-fd-muted-foreground hover:border-fd-primary/50 hover:text-fd-foreground"
                        }`}
                      >
                        <Eye className="size-4" />
                        Show me
                      </button>
                      <button
                        type="button"
                        onClick={skip}
                        disabled={phase !== "running" || holdingCard}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-fd-muted-foreground text-sm transition-colors hover:text-fd-foreground disabled:opacity-50"
                      >
                        <SkipForward className="size-4" />
                        Skip
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="learn-pop">
                <h2 className="font-bold text-2xl">All done!</h2>
                <p className="mt-1.5 text-fd-muted-foreground text-sm">
                  {doneCount} steps in {formatTime(seconds)}. Keep playing as
                  long as you like.
                </p>
                {phase === "finished" && showPanel && !panelOpen ? (
                  <button
                    type="button"
                    onClick={() => setPanelOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-fd-primary px-4 py-2 font-medium font-mono text-fd-primary-foreground text-sm transition-opacity hover:opacity-90"
                  >
                    Show my card
                    <ArrowRight className="size-4" />
                  </button>
                ) : null}
              </div>
            )}
          </div>

          <LearnedShelf track={track} done={doneCount} />

          <p className="hidden px-1 font-mono text-fd-muted-foreground text-xs lg:block">
            <kbd className="lk" data-size="sm">
              esc
            </kbd>{" "}
            <kbd className="lk" data-size="sm">
              esc
            </kbd>{" "}
            <kbd className="lk" data-size="sm">
              esc
            </kbd>{" "}
            leaves the terminal
          </p>

          <TillyGuide
            script={script}
            className="order-first lg:order-none lg:mt-auto"
          />
        </aside>
      </div>

      {phase === "finished" && showPanel && panelOpen ? (
        <FinishPanel
          track={track}
          lesson={view}
          script={script}
          onRestart={onRestart}
          onExit={onExit}
          onPickTrack={onPickTrack}
          onClose={closePanel}
        />
      ) : null}
    </div>
  );
}

function LearnedShelf({ track, done }: { track: Track; done: number }) {
  const learned = track.steps
    .slice(0, done)
    .filter((s) => s.learned && !s.explainer);
  if (learned.length === 0) return null;
  // The newest few, so the list stays short enough to keep the esc tip in view.
  const shown = learned.slice(-SHELF_ROWS);
  const older = learned.length - shown.length;
  return (
    <div className="rounded-xl border border-fd-border border-dashed p-4">
      <p className="font-mono text-fd-muted-foreground text-xs tracking-widest">
        KEYS LEARNED{older > 0 ? ` (${learned.length})` : ""}
      </p>
      <ul className="mt-3 grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-2">
        {shown.map((s) => (
          <li
            key={s.id}
            className="learn-pop col-span-2 grid grid-cols-subgrid items-start"
          >
            <span className="pt-0.5 text-fd-muted-foreground text-xs">
              {s.learned}
            </span>
            <KeySequence items={s.keys} size="sm" />
          </li>
        ))}
      </ul>
    </div>
  );
}
