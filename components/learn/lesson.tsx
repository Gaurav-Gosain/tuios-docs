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
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  advance,
  altChordBlocked,
  currentStep,
  elapsed,
  feed,
  formatTime,
  hintLevel,
  isFinished,
  type LessonState,
  markHinted,
  startLesson,
} from "@/lib/learn/engine";
import { chordParts, keyBytes } from "@/lib/learn/keys";
import { markFinished, markStep } from "@/lib/learn/progress";
import { runSetup, sleep, type TuiosInstance } from "@/lib/learn/runtime";
import { playSound } from "@/lib/learn/sound";
import { nudgeFor, TillyScript } from "@/lib/learn/tilly";
import { hush, say } from "@/lib/learn/tilly-store";
import type { Step, Track, TuiosEvent, TuiosState } from "@/lib/learn/types";
import { ExplainerArt } from "./explainer-art";
import { FinishPanel } from "./finish-panel";
import { useModalOverlay, useReducedMotion, useTicker } from "./hooks";
import { KeySequence, useHeldKeys } from "./keycaps";
import { LiveTerminal } from "./live-terminal";
import { ModeBadge } from "./mode-badge";
import { TillyControls, TillyGuide, usePrefs } from "./tilly";

/** How many rows the keys learned list shows. */
const SHELF_ROWS = 5;

/** Events this soon after a step starts belong to the step before it. */
const SETTLE_MS = 150;

type Phase = "booting" | "running" | "finished";

/**
 * One track, full screen: the live terminal, the step card beside it, and the
 * finish panel at the end.
 */
