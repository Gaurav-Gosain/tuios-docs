/**
 * The cells of one real tuios screen, as scripts/hero-cells.mjs wrote them
 * from a screenshot in HTML, and the cuts the exploded view makes of them.
 *
 * A screen is rows of runs: [column, text, style]. A cut keeps the part of
 * each run inside a rectangle of cells, so a layer of the exploded view
 * holds exactly the cells of its region and nothing is drawn twice.
 */

export type Style = {
  fg?: string;
  bg?: string;
  b?: 1;
  i?: 1;
  f?: 1;
  u?: string;
};

export type Run = [x: number, text: string, style: number];

export type Screen = {
  cols: number;
  rows: number;
  fg: string;
  bg: string;
  styles: Style[];
  lines: Run[][];
};

/** A rectangle of cells: x and y of the top left, w columns, h rows. */
export type Rect = { x: number; y: number; w: number; h: number };

const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

/** The cell width of one grapheme, as hero-cells.mjs counts it. */
export function cellWidth(g: string): number {
  const cp = g.codePointAt(0) ?? 0;
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

/** The cells of one row, one entry per column. A wide cell's tail is null. */
export function rowCells(
  runs: Run[],
): ({ g: string; s: number; w: number } | null)[] {
  const out: ({ g: string; s: number; w: number } | null)[] = [];
  for (const [, text, s] of runs) {
    for (const { segment } of segmenter.segment(text)) {
      const w = cellWidth(segment);
      out.push({ g: segment, s, w });
      if (w === 2) out.push(null);
    }
  }
  return out;
}

/**
 * The runs of the rectangle r, with columns counted from r.x. A cell is in
 * the cut when mask says so (default: every cell of r).
 */
export function cut(
  screen: Screen,
  r: Rect,
  mask?: (x: number, y: number) => boolean,
): Run[][] {
  const out: Run[][] = [];
  for (let y = r.y; y < r.y + r.h; y++) {
    const cells = rowCells(screen.lines[y]);
    const runs: Run[] = [];
    let cur: Run | null = null;
    for (let x = r.x; x < r.x + r.w; x++) {
      const c = cells[x];
      if (c === null || c === undefined) continue;
      if (mask && !mask(x, y)) {
        cur = null;
        continue;
      }
      if (cur && cur[2] === c.s && cur[0] + width(cur[1]) === x - r.x) {
        cur[1] += c.g;
      } else {
        cur = [x - r.x, c.g, c.s];
        runs.push(cur);
      }
    }
    out.push(runs);
  }
  return out;
}

function width(text: string): number {
  let n = 0;
  for (const { segment } of segmenter.segment(text)) n += cellWidth(segment);
  return n;
}

/** The grapheme at column x of row y, or "" past the end. */
export function charAt(screen: Screen, x: number, y: number): string {
  return rowCells(screen.lines[y])[x]?.g ?? "";
}

/**
 * The windows on the screen: every box whose corners are the rounded
 * corners tuios draws a pane border with. A box is found from its top-left
 * corner by walking right to the top-right one and down to the bottom-left.
 */
export function findBoxes(screen: Screen, area: Rect): Rect[] {
  const boxes: Rect[] = [];
  for (let y = area.y; y < area.y + area.h; y++) {
    for (let x = area.x; x < area.x + area.w; x++) {
      if (charAt(screen, x, y) !== "╭") continue;
      let x2 = x + 1;
      while (x2 < area.x + area.w && charAt(screen, x2, y) !== "╮") x2++;
      let y2 = y + 1;
      while (y2 < area.y + area.h && charAt(screen, x, y2) !== "╰") y2++;
      if (
        x2 < area.x + area.w &&
        y2 < area.y + area.h &&
        charAt(screen, x2, y2) === "╯"
      )
        boxes.push({ x, y, w: x2 - x + 1, h: y2 - y + 1 });
    }
  }
  return boxes;
}
