"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * One row of a panel, drawn by bubbletea's renderer over three frames, and
 * what two kinds of terminal keep of it.
 *
 * With the tty's TABDLY at TAB0, bubbletea's renderer may move the cursor
 * right across unchanged cells with HT (ultraviolet relativeCursorMove, which
 * keeps the shortest of the moves it tries). tuios 947e70ed makes the saved
 * tty state say TAB3, so the renderer moves with CUF instead.
 *
 * tmux 3.6 and later (input.c, the HT case) store a tab that crosses only
 * blank cells that look alike as one tab cell at the start column, with the
 * rest of its span as padding. A later write anywhere in that span resets
 * the other cells of the span to default cells, without the background. The
 * exact scenario here, a tab from column 2 to 8 and a write at column 5, was
 * checked against tmux 3.7c with capture-pane -e. Other terminals, tuios's
 * own emulator included, only move the cursor on HT.
 */

const COLS = 16;
const TAB_STOPS = [0, 8];
// A mid blue that reads on both the light and the dark page.
const PANEL = "#2f5bb7";

type Mode = "ht" | "cuf";

interface Cell {
  ch: string;
  panel: boolean;
  /** Width of the tmux tab cell that starts here. */
  tab?: number;
  /** Column of the tab cell this padding cell belongs to. */
  padOf?: number;
}

type Op =
  | { kind: "fill" }
  | { kind: "move"; to: number }
  | { kind: "write"; ch: string }
  | { kind: "right"; to: number };

interface Step {
  title: string;
  ops: Op[];
}

const STEPS: Step[] = [
  {
    title: "Frame 1 draws the row: 16 blank cells on the panel colour.",
    ops: [{ kind: "fill" }],
  },
  {
    title: 'Frame 2 changes column 1. The renderer writes ">" there.',
    ops: [
      { kind: "move", to: 1 },
      { kind: "write", ch: ">" },
    ],
  },
  {
    title:
      "Frame 2 also changes column 8. Columns 2 to 7 did not change, so the renderer moves across them.",
    ops: [{ kind: "right", to: 8 }],
  },
  {
    title: 'The renderer writes "3" at column 8.',
    ops: [{ kind: "write", ch: "3" }],
  },
  {
    title: 'Frame 3 changes column 5. The renderer moves there and writes "x".',
    ops: [
      { kind: "move", to: 5 },
      { kind: "write", ch: "x" },
    ],
  },
];

function nextStop(col: number): number {
  for (const s of TAB_STOPS) if (s > col) return s;
  return COLS - 1;
}

interface Screen {
  cells: Cell[];
  cursor: number;
}

function blankRow(): Cell[] {
  return Array.from({ length: COLS }, () => ({ ch: " ", panel: false }));
}

/** Plays the steps up to and including upTo on one terminal model. */
function play(upTo: number, mode: Mode, tmux: boolean): Screen {
  let cells = blankRow();
  let cursor = 0;

  const breakTab = (col: number) => {
    const c = cells[col];
    const head = c.tab !== undefined ? col : c.padOf;
    if (head === undefined) return;
    const width = cells[head].tab ?? 1;
    // tmux resets every other cell of the tab's span to a default cell.
    for (let x = head; x < head + width; x++) {
      cells[x] =
        x === col
          ? { ch: cells[x].ch, panel: cells[x].panel }
          : { ch: " ", panel: false };
    }
  };

  for (let s = 0; s <= upTo; s++) {
    for (const op of STEPS[s].ops) {
      switch (op.kind) {
        case "fill":
          cells = Array.from({ length: COLS }, () => ({
            ch: " ",
            panel: true,
          }));
          cursor = COLS - 1;
          break;
        case "move":
          cursor = op.to;
          break;
        case "write":
          if (tmux) breakTab(cursor);
          cells[cursor] = { ch: op.ch, panel: true };
          cursor = Math.min(cursor + 1, COLS - 1);
          break;
        case "right": {
          if (mode === "ht") {
            const stop = nextStop(cursor);
            const first = cells[cursor];
            const blank = cells
              .slice(cursor, stop)
              .every(
                (c) =>
                  c.ch === " " &&
                  c.panel === first.panel &&
                  c.tab === undefined &&
                  c.padOf === undefined,
              );
            if (tmux && blank && stop > cursor) {
              cells[cursor] = { ...first, tab: stop - cursor };
              for (let x = cursor + 1; x < stop; x++)
                cells[x] = { ...cells[x], padOf: cursor };
            }
            cursor = stop;
          } else {
            cursor = op.to;
          }
          break;
        }
      }
    }
  }
  return { cells, cursor };
}

interface Token {
  text: string;
  bytes?: number;
  note?: boolean;
}

function tokens(step: Step, mode: Mode): Token[] {
  return step.ops.map((op) => {
    switch (op.kind) {
      case "fill":
        return { text: "16 blanks on the panel colour", note: true };
      case "move":
        return { text: `cursor to column ${op.to}`, note: true };
      case "write":
        return { text: op.ch, bytes: 1 };
      default:
        return mode === "ht"
          ? { text: "HT", bytes: 1 }
          : { text: "ESC [ 6 C", bytes: 4 };
    }
  });
}

function ranges(cols: number[]): string {
  const out: string[] = [];
  let i = 0;
  while (i < cols.length) {
    let j = i;
    while (j + 1 < cols.length && cols[j + 1] === cols[j] + 1) j++;
    out.push(i === j ? `${cols[i]}` : `${cols[i]} to ${cols[j]}`);
    i = j + 1;
  }
  return out.join(" and ");
}

