/**
 * The lesson engine: which step is current, what the reader has pressed of
 * it, whether they look stuck, and how long it took. It is plain data and
 * functions so it can be tested against recorded event logs, and the React
 * side only renders it.
 */
import { isAltChord, sameChord } from "./keys";
import type { MatchContext, Track, TuiosEvent, TuiosState } from "./types";

/** Seconds of no progress before the hint shows, and before Show me glows. */
export const HINT_AFTER = 8;
export const SHOW_ME_AFTER = 20;
/** Wrong keys before the hint shows early. */
export const HINT_AFTER_WRONG = 2;
/**
 * Seconds, or other keys, before the page says an alt chord may be taken by
 * something outside the browser.
 */
export const ALT_BLOCKED_AFTER = 8;
export const ALT_BLOCKED_AFTER_KEYS = 3;

export type StepResult = "clean" | "hinted" | "skipped";

export type LessonState = {
  track: Track;
  index: number;
  /** How many of the step's keys have been pressed in order. */
  pressed: number;
  wrong: number;
  hinted: boolean;
  /** Set when the last key was a step key pressed in the wrong mode. */
  wrongMode: boolean;
  /** Keys tuios read during this step, and whether any was an alt chord. */
  keysSeen: number;
  altSeen: boolean;
  results: StepResult[];
  ctx: MatchContext;
  startedAt: number;
  stepStartedAt: number;
  /** Last time the reader made progress, for the hint timer. */
  activeAt: number;
  finishedAt: number | null;
};

export function startLesson(track: Track, now: number): LessonState {
  return {
    track,
    index: 0,
    pressed: 0,
    wrong: 0,
    hinted: false,
    wrongMode: false,
    keysSeen: 0,
    altSeen: false,
    results: [],
    ctx: { lastAction: "", state: null, mem: {} },
    startedAt: now,
    stepStartedAt: now,
    activeAt: now,
    finishedAt: null,
  };
}

export function currentStep(s: LessonState) {
  return s.track.steps[s.index] ?? null;
}

export function isFinished(s: LessonState) {
  return s.finishedAt !== null;
}

/** Move to the next step, recording how this one went. */
export function advance(
  s: LessonState,
  result: StepResult,
  now: number,
): LessonState {
  const results = [...s.results, result];
  const index = s.index + 1;
  const done = index >= s.track.steps.length;
  return {
    ...s,
    index,
    pressed: 0,
    wrong: 0,
    hinted: false,
    wrongMode: false,
    keysSeen: 0,
    altSeen: false,
    results,
    ctx: { lastAction: "", state: s.ctx.state, mem: {} },
    stepStartedAt: now,
    activeAt: now,
    finishedAt: done ? now : null,
  };
}

export type FeedResult = { state: LessonState; completed: boolean };

/** Feed one tuios event. `completed` is true when it finished the step. */
export function feed(
  s: LessonState,
  event: TuiosEvent,
  now: number,
): FeedResult {
  const step = currentStep(s);
  if (!step || s.finishedAt !== null) return { state: s, completed: false };

  let next: LessonState = s;
  const ctx = s.ctx;
  if (event.state) ctx.state = event.state;

  if (event.type === "key") {
    const key = String(event.data?.key ?? "");
    const mode = String(event.data?.mode ?? "");
    // The action event, if the key has one, comes right after it.
    ctx.lastAction = "";
    next = trackKeys(s, key, mode, now);
    next = {
      ...next,
      keysSeen: next.keysSeen + 1,
      altSeen: next.altSeen || isAltChord(key),
    };
  } else if (event.type === "action") {
    ctx.lastAction = String(event.data?.name ?? "");
  }

  if (!step.explainer && step.done?.(event, ctx)) {
    return {
      state: advance(next, next.hinted ? "hinted" : "clean", now),
      completed: true,
    };
  }
  return { state: next, completed: false };
}

/**
 * Light the step's keycaps as they are pressed in order, and count keys that
 * do something else as wrong. Typed text is matched as a whole when the shell
 * reports the command, so it only lights the caps up to it.
 */
function trackKeys(
  s: LessonState,
  key: string,
  mode: string,
  now: number,
): LessonState {
  const step = currentStep(s);
  if (!step) return s;
  // A step key pressed in the other mode went to the wrong place: in
  // typing mode, "n" is just a letter for the shell.
  const isStepKey = step.keys.some(
    (k) => typeof k === "string" && sameChord(key, k),
  );
  if (step.needs && mode && mode !== step.needs && isStepKey) {
    const wrong = s.wrong + 1;
    return { ...s, pressed: 0, wrong, wrongMode: true, hinted: true };
  }
  const wanted = step.keys[s.pressed];
  if (typeof wanted === "string" && sameChord(key, wanted)) {
    return { ...s, pressed: s.pressed + 1, activeAt: now, wrongMode: false };
  }
  if (typeof wanted === "object") {
    // Typing: every key is fine while the reader types the text.
    return { ...s, activeAt: now, wrongMode: false };
  }
  const first = step.keys[0];
  if (typeof first === "string" && sameChord(key, first)) {
    // Starting over counts as progress.
    return { ...s, pressed: 1, activeAt: now, wrongMode: false };
  }
  const wrong = s.wrong + 1;
  return {
    ...s,
    pressed: 0,
    wrong,
    wrongMode: false,
    hinted: s.hinted || wrong >= HINT_AFTER_WRONG,
  };
}

/** Where the reader is on the hint ladder. */
export function hintLevel(s: LessonState, now: number): 0 | 1 | 2 {
  const idle = (now - s.activeAt) / 1000;
  if (idle >= SHOW_ME_AFTER) return 2;
  if (s.hinted || idle >= HINT_AFTER || s.wrongMode) return 1;
  return 0;
}

/**
 * Whether the step waits on an alt chord that never arrives: the next key is
 * an alt chord, tuios has read no alt chord this step, and the reader has
 * either waited ALT_BLOCKED_AFTER seconds or pressed other keys. A window
 * manager such as AeroSpace binds alt and a letter system wide, and then the
 * browser never sees the key at all.
 */
export function altChordBlocked(s: LessonState, now: number): boolean {
  const step = currentStep(s);
  if (!step || step.explainer || s.finishedAt !== null || s.altSeen) {
    return false;
  }
  const wanted = step.keys[s.pressed];
  if (typeof wanted !== "string" || !isAltChord(wanted)) return false;
  return (
    now - s.stepStartedAt >= ALT_BLOCKED_AFTER * 1000 ||
    s.keysSeen >= ALT_BLOCKED_AFTER_KEYS
  );
}

/** Mark the hint as seen, so the step counts as hinted. */
export function markHinted(s: LessonState): LessonState {
  return s.hinted ? s : { ...s, hinted: true };
}

/** The state the lesson last saw, or the one tuios reports now. */
export function lastState(s: LessonState): TuiosState | null {
  return s.ctx.state;
}

/** Seconds the lesson took, or has taken so far. */
export function elapsed(s: LessonState, now: number) {
  return Math.max(0, Math.round(((s.finishedAt ?? now) - s.startedAt) / 1000));
}

/** "3:41". */
export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
