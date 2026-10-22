#!/usr/bin/env node
// hero-cells.mjs: turn one tuios screenshot in HTML (internal/shot's HTML
// backend) into the cell runs the landing page's exploded view draws.
//
//   node scripts/hero-cells.mjs IN.html OUT.json
//
// The HTML is one <pre> with a line per row and a <span> per run of cells
// that share a style. OUT.json keeps that: per row, a list of
// [column, text, style], and a table of the styles. The column is counted in
// cells, so a wide character advances it by two. A row that does not add up
// to the screen's width stops the script: the page lays the runs out on the
// cell grid, and a miscounted row would shift every run after it.
import { readFileSync, writeFileSync } from "node:fs";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: hero-cells.mjs IN.html OUT.json");
  process.exit(2);
}
const html = readFileSync(input, "utf8");

const pre = html.match(
  /<pre style="color:(#[0-9a-f]{6});background:(#[0-9a-f]{6})">([\s\S]*?)<\/pre>/i,
);
if (!pre) {
  console.error("hero-cells: no <pre> with the screen's colours in", input);
  process.exit(1);
}
const [, fg, bg, body] = pre;

const decode = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

// The cell width of one grapheme: 2 for East Asian wide and emoji, else 1.
function width(g) {
  const cp = g.codePointAt(0);
  if (cp < 0x1100) return 1;
  if (
    /\p{Extended_Pictographic}/u.test(g) &&
    (g.includes("\uFE0F") || cp >= 0x1f300)
  )
    return 2;
  const wide =
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe30 && cp <= 0xfe4f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6) ||
    (cp >= 0x20000 && cp <= 0x3fffd);
  return wide ? 2 : 1;
}
const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
const cells = (text) => {
  let n = 0;
  for (const { segment } of seg.segment(text)) n += width(segment);
  return n;
};

const styles = [];
const styleIndex = new Map();
function style(css) {
  const s = {};
  for (const decl of css.split(";")) {
    const [k, v] = decl.split(":");
    if (k === "color") s.fg = v;
    else if (k === "background") s.bg = v;
    else if (k === "font-weight") s.b = 1;
    else if (k === "font-style") s.i = 1;
    else if (k === "opacity") s.f = 1;
    else if (k === "text-decoration") s.u = v;
  }
  const key = JSON.stringify(s);
  if (!styleIndex.has(key)) {
    styleIndex.set(key, styles.length);
    styles.push(s);
  }
  return styleIndex.get(key);
}
style(""); // style 0: the screen's own colours

const lines = body.replace(/\n$/, "").split("\n");
const rows = [];
let cols = 0;
for (const [y, line] of lines.entries()) {
  const runs = [];
  let x = 0;
  const token =
    /<a [^>]*>|<\/a>|<span style="([^"]*)">([^<]*)<\/span>|([^<]+)/g;
  for (const m of line.matchAll(token)) {
    if (m[1] === undefined && m[3] === undefined) continue; // a link tag
    const text = decode(m[2] ?? m[3]);
    const s = m[1] === undefined ? 0 : style(m[1]);
    runs.push([x, text, s]);
    x += cells(text);
  }
  if (y === 0) cols = x;
  if (x !== cols) {
    console.error(`hero-cells: row ${y} is ${x} cells wide, row 0 is ${cols}`);
    process.exit(1);
  }
  rows.push(runs);
}

writeFileSync(
  output,
  `${JSON.stringify({ cols, rows: rows.length, fg, bg, styles, lines: rows })}\n`,
);
console.error(`hero-cells: ${cols}x${rows.length}, ${styles.length} styles`);
