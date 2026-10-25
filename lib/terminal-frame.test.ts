import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  DIVIDER_COL,
  REVIEW_SCREENS,
} from "@/components/docs/review-walkthrough";
import { frameProblems, type WidthFn } from "./terminal-frame";

// Bun.stringWidth follows East Asian Width and counts a wide grapheme as two
// cells and a combining mark as none, the way a terminal lays them out.
const width: WidthFn = (s) => Bun.stringWidth(s);

const BOX = /[─-╿]/u;

const root = path.resolve(import.meta.dir, "..");

function files(dir: string, ext: RegExp): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...files(full, ext));
    else if (ext.test(e.name)) out.push(full);
  }
  return out;
}

interface Frame {
  where: string;
  rows: string[];
}

/** Fenced blocks that draw with box glyphs. */
function fencedFrames(file: string, text: string): Frame[] {
  const frames: Frame[] = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^(\s*)(`{3,}|~{3,})\s*([\w-]*)/);
    if (!open) continue;
    const [, indent, fence, lang] = open;
    const body: string[] = [];
    let j = i + 1;
    while (j < lines.length && !lines[j].trimStart().startsWith(fence)) {
      body.push(
        lines[j].startsWith(indent) ? lines[j].slice(indent.length) : lines[j],
      );
      j++;
    }
    if (lang !== "mermaid" && body.some((r) => BOX.test(r))) {
      frames.push({ where: `${file}:${i + 1}`, rows: body });
    }
    i = j;
  }
  return frames;
}

/** The lines={[...]} of every TerminalCapture. */
function captureFrames(file: string, text: string): Frame[] {
  const frames: Frame[] = [];
  const re = /<TerminalCapture\b/g;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const start = text.indexOf("lines={", m.index);
    if (start < 0) continue;
    let depth = 0;
    let end = start + "lines=".length;
    for (; end < text.length; end++) {
      if (text[end] === "{") depth++;
      else if (text[end] === "}" && --depth === 0) break;
    }
    const expr = text.slice(start + "lines={".length, end);
    const lines = new Function(`return (${expr});`)() as { text: string }[];
    const rows = lines.map((l) => l.text);
    if (rows.some((r) => BOX.test(r))) {
      const line = text.slice(0, m.index).split("\n").length;
      frames.push({ where: `${file}:${line}`, rows });
    }
  }
  return frames;
}

const contentFrames: Frame[] = files(
  path.join(root, "content"),
  /\.mdx?$/,
).flatMap((full) => {
  const file = path.relative(root, full);
  const text = readFileSync(full, "utf8");
  return [...fencedFrames(file, text), ...captureFrames(file, text)];
});

describe("the terminal frames in the docs line up", () => {
  test("the content has frames to check", () => {
    expect(contentFrames.length).toBeGreaterThan(5);
  });

  test.each(
    contentFrames.map((f) => [f.where, f] as const),
  )("%s", (_, frame) => {
    expect(frameProblems(frame.rows, width)).toEqual([]);
  });
});

describe("the review walkthrough draws one screen per step", () => {
  test.each(
    REVIEW_SCREENS.map((s) => [s.title, s] as const),
  )("%s", (_, screen) => {
    expect(frameProblems(screen.rows, width, { fixedWidth: true })).toEqual([]);
    // The divider between the file list and the diff sits in one column.
    const cols = screen.rows
      .filter((r) => r.includes("│"))
      .map((r) => width(r.slice(0, r.indexOf("│"))));
    for (const c of cols) expect(c).toBe(DIVIDER_COL);
  });
});

// Every component that draws with box glyphs, and how its frames are
// checked. A new mockup fails here until it is added, with its frames
// exported to a test above or a reason it draws no frame of text.
const BOX_COMPONENTS: Record<string, string> = {
  "components/docs/review-walkthrough.tsx": "REVIEW_SCREENS, above",
  "components/mdx/terminal-capture.tsx":
    "draws the lines of each TerminalCapture in content/, checked above",
  "components/mdx/shared-borders-toggle.tsx":
    "places single junction glyphs with CSS, no rows of text",
  "components/docs/sketch-gallery.tsx":
    "names the diagonal glyphs in a comment; sketch draws its own frames",
};

test("every component that draws with box glyphs is checked", () => {
  const found = [
    ...files(path.join(root, "components"), /\.tsx?$/),
    ...files(path.join(root, "app"), /\.tsx?$/),
  ]
    .filter((f) => BOX.test(readFileSync(f, "utf8")))
    .map((f) => path.relative(root, f))
    .sort();
  expect(found).toEqual(Object.keys(BOX_COMPONENTS).sort());
});

test("code and terminal text show != -> >= as typed, without ligatures", () => {
  const css = readFileSync(path.join(root, "app/global.css"), "utf8");
  const selectors = (sel: string) =>
    sel
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split(",")
      .map((x) => x.trim());
  // The last rule that sets the features of pre wins, so it must be the one
  // that turns the ligatures off.
  const last = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)]
    .filter(
      ([, sel, body]) =>
        selectors(sel).includes("pre") && /font-feature-settings/.test(body),
    )
    .at(-1);
  expect(last).toBeDefined();
  const [, sel, body] = last as RegExpExecArray;
  for (const s of ["pre", "code", "kbd", ".font-mono"]) {
    expect(selectors(sel)).toContain(s);
  }
  expect(body).toMatch(/font-variant-ligatures:\s*none/);
  expect(body).toMatch(/"liga" 0/);
  expect(body).toMatch(/"calt" 0/);
});
