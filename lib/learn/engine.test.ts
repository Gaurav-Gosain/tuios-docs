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
import { changed, moved, on, seq, via, zoomed } from "./matchers";
import { tracks } from "./tracks";
import { fromTmux } from "./tracks/from-tmux";
import type { Track, TuiosEvent, TuiosState } from "./types";

// Events in the shape the wasm build sends them: a key, then the action it
// ran if any, then the state changes with the new state.
const key = (k: string, mode = "terminal"): TuiosEvent => ({
  type: "key",
  data: { key: k, mode },
});
const act = (name: string, mode = "terminal"): TuiosEvent => ({
  type: "action",
  data: { name, mode },
});
const state = (over: Partial<TuiosState> = {}): TuiosState => ({
  mode: "terminal",
  workspace: 1,
  workspacesUsed: [1],
  tiling: true,
  layout: "bsp",
  prefix: "",
  overlays: [],
  theme: "",
  focused: "a",
  focusedTitle: "",
  zoomed: false,
  windows: 1,
  minimized: 0,
  totalWindows: 1,
  windowList: [],
  tape: false,
  glyphs: "default",
  borderStyle: "rounded",
  cols: 80,
  rows: 24,
  ...over,
});
const ev = (
  type: string,
  data: Record<string, unknown>,
  s = state(),
): TuiosEvent => ({ type, data, state: s });

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
  const step = fromTmux.steps.find((s) => s.id === "split-right");
  if (!step) throw new Error("no split-right step");
  const track: Track = { ...fromTmux, steps: [step] };

  test("the split key completes it and lights both caps", () => {
    let s = startLesson(track, 0);
    s = feed(s, key("ctrl+b"), 1).state;
    expect(s.pressed).toBe(1);
    s = feed(s, ev("prefix", { from: "", to: "prefix" }), 2).state;
    s = feed(s, key("|"), 3).state;
    expect(s.pressed).toBe(2);
    s = feed(s, act("prefix_split_vertical"), 4).state;
    const r = feed(s, ev("window.open", { id: "b", count: 2 }), 5);
    expect(r.completed).toBe(true);
    expect(r.state.results).toEqual(["clean"]);
    expect(r.state.finishedAt).toBe(5);
  });

  test("a window opened another way does not count", () => {
    const s = run(track, [
      key("ctrl+b"),
      key("c"),
      act("prefix_new_window"),
      ev("window.open", { id: "b", count: 2 }),
    ]);
    expect(s.index).toBe(0);
  });

  test("a key with no action clears the last action", () => {
    const s = run(track, [
      act("prefix_split_vertical"),
      key("x"),
      ev("window.open", { id: "b", count: 2 }),
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
    s = feed(s, key("x", "window"), 10).state;
    s = feed(s, key("m", "window"), 20).state;
    expect(hintLevel(s, 30)).toBe(1);
    s = feed(s, ev("window.open", { id: "a", count: 1 }), 40).state;
    expect(s.results).toEqual(["hinted"]);
  });

  test("the step key typed into the shell is a wrong-mode nudge", () => {
    const s = feed(startLesson(track, 0), key("n", "terminal"), 10).state;
    expect(s.wrongMode).toBe(true);
  });
});

describe("matchers", () => {
  const ctx = () => ({ lastAction: "", state: null, mem: {} });

  test("via checks the action that ran before the event", () => {
    const m = via(["prefix_split_horizontal"], on("window.open"));
    const c = { ...ctx(), lastAction: "prefix_split_horizontal" };
    expect(m(ev("window.open", {}), c)).toBe(true);
    expect(
      m(ev("window.open", {}), { ...ctx(), lastAction: "new_window" }),
    ).toBe(false);
  });

  test("changed matches the new value only", () => {
    const m = changed("tiling", true);
    expect(m(ev("tiling", { from: false, to: true }), ctx())).toBe(true);
    expect(m(ev("tiling", { from: true, to: false }), ctx())).toBe(false);
  });

  test("seq takes any number of matchers, in order", () => {
    const m = seq(zoomed(true), moved(), zoomed(false));
    const c = ctx();
    expect(m(ev("window.zoom", { zoomed: false }), c)).toBe(false);
    expect(m(ev("window.zoom", { zoomed: true }), c)).toBe(false);
    expect(m(ev("window.zoom", { zoomed: false }), c)).toBe(false);
    expect(m(ev("window.move", {}), c)).toBe(false);
    expect(m(ev("window.zoom", { zoomed: false }), c)).toBe(true);
  });
});

describe("tracks", () => {
  test("every step can be completed or explained, and ids are unique", () => {
    const ids = new Set(tracks.map((t) => t.id));
    expect(ids.size).toBe(tracks.length);
    for (const t of tracks) {
      const stepIds = new Set(t.steps.map((s) => s.id));
      expect(stepIds.size).toBe(t.steps.length);
      expect(t.steps.length).toBeGreaterThanOrEqual(5);
      expect(t.steps.length).toBeLessThanOrEqual(9);
      for (const s of t.steps) {
        expect(Boolean(s.done) || Boolean(s.explainer)).toBe(true);
        expect(s.title.split(/\s+/).length).toBeLessThanOrEqual(6);
        expect(s.keys.length).toBeGreaterThan(0);
        if (!s.explainer) expect(s.hint.length).toBeGreaterThan(0);
      }
      for (const n of t.next ?? []) {
        expect(tracks.some((o) => o.id === n)).toBe(true);
      }
    }
  });

  test("copy has no em dashes and no dashes made of hyphens", () => {
    for (const t of tracks) {
      const text = [
        t.title,
        t.blurb,
        t.audience,
        ...t.steps.flatMap((s) => [
          s.title,
          s.note ?? "",
          s.hint,
          s.explainer?.body ?? "",
          s.learned ?? "",
        ]),
      ].join("\n");
      // U+2014 and U+2013, and hyphens standing in for them.
      expect(text).not.toMatch(/[–—]| - | -- /);
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
  expect(keyBytes("alt+left")).toBe("\x1b[1;3D");
  expect(keyBytes({ text: "ls" })).toBe("ls");
});

test("formatTime", () => {
  expect(formatTime(221)).toBe("3:41");
  expect(formatTime(5)).toBe("0:05");
});
