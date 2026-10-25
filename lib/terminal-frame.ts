/**
 * Checks a hand-drawn terminal frame the way a terminal would lay it out: in
 * cells, not in UTF-16 code units. A frame is the rows of one screen, a
 * table, or a mockup, as plain strings.
 *
 * The width of a grapheme comes from the caller, so the test can measure with
 * an east-asian-width aware function (Bun.stringWidth) while this module
 * stays free of runtime dependencies.
 */

export type WidthFn = (s: string) => number;

/** One grapheme and the column it starts at. */
interface Cell {
  col: number;
  text: string;
}

const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

/** Glyphs that draw a vertical line through their cell. */
const VERTICAL = new Set([..."│┃║├┤┼┬┴╭╮╰╯┌┐└┘┣┫╋┳┻╞╡╪"]);

/** Glyphs that only ever sit in the middle or at the edge of a row. */
const DIVIDER = new Set([..."│┃║"]);

/** Glyphs a closed box starts a row with, and ends it with. */
const LEFT_EDGE = new Set([..."│┃║├╭╰┌└┣"]);
const RIGHT_EDGE = new Set([..."│┃║┤╮╯┐┘┫"]);

/** A row that is nothing but a horizontal rule and its joints. */
const RULE_ROW = /^\s*[─━═╭╰├┌└┣]?[─━═┬┴┼┳┻╋]*[─━═]{3,}[─━═┬┴┼┳┻╋]*[╮╯┤┐┘┫]?$/u;

function cells(row: string, width: WidthFn): Cell[] {
  const out: Cell[] = [];
  let col = 0;
  for (const { segment } of segmenter.segment(row)) {
    out.push({ col, text: segment });
    col += width(segment);
  }
  return out;
}

/** The display width of a row, in terminal cells. */
export function rowWidth(row: string, width: WidthFn): number {
  let w = 0;
  for (const { segment } of segmenter.segment(row)) w += width(segment);
  return w;
}

function verticalColumns(row: string, width: WidthFn, set = VERTICAL) {
  const cols = new Set<number>();
  for (const c of cells(row, width)) if (set.has(c.text)) cols.add(c.col);
  return cols;
}

export interface FrameOptions {
  /**
   * Every row is one row of a fixed-size screen, so every row must have the
   * same display width. Use it for frames whose rows are padded to the
   * screen, such as the review walkthrough.
   */
  fixedWidth?: boolean;
}

/**
 * The problems of one frame, as one line each. An empty list means the frame
 * lines up.
 *
 * - A closed box (rows that start and end on a border) has rows of one width,
 *   and its joints sit in the same columns on every row.
 * - A divider never moves by one column from one row to the next.
 * - A rule that does not close a box is as wide as the widest row of its
 *   frame.
 * - With fixedWidth, every row has the same width.
 */
export function frameProblems(
  rows: string[],
  width: WidthFn,
  opts: FrameOptions = {},
): string[] {
  const problems: string[] = [];
  const widths = rows.map((r) => rowWidth(r.replace(/\s+$/, ""), width));
  const full = rows.map((r) => rowWidth(r, width));
  const show = (i: number) => `row ${i + 1} ${JSON.stringify(rows[i])}`;

  if (opts.fixedWidth) {
    const want = full[0];
    full.forEach((w, i) => {
      if (w !== want) {
        problems.push(`${show(i)} is ${w} cells wide, row 1 is ${want}`);
      }
    });
  }

  // Closed boxes: runs of rows that start and end on a border glyph.
  const closed = (r: string) => {
    const t = r.trim();
    if (t.length < 2) return false;
    const gs = [...segmenter.segment(t)].map((s) => s.segment);
    return LEFT_EDGE.has(gs[0]) && RIGHT_EDGE.has(gs[gs.length - 1]);
  };
  for (let i = 0; i < rows.length; ) {
    if (!closed(rows[i])) {
      i++;
      continue;
    }
    let j = i;
    while (j + 1 < rows.length && closed(rows[j + 1])) j++;
    if (j > i) {
      const cols = verticalColumns(rows[i], width);
      for (let k = i + 1; k <= j; k++) {
        if (widths[k] !== widths[i]) {
          problems.push(
            `${show(k)} is ${widths[k]} cells wide, the box row above it is ${widths[i]}`,
          );
        }
        const got = verticalColumns(rows[k], width);
        const same =
          got.size === cols.size && [...got].every((c) => cols.has(c));
        if (!same) {
          problems.push(
            `${show(k)} has joints at columns ${[...got].join(",")}, row ${i + 1} at ${[...cols].join(",")}`,
          );
        }
      }
    }
    i = j + 1;
  }

  // Dividers that drift by one column between neighbouring rows.
  for (let i = 0; i + 1 < rows.length; i++) {
    const a = verticalColumns(rows[i], width, DIVIDER);
    const b = verticalColumns(rows[i + 1], width, VERTICAL);
    const bDiv = verticalColumns(rows[i + 1], width, DIVIDER);
    const aAll = verticalColumns(rows[i], width, VERTICAL);
    for (const c of a) {
      if (b.has(c)) continue;
      if (bDiv.has(c - 1) || bDiv.has(c + 1)) {
        const to = bDiv.has(c - 1) ? c - 1 : c + 1;
        if (!aAll.has(to)) {
          problems.push(
            `divider drifts from column ${c} on row ${i + 1} to column ${to} on row ${i + 2}`,
          );
        }
      }
    }
  }

  // Rules span the frame. The top, middle and bottom rules of a closed box
  // are the box's own, and the box check above measures them.
  const ruleRows = rows
    .map((r, i) => (RULE_ROW.test(r) && !closed(r) ? i : -1))
    .filter((i) => i >= 0);
  if (ruleRows.length > 0) {
    const widest = Math.max(
      ...widths.filter((_, i) => !ruleRows.includes(i)),
      0,
    );
    for (const i of ruleRows) {
      if (widths[i] < widest) {
        problems.push(
          `rule on row ${i + 1} is ${widths[i]} cells wide, the widest row is ${widest}`,
        );
      }
    }
  }

  return problems;
}
