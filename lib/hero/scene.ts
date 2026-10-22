/**
 * The exploded view's model: which cells of the captured screen go on which
 * layer. The screen is media/scenes/landing-exploded, taken twice in one
 * take: exploded-tiles.json with the four tiled panes alone, and
 * exploded.json with the scratch terminal shown over them. The tiles layer
 * comes from the first, so the cells the scratch box covers are real too.
 *
 * Every region is found in the cells, not hard-coded: the dock is the top
 * two rows (the tabs and the line under them), the rail is everything right
 * of the panes, and each window is a box with tuios's rounded corners.
 */

import {
  charAt,
  cut,
  findBoxes,
  type Rect,
  type Run,
  type Screen,
  type Style,
} from "./cells";
import screenJson from "./exploded.json";
import tilesJson from "./exploded-tiles.json";

export type Sheet = {
  /** A stable name, used for the CSS of this sheet. */
  id: string;
  rect: Rect;
  rows: Run[][];
  /** Which screen's style table the runs index. */
  palette: "screen" | "tiles";
};

const screen = screenJson as Screen;
const tiles = tilesJson as Screen;

const DOCK_ROWS = 2;

/** The column the rail starts at: the first column past every pane box. */
function railStart(): number {
  const area = { x: 0, y: DOCK_ROWS, w: tiles.cols, h: tiles.rows - DOCK_ROWS };
  const boxes = findBoxes(tiles, area);
  return Math.max(...boxes.map((b) => b.x + b.w));
}

const railX = railStart();
const paneArea: Rect = {
  x: 0,
  y: DOCK_ROWS,
  w: railX,
  h: tiles.rows - DOCK_ROWS,
};

/** The four tiled panes, in reading order, with the title on each. */
export const panes = findBoxes(tiles, paneArea).map((rect) => {
  const top = cut(tiles, { ...rect, h: 1 })[0]
    .map((r) => r[1])
    .join("");
  // The title pill is the last word on the border row.
  const title = top.match(/[\w.@~:/-]+/g)?.pop() ?? "";
  return { rect, title };
});

/** The scratch box: the box whose top border names it. */
const scratchRect = (() => {
  const box = findBoxes(screen, paneArea).find((b) =>
    cut(screen, { ...b, h: 1 })[0]
      .map((r) => r[1])
      .join("")
      .includes(" scratch "),
  );
  if (!box) throw new Error("hero: no scratch box on the screen");
  return box;
})();

export const geometry = {
  cols: screen.cols,
  rows: screen.rows,
  railX,
  scratch: scratchRect,
};

export const dock: Sheet = {
  id: "dock",
  rect: { x: 0, y: 0, w: screen.cols, h: DOCK_ROWS },
  rows: cut(screen, { x: 0, y: 0, w: screen.cols, h: DOCK_ROWS }),
  palette: "screen",
};

const railRect = {
  x: railX,
  y: DOCK_ROWS,
  w: screen.cols - railX,
  h: screen.rows - DOCK_ROWS,
};
export const rail: Sheet = {
  id: "rail",
  rect: railRect,
  rows: cut(screen, railRect),
  palette: "screen",
};

export const scratch: Sheet = {
  id: "scratch",
  rect: scratchRect,
  rows: cut(screen, scratchRect),
  palette: "screen",
};

export const paneSheets: Sheet[] = panes.map((p, i) => ({
  id: `pane-${i}`,
  rect: p.rect,
  rows: cut(tiles, p.rect),
  palette: "tiles",
}));

/** The pane whose cells the cell layer shows: the one running nvim. */
export const cellPane = panes.find((p) => p.title === "main.go") ?? panes[0];
const inner: Rect = {
  x: cellPane.rect.x + 1,
  y: cellPane.rect.y + 1,
  w: cellPane.rect.w - 2,
  h: cellPane.rect.h - 2,
};
export const cellSheet: Sheet = {
  id: "cells",
  rect: inner,
  rows: cut(tiles, inner),
  palette: "tiles",
};

/**
 * The cell the callout reads out.
 * Its attributes are the ones the emulator stored for it.
 */
export const probe = (() => {
  for (let y = inner.y; y < inner.y + inner.h; y++) {
    const line = cut(tiles, { ...inner, y, h: 1 })[0];
    for (const [x, text, s] of line) {
      // A cell with a colour of its own, so the callout has something to
      // read out: the first letter of the first coloured word.
      const style = tiles.styles[s] as Style;
      const at = text.search(/[a-z]/);
      if (at >= 0 && style.fg && !style.b && !style.bg && text.length > 3) {
        return {
          col: inner.x + x + at - inner.x,
          row: y - inner.y,
          x: x + at,
          y: y - inner.y,
          char: charAt(tiles, inner.x + x + at, y),
          fg: style.fg ?? tiles.fg,
          bg: style.bg ?? null,
          bold: Boolean(style.b),
        };
      }
    }
  }
  return null;
})();

export const palettes = {
  screen: { fg: screen.fg, bg: screen.bg, styles: screen.styles },
  tiles: { fg: tiles.fg, bg: tiles.bg, styles: tiles.styles },
};

/** What runs in each window, from the scene's tape. */
export const programs: Record<string, string> = {
  "main.go": "nvim",
  diff: "bash",
  api: "agent",
  tests: "agent",
  scratch: "bash",
};