export function Lesson({
  track,
  onExit,
  onRestart,
  onPickTrack,
  onProgress,
}: {
  track: Track;
  onExit: () => void;
  onRestart: () => void;
  onPickTrack: (id: string) => void;
  onProgress: () => void;
}) {
  const reduced = useReducedMotion();
  const held = useHeldKeys();
  const [sim, setSim] = useState<Set<string>>(() => new Set());
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const [tstate, setTstate] = useState<TuiosState | null>(null);
  const [phase, setPhase] = useState<Phase>("booting");
  // A step just completed. The card shows a tick; Tilly does the praising, and
  // when Tilly is hidden the card adds a plain "Done" so the reader still sees it.
  const [justDone, setJustDone] = useState(false);
  const prefs = usePrefs();
  const [termFocused, setTermFocused] = useState(false);
  const [leftTerminal, setLeftTerminal] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  // Steps whose "alt chords not arriving" note the reader closed.
  const [altNoteClosed, setAltNoteClosed] = useState<Set<string>>(
    () => new Set(),
  );

  const lessonRef = useRef<LessonState>(startLesson(track, Date.now()));
  const tuiosRef = useRef<TuiosInstance | null>(null);
  const phaseRef = useRef<Phase>("booting");
  const settleUntil = useRef(0);
  const busy = useRef(false);
  const skipping = useRef(false);
  const alive = useRef(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const [script] = useState(() => new TillyScript());
  // The nudges Tilly already gave, as "step:kind", so each comes once.
  const nudged = useRef(new Set<string>());

  useTicker(phase === "running", 1000);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
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

  const startStep = useCallback(
    async (index: number) => {
      const t = tuiosRef.current;
      const step = track.steps[index];
      if (!t || !step || !alive.current) return;
      settleUntil.current = performance.now() + SETTLE_MS;
      lessonRef.current = {
        ...lessonRef.current,
        stepStartedAt: Date.now(),
        activeAt: Date.now(),
      };
      rerender();
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
      await runSetup(t, step.setup, () => !alive.current);
      // A setup can take a moment. Its own events are not the reader's.
      settleUntil.current = performance.now() + SETTLE_MS;
    },
    [track, focusTerminal],
  );

  const stepDone = useCallback(
    (index: number, event: TuiosEvent | null = null, lastAction = "") => {
      const t = tuiosRef.current;
      const step = track.steps[index];
      // The rest of this update's events, such as the focus change that
      // follows a new window, belong to the step that just finished.
      settleUntil.current = performance.now() + SETTLE_MS;
      if (skipping.current) {
        skipping.current = false;
        const results = [...lessonRef.current.results];
        results[index] = "skipped";
        lessonRef.current = { ...lessonRef.current, results };
      }
      if (step) markStep(track.id, step.id);
      onProgress();
      const finished = isFinished(lessonRef.current);
      const args: string[] = [];
      if (finished) args.push("big");
      if (reducedRef.current) args.push("still");
      t?.api.command("celebrate", ...args);
      const results = lessonRef.current.results;
      if (finished) {
        say(script.finish(track, results));
      } else if (step) {
        say(
          script.react({
            step,
            event,
            lastAction,
            result: results[index] ?? "clean",
          }),
        );
      }
      setJustDone(true);
      setTimeout(() => alive.current && setJustDone(false), 900);
      rerender();
      if (finished) {
        markFinished(track.id, elapsed(lessonRef.current, Date.now()));
        onProgress();
        phaseRef.current = "finished";
        setTimeout(() => alive.current && setPhase("finished"), 1700);
      } else {
        setTimeout(() => startStep(index + 1), 700);
      }
    },
    [track, onProgress, startStep, script],
  );

  const onEvent = useCallback(
    (event: TuiosEvent) => {
      if (event.state) setTstate(event.state);
      if (phaseRef.current !== "running") return;
      if (performance.now() < settleUntil.current) return;
      if (event.type === "mode") {
        playSound(
          event.data?.to === "terminal" ? "tickTerminal" : "tickWindow",
        );
      }
      const before = lessonRef.current.index;
      // feed records the action on this context; advancing starts a new one.
      const ctx = lessonRef.current.ctx;
      const { state, completed } = feed(lessonRef.current, event, Date.now());
      lessonRef.current = state;
      if (completed) stepDone(before, event, ctx.lastAction);
      else if (event.type === "key") rerender();
    },
    [stepDone],
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
      await runSetup(t, track.setup, () => !alive.current);
      if (!alive.current) return;
      lessonRef.current = startLesson(track, Date.now());
      phaseRef.current = "running";
      setPhase("running");
      startStep(0);
      say(script.greet(track));
    },
    [onEvent, startStep, track, script],
  );

  /** Type the step's keys for the reader, lighting each cap as it goes. */
  const play = useCallback(
    async (fast: boolean) => {
      const t = tuiosRef.current;
      const lesson = lessonRef.current;
      const step = currentStep(lesson);
      if (!t || !step || busy.current) return;
      busy.current = true;
      focusTerminal();
      if (lacksWindow(step, t.api.state())) {
        t.api.command("newWindow");
        await sleep(fast ? 150 : 400);
      }
      const mode = t.api.state().mode;
      if (step.needs && step.needs !== mode) {
        t.api.command("mode", step.needs);
        await sleep(fast ? 80 : 300);
      }
      const hold = fast ? 90 : 380;
      const between = fast ? 60 : 260;
      const typeDelay = fast ? 12 : 55;
      // Once the step is done, the keys left over belong to no step.
      const moved = () => lessonRef.current.index !== lesson.index;
      if (step.showMe) {
        for (const ch of step.showMe) {
          if (moved()) break;
          t.api.input(ch);
          await sleep(typeDelay);
        }
      } else {
        for (const item of step.keys.slice(lesson.pressed)) {
          if (moved()) break;
          if (typeof item === "string") {
            setSim(new Set(chordParts(item)));
            t.api.input(keyBytes(item));
            await sleep(hold);
            setSim(new Set());
          } else {
            for (const ch of item.text) {
              t.api.input(ch);
              await sleep(typeDelay);
            }
          }
          await sleep(between);
        }
      }
      busy.current = false;
    },
    [focusTerminal],
  );

  const showMe = () => {
    lessonRef.current = markHinted(lessonRef.current);
    rerender();
    play(false);
  };

  const skip = () => {
    const index = lessonRef.current.index;
    const step = currentStep(lessonRef.current);
    if (!step) return;
    if (step.explainer) {
      gotIt("skipped");
      return;
    }
    skipping.current = true;
    play(true);
    // If playing the keys did not finish it, move on anyway.
    setTimeout(() => {
      if (!alive.current || lessonRef.current.index !== index) return;
      lessonRef.current = advance(lessonRef.current, "skipped", Date.now());
      skipping.current = false;
      stepDone(index);
    }, 2500);
  };

  const gotIt = (result: "clean" | "skipped" = "clean") => {
    const index = lessonRef.current.index;
    lessonRef.current = advance(lessonRef.current, result, Date.now());
    stepDone(index);
  };

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

  const lesson = lessonRef.current;
  const step = currentStep(lesson);
  const now = Date.now();
  const level =
    phase === "running" && step && !step.explainer ? hintLevel(lesson, now) : 0;
  const altBlocked =
    phase === "running" &&
    !!step &&
    !altNoteClosed.has(step.id) &&
    altChordBlocked(lesson, now);
  const noWindow = !!step && lacksWindow(step, tstate);
  const nudge =
    phase === "running" && step && !step.explainer
      ? nudgeFor({
          level,
          wrong: lesson.wrong,
          wrongMode: lesson.wrongMode,
          needs: step.needs,
          noWindow,
          altBlocked,
        })
      : null;
  const allHeld = new Set([...held, ...sim]);
  const stepIndex = lesson.index;

  // Tilly speaks up once per kind of trouble in a step, reusing what the
  // card already works out: the hint ladder, the wrong mode, no window and
  // the alt chord note.
  useEffect(() => {
    if (!nudge) return;
    const id = `${stepIndex}:${nudge}`;
    if (nudged.current.has(id)) return;
    nudged.current.add(id);
    say(script.nudge(nudge));
  }, [nudge, stepIndex, script]);
  const seconds = phase === "booting" ? 0 : elapsed(lesson, now);
  const doneCount = lesson.results.length;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[60] flex flex-col bg-fd-background"
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
          {/* biome-ignore lint/performance/noImgElement: a static icon in a static export */}
          <img src="/tuios-icon.png" alt="" width={22} height={22} />
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
            const r = lesson.results[i];
            const current = i === lesson.index && phase !== "finished";
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
            onReady={onReady}
            onFocusChange={(f) => {
              setTermFocused(f);
              if (f) setLeftTerminal(false);
            }}
            label={`tuios, running live. Current step: ${step?.title ?? "done"}`}
          >
            {phase === "running" && step && !step.explainer && !termFocused ? (
              <button
                type="button"
                onClick={focusTerminal}
                className="learn-pop absolute bottom-5 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-[#1e1e2e]/90 px-4 py-2 font-mono text-[#cdd6f4] text-sm shadow-xl backdrop-blur transition-colors hover:border-[#bb9af7]"
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
                    ? `STEP ${lesson.index + 1} / ${track.steps.length}`
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
                        onClick={() => gotIt()}
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
                        pressed={lesson.pressed}
                        held={allHeld}
                        pulseNext={level >= 1}
                      />
                    </div>
                    {lacksWindow(step, tstate) ? (
                      <p className="learn-fade rounded-lg border border-[#e0af68]/40 bg-[#e0af68]/10 px-3 py-2 text-sm">
                        No window open. Press{" "}
                        <kbd className="lk" data-size="sm">
                          n
                        </kbd>{" "}
                        to open one.
                      </p>
                    ) : lesson.wrongMode ? (
                      <p className="learn-fade rounded-lg border border-[#e0af68]/40 bg-[#e0af68]/10 px-3 py-2 text-sm">
                        {step.needs === "window"
                          ? "You are typing into the shell. Press ctrl+b, then esc, to get to window mode."
                          : "You are in window mode. Press i to type into the shell."}
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
                        disabled={phase !== "running"}
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
                        disabled={phase !== "running"}
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
                {phase === "finished" && !panelOpen ? (
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

          <LearnedShelf track={track} lesson={lesson} />

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

      {phase === "finished" && panelOpen ? (
        <FinishPanel
          track={track}
          lesson={lesson}
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

/**
 * True when the step works on a window and there is none, such as after the
 * reader pressed x on the last one or typed exit. A step that opens one with n
 * is fine with none. A step with no mode set may be the one that moves to an
 * empty workspace, so it only counts when there is no window anywhere.
 */
function lacksWindow(step: Step, state: TuiosState | null): boolean {
  if (!state || step.explainer || step.keys.includes("n")) return false;
  return step.needs ? state.windows === 0 : state.totalWindows === 0;
}

function LearnedShelf({
  track,
  lesson,
}: {
  track: Track;
  lesson: LessonState;
}) {
  const learned = track.steps
    .slice(0, lesson.results.length)
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
