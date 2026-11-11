/**
 * What the lesson card shows, folded from the `lesson.*` events the engine in
 * tuios sends. The engine decides when a step is done, when the hint shows and
 * when to offer Show me; the page keeps only what it needs to draw that.
 */
import type {
  LessonDoneData,
  LessonHintData,
  LessonStepData,
  StepResult,
  TuiosEvent,
} from "./types";

export type LessonView = {
  /** "booting" until lesson.start, "finished" after lesson.finish. */
  phase: "booting" | "running" | "finished";
  /** The step on the card, or null before the first and after the last. */
  step: LessonStepData | null;
  /** The index of the step on the card. */
  index: number;
  total: number;
  /** How many of the step's keycaps are lit. */
  pressed: number;
  /** Keys the reader pressed that are not the step's. */
  wrong: number;
  /** The reader is in the other mode from the one the step needs. */
  wrongMode: boolean;
  hint: LessonHintData | null;
  /** The step on the card is done, and the next one has not come yet. */
  done: boolean;
  results: StepResult[];
  /** The step the lesson resumes at, while the engine plays the ones before it. */
  catchingUp: number | null;
  /** When lesson.start came, from Date.now(). */
  startedAt: number;
  /** The engine's own count at lesson.finish. */
  seconds: number | null;
};

export const initialView: LessonView = {
  phase: "booting",
  step: null,
  index: 0,
  total: 0,
  pressed: 0,
  wrong: 0,
  wrongMode: false,
  hint: null,
  done: false,
  results: [],
  catchingUp: null,
  startedAt: 0,
  seconds: null,
};

/** Fold one event into the view. Events that are not the lesson's change nothing. */
export function lessonReduce(
  v: LessonView,
  e: TuiosEvent,
  now = Date.now(),
): LessonView {
  const d = (e.data ?? {}) as Record<string, unknown>;
  switch (e.type) {
    case "lesson.start": {
      const from = Number(d.from ?? 0);
      return {
        ...initialView,
        phase: "running",
        total: Number(d.total ?? 0),
        startedAt: now,
        catchingUp: from > 0 ? from : null,
      };
    }
    case "lesson.step": {
      const step = d as unknown as LessonStepData;
      return {
        ...v,
        step,
        index: step.index,
        total: step.total,
        pressed: 0,
        wrong: 0,
        wrongMode: false,
        hint: null,
        done: false,
        catchingUp:
          v.catchingUp !== null && step.index < v.catchingUp
            ? v.catchingUp
            : null,
      };
    }
    case "lesson.keys":
      if (Number(d.index) !== v.index) return v;
      return {
        ...v,
        pressed: Number(d.pressed ?? 0),
        wrong: Number(d.wrong ?? 0),
        wrongMode: !!d.wrongMode,
      };
    case "lesson.hint":
      if (Number(d.index) !== v.index) return v;
      return { ...v, hint: d as unknown as LessonHintData };
    case "lesson.done": {
      const done = d as unknown as LessonDoneData;
      return {
        ...v,
        done: true,
        pressed: v.step?.keys.length ?? v.pressed,
        hint: null,
        wrongMode: false,
        results: done.results ?? [...v.results, done.result],
      };
    }
    case "lesson.finish":
      return {
        ...v,
        phase: "finished",
        step: null,
        catchingUp: null,
        results: (d.results as StepResult[] | undefined) ?? v.results,
        seconds: Number(d.seconds ?? 0),
      };
    default:
      return v;
  }
}

/** Seconds since the lesson started, or the engine's count once it finished. */
export function elapsed(v: LessonView, now: number) {
  if (v.seconds !== null) return v.seconds;
  if (!v.startedAt) return 0;
  return Math.max(0, Math.round((now - v.startedAt) / 1000));
}

/** "1:05" from 65 seconds. */
export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