function describe(screen: Screen): string {
  const holes = screen.cells.flatMap((c, i) => (c.panel ? [] : [i]));
  const tab = screen.cells.findIndex((c) => c.tab !== undefined);
  const parts: string[] = [];
  parts.push(
    holes.length === 0
      ? "every cell has the panel colour"
      : `columns ${ranges(holes)} show the terminal ground, not the panel colour`,
  );
  if (tab >= 0)
    parts.push(
      `a tab cell covers columns ${tab} to ${tab + (screen.cells[tab].tab ?? 1) - 1}`,
    );
  return parts.join("; ");
}

function Row({ label, screen }: { label: string; screen: Screen }) {
  const tabHead = screen.cells.findIndex((c) => c.tab !== undefined);
  const tabWidth = tabHead >= 0 ? (screen.cells[tabHead].tab ?? 0) : 0;
  return (
    <div>
      <p className="mb-1.5 text-xs text-fd-muted-foreground">{label}</p>
      <div className="pb-1">
        <div
          role="img"
          aria-label={`${label}: ${describe(screen)}.`}
          className="relative inline-block"
        >
          <div className="flex gap-px">
            {screen.cells.map((c, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: columns are positions
                key={i}
                className={cn(
                  "flex h-8 w-6 shrink-0 items-center justify-center rounded-sm font-mono text-sm",
                  c.panel
                    ? "text-white"
                    : "border border-dashed border-fd-primary bg-fd-background text-fd-primary",
                  i === screen.cursor &&
                    "ring-2 ring-inset ring-fd-foreground/70",
                )}
                style={c.panel ? { backgroundColor: PANEL } : undefined}
              >
                {c.panel ? c.ch : "·"}
              </div>
            ))}
          </div>
          {tabHead >= 0 && (
            <div
              aria-hidden
              className="absolute -bottom-1 h-1 rounded-full bg-fd-primary"
              style={{
                left: `calc(${tabHead} * (1.5rem + 1px))`,
                width: `calc(${tabWidth} * (1.5rem + 1px) - 1px)`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function HardTabHole() {
  const [mode, setMode] = useState<Mode>("ht");
  const [step, setStep] = useState(0);
  const statusId = useId();

  const emu = play(step, mode, false);
  const tmux = play(step, mode, true);
  const current = tokens(STEPS[step], mode);

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-3 border-b border-fd-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-fd-muted-foreground">
            move right with
          </span>
          <fieldset
            aria-label="How the renderer moves the cursor right"
            className="m-0 inline-flex min-w-0 overflow-hidden rounded-md border border-fd-border p-0"
          >
            {(
              [
                ["ht", "HT (before 947e70ed)"],
                ["cuf", "CUF (after)"],
              ] as [Mode, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
                className={cn(
                  "px-2.5 py-1.5 font-mono text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-fd-primary",
                  mode === value
                    ? "bg-fd-primary text-fd-primary-foreground"
                    : "text-fd-muted-foreground hover:text-fd-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </fieldset>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            aria-label="Previous step"
            className="rounded-md border border-fd-border px-2.5 py-1 font-mono text-xs text-fd-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary disabled:opacity-40"
          >
            Prev
          </button>
          <span className="font-mono text-xs tabular-nums text-fd-muted-foreground">
            step {step + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={step === STEPS.length - 1}
            aria-label="Next step"
            className="rounded-md border border-fd-border px-2.5 py-1 font-mono text-xs text-fd-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <div className="border-b border-fd-border px-4 py-3">
        <p
          id={statusId}
          aria-live="polite"
          className="text-sm text-fd-foreground"
        >
          {STEPS[step].title}{" "}
          {step >= 2 && (
            <span className="text-fd-muted-foreground">
              The move is {mode === "ht" ? "HT, 1 byte" : "CUF, 4 bytes"}. In
              tmux, {describe(tmux)}.
            </span>
          )}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="mr-1 text-fd-muted-foreground">this step:</span>
          {current.map((t, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: tokens are ordered
              key={i}
              className={cn(
                "rounded border px-1.5 py-0.5",
                t.note
                  ? "border-dashed border-fd-border text-fd-muted-foreground"
                  : t.text === "HT"
                    ? "border-fd-primary bg-fd-primary/10 text-fd-foreground"
                    : "border-fd-border text-fd-foreground",
              )}
            >
              {t.text}
            </span>
          ))}
        </div>
      </div>

      <div
        className="overflow-x-auto bg-fd-background/40 p-4"
        aria-describedby={statusId}
      >
        <div className="flex w-max flex-col gap-4">
          <div
            className="flex gap-px font-mono text-[10px] text-fd-muted-foreground"
            aria-hidden
          >
            {Array.from({ length: COLS }, (_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: column numbers
                key={i}
                className={cn(
                  "w-6 shrink-0 text-center",
                  TAB_STOPS.includes(i) && "font-bold text-fd-foreground",
                )}
              >
                {i}
              </div>
            ))}
          </div>
          <Row label="xterm, or tuios's own emulator" screen={emu} />
          <Row label="tmux 3.6 and later" screen={tmux} />
        </div>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        One row of a panel over three frames. Tab stops are at columns 0 and 8.
        The ringed cell is the cursor, the bar under a row marks a tmux tab
        cell, and a dotted cell shows the terminal's own ground where the panel
        colour should be. With HT, tmux keeps columns 2 to 7 as one tab cell,
        and the write at column 5 resets the rest of it. With CUF there is no
        tab cell to break.
      </figcaption>
    </figure>
  );
}
