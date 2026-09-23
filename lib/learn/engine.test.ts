import { describe, expect, test } from "bun:test";
import {
  advance,
  feed,
  formatTime,
  hintLevel,
  type LessonState,
  startLesson,
} from "./engine";
import { keyBytes } from "./keys";
import { changed, on, via } from "./matchers";
import { tracks } from "./tracks";
import { fromTmux } from "./tracks/from-tmux";
import type { Track, TuiosEvent } from "./types";

// Events in the shape the wasm build sends them, taken from a recorded run.
const key = (k: string, action = "", mode = "terminal"): TuiosEvent => ({
  type: "key",
  data: { key: k, action, mode },
});
const state = (over: Partial<NonNullable<TuiosEvent["state"]>> = {}) => ({
  mode: "terminal" as const,
  windows: 1,
  minimized: 0,
  totalWindows: 1,
  focused: "a",
  focusedTitle: "",
  workspace: 1,
  tiling: true,
  prefix: "",
  help: false,
  commandPalette: false,
  launcher: false,
  settings: false,
  copyMode: false,
  zoomed: false,
  theme: "",
  workspacesUsed: [1],
  cols: 80,
  rows: 24,
  ...over,
});
const ev = (
  type: string,
  from: unknown,
  to: unknown,
  s = state(),
): TuiosEvent => ({
  type,
  data: { from, to },
  state: s,
});

function run(track: Track, events: TuiosEvent[]) {
  let s: LessonState = startLesson(track, 0);
  let t = 0;
  for (const e of events) {
    t += 100;
    s = feed(s, e, t).state;
  }
  return s;
}

describe("from-tmux split step", () => {
  const track: Track = { ...fromTmux, steps: [fromTmux.steps[1]] };

  test("the split key completes it and lights both caps", () => {
    let s = startLesson(track, 0);
    s = feed(s, key("ctrl+b"), 1).state;
    expect(s.pressed).toBe(1);
    s = feed(s, ev("prefix", "", "prefix"), 2).state;
    s = feed(s, key("|", "prefix_split_vertical"), 3).state;
    expect(s.pressed).toBe(2);
    const r = feed(s, ev("window.open", 1, 2, state({ windows: 2 })), 4);
    expect(r.completed).toBe(true);
    expect(r.state.results).toEqual(["clean"]);
    expect(r.state.finishedAt).toBe(4);
  });

  test("a window opened another way does not count", () => {
    const s = run(track, [
      key("ctrl+b"),
      key("c", "prefix_new_window"),
      ev("window.open", 1, 2),
    ]);
    expect(s.index).toBe(0);
  });
});

describe("hints", () => {
  const step = {
    id: "x",
    title: "Open a window",
    keys: ["n"],
    needs: "window" as const,
    done: on("window.open"),
    hint: "press n",
  };
  const track: Track = {
    id: "t",
    title: "t",
    blurb: "",
    audience: "",
    minutes: 1,
    steps: [step],
  };

  test("show after idle time, then Show me glows", () => {
    const s = startLesson(track, 0);
    expect(hintLevel(s, 1000)).toBe(0);
    expect(hintLevel(s, 9000)).toBe(1);
    expect(hintLevel(s, 21000)).toBe(2);
  });

  test("two wrong keys show the hint early and mark the step hinted", () => {
    let s = startLesson(track, 0);
    s = feed(s, key("x", "close_window", "window"), 10).state;
    s = feed(s, key("m", "minimize_window", "window"), 20).state;
    expect(hintLevel(s, 30)).toBe(1);
    s = feed(s, ev("window.open", 0, 1), 40).state;
    expect(s.results).toEqual(["hinted"]);
  });

  test("the step key typed into the shell is a wrong-mode nudge", () => {
    const s = feed(startLesson(track, 0), key("n", "", "terminal"), 10).state;
    expect(s.wrongMode).toBe(true);
  });
});

describe("matchers", () => {
  test("via checks the action of the key before the event", () => {
    const m = via(["prefix_split_horizontal"], on("window.open"));
    const ctx = { lastAction: "prefix_split_horizontal", state: null, mem: {} };
    expect(m(ev("window.open", 1, 2), ctx)).toBe(true);
    expect(
      m(ev("window.open", 1, 2), { ...ctx, lastAction: "new_window" }),
    ).toBe(false);
  });

  test("changed matches the new value only", () => {
    const m = changed("tiling", true);
    const ctx = { lastAction: "", state: null, mem: {} };
    expect(m(ev("tiling", false, true), ctx)).toBe(true);
    expect(m(ev("tiling", true, false), ctx)).toBe(false);
  });
});

describe("tracks", () => {
  test("every step can be completed or explained, and ids are unique", () => {
    for (const t of tracks) {
      const ids = new Set(t.steps.map((s) => s.id));
      expect(ids.size).toBe(t.steps.length);
      for (const s of t.steps) {
        expect(Boolean(s.done) || Boolean(s.explainer)).toBe(true);
        expect(s.title.split(/\s+/).length).toBeLessThanOrEqual(6);
      }
      for (const n of t.next ?? []) {
        expect(tracks.some((o) => o.id === n)).toBe(true);
      }
    }
  });

  test("advance finishes after the last step", () => {
    const t = tracks[0];
    let s = startLesson(t, 0);
    for (let i = 0; i < t.steps.length; i++) s = advance(s, "skipped", i);
    expect(s.finishedAt).not.toBeNull();
    expect(s.results.length).toBe(t.steps.length);
  });
});

test("key bytes", () => {
  expect(keyBytes("ctrl+b")).toBe("\x02");
  expect(keyBytes("esc")).toBe("\x1b");
  expect(keyBytes("|")).toBe("|");
  expect(keyBytes("left")).toBe("\x1b[D");
  expect(keyBytes("shift+tab")).toBe("\x1b[Z");
  expect(keyBytes({ text: "ls" })).toBe("ls");
});

test("formatTime", () => {
  expect(formatTime(221)).toBe("3:41");
  expect(formatTime(5)).toBe("0:05");
});
