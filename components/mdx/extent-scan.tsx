"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/** The benchmark's screen width, and the size of one uv.Cell in bytes. */
const WIDTH = 207;
const CELL_BYTES = 112;
const CLOCK = "22:03";

const PRESETS = [
  { label: "tuiosflood", text: "tuiosflood", note: "the benchmark line" },
  {
    label: "go test",
    text: "ok      github.com/Gaurav-Gosain/tuios/internal/vt  5.122s",
    note: "one line of go test output",
  },
  { label: "empty line", text: "", note: "a bare newline" },
] as const;

interface Touch {
  /** Cells the trailing-blank trim reads before it finds the text. */
  reads: number;
  /** Cells the blanking of the recycled row writes. */
  writes: number;
  /** First column the trim reads, walking right to left down to `readTo`. */
  readFrom: number;
  readTo: number;
}

interface Row {
  cells: string[];
  /** One past the last non-blank column, 0 for a blank row. */
  textEnd: number;
  /** The row's extent: one past the last column anything was written to. */
  ext: number;
}

function buildRow(text: string, clock: boolean): Row {
  const cells = Array.from({ length: WIDTH }, () => " ");
  const shown = text.slice(0, clock ? WIDTH - CLOCK.length : WIDTH);
  for (let i = 0; i < shown.length; i++) cells[i] = shown[i];
  if (clock) {
    for (let i = 0; i < CLOCK.length; i++) {
      cells[WIDTH - CLOCK.length + i] = CLOCK[i];
    }
  }
  let textEnd = WIDTH;
  while (textEnd > 0 && cells[textEnd - 1] === " ") textEnd--;
  // The extent is raised by every write, spaces included, and is never
  // lowered by one. A prompt that moves the cursor to the right edge and
  // prints raises it to the full width.
  const ext = clock ? WIDTH : shown.length;
  return { cells, textEnd, ext };
}

/**
 * The trim walks left from where it starts until it meets a non-blank cell,
 * reading that one too. Before the change it started at the end of the row;
 * after, at the row's extent. The blanking writes every cell up to where it
 * stops: the end of the row before, the extent after.
 */
function touch(row: Row, bounded: boolean): Touch {
  const start = bounded ? row.ext : WIDTH;
  const stop = row.textEnd > 0 ? row.textEnd - 1 : 0;
  const reads = start === 0 ? 0 : start - stop;
  return {
    reads,
    writes: start,
    readFrom: start - 1,
    readTo: reads === 0 ? start : stop,
  };
}

function fmt(n: number) {
  return n.toLocaleString("en-GB");
}

function kib(cells: number) {
  const bytes = cells * CELL_BYTES;
  const one = { maximumFractionDigits: 1 };
  if (bytes < 1024) return `${fmt(bytes)} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toLocaleString("en-GB", one)} KiB`;
  }
  return `${(bytes / 1024 / 1024).toLocaleString("en-GB", one)} MiB`;
}

function Count({
  cells,
  strong,
  note,
}: {
  cells: number;
  strong?: boolean;
  note?: string;
}) {
  return (
    <td className="p-3 text-right align-top tabular-nums">
      <span
        className={cn(
          "block",
          strong ? "text-fd-primary" : "text-fd-foreground",
        )}
      >
        {fmt(cells)} cells
      </span>
      <span className="block text-xs text-fd-muted-foreground">
        {kib(cells)}
        {note ? `, ${note}` : ""}
      </span>
    </td>
  );
}

function Strip({ row, t, label }: { row: Row; t: Touch; label: string }) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 font-mono text-xs">
        <span className="text-fd-foreground">{label}</span>
        <span className="text-fd-muted-foreground tabular-nums">
          {fmt(t.reads)} read, {fmt(t.writes)} written
        </span>
      </div>
      <div
        role="img"
        aria-label={`${label}: the trim reads ${t.reads} of ${WIDTH} cells and the blanking writes ${t.writes}.`}
        className="grid grid-cols-[repeat(23,minmax(0,1fr))] gap-px overflow-hidden rounded bg-fd-border/50 sm:grid-cols-[repeat(69,minmax(0,1fr))]"
      >
        {row.cells.map((ch, x) => {
          const read = t.reads > 0 && x <= t.readFrom && x >= t.readTo;
          const written = x < t.writes;
          const text = ch !== " ";
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: cells are columns
              key={x}
              className={cn(
                "relative flex h-4 items-center justify-center font-mono text-[9px] leading-none sm:h-5",
                read ? "bg-fd-primary/30" : "bg-fd-background",
                text ? "text-fd-foreground" : "text-transparent",
              )}
            >
              {text ? ch : "."}
              {written && (
                <span className="absolute inset-x-0 bottom-0 h-[3px] bg-fd-muted-foreground/70" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * One 207-column row leaving the screen. Before the change the scrollback
 * push trimmed trailing blanks from the end of the row and the scroll then
 * blanked the whole row for reuse. After it, both stop at the row's extent.
 * The text itself is written and encoded the same way in both, so it is left
 * out of the counts.
 */
export function ExtentScan() {
  const inputId = useId();
  const clockId = useId();
  const [text, setText] = useState<string>(PRESETS[0].text);
  const [clock, setClock] = useState(false);
  const [total, setTotal] = useState({ lines: 0, before: 0, after: 0 });

  const row = buildRow(text, clock);
  const before = touch(row, false);
  const after = touch(row, true);
  const perBefore = before.reads + before.writes;
  const perAfter = after.reads + after.writes;

  const scroll = (n: number) =>
    setTotal((t) => ({
      lines: t.lines + n,
      before: t.before + n * perBefore,
      after: t.after + n * perAfter,
    }));

  const ratio =
    total.after > 0 ? total.before / total.after : Number.POSITIVE_INFINITY;

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              title={p.note}
              onClick={() => setText(p.text)}
              aria-pressed={text === p.text}
              className={cn(
                "rounded-md border px-3 py-1.5 font-mono text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary",
                text === p.text
                  ? "border-fd-primary/60 text-fd-foreground"
                  : "border-fd-border text-fd-muted-foreground hover:border-fd-primary/40",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            scroll(1);
          }}
        >
          <label htmlFor={inputId} className="sr-only">
            Line to print before the newline
          </label>
          <input
            id={inputId}
            value={text}
            maxLength={WIDTH}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => setText(e.target.value)}
            placeholder="type a line"
            className="min-w-0 flex-1 basis-48 rounded-md border border-fd-border bg-fd-background px-3 py-1.5 font-mono text-sm text-fd-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary"
          />
          <button
            type="submit"
            className="rounded-md border border-fd-primary/60 px-3 py-1.5 text-sm text-fd-foreground hover:bg-fd-primary/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary"
          >
            Enter: scroll one line
          </button>
          <button
            type="button"
            onClick={() => scroll(1000)}
            className="rounded-md border border-fd-border px-3 py-1.5 text-sm text-fd-muted-foreground hover:border-fd-primary/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary"
          >
            Flood 1,000
          </button>
          <button
            type="button"
            onClick={() => setTotal({ lines: 0, before: 0, after: 0 })}
            className="rounded-md border border-fd-border px-3 py-1.5 text-sm text-fd-muted-foreground hover:border-fd-primary/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary"
          >
            Reset
          </button>
        </form>

        <label
          htmlFor={clockId}
          className="flex w-fit items-center gap-2 text-sm text-fd-muted-foreground"
        >
          <input
            id={clockId}
            type="checkbox"
            checked={clock}
            onChange={(e) => setClock(e.target.checked)}
            className="accent-[var(--color-fd-primary)]"
          />
          a prompt also drew a clock at the right edge
        </label>
      </div>

      <div className="flex flex-col gap-5 border-t border-fd-border p-4">
        <Strip row={row} t={before} label="before: the whole row" />
        <Strip
          row={row}
          t={after}
          label={`after: up to the extent (${row.ext})`}
        />
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-fd-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm bg-fd-primary/30" />
            read by the trailing-blank trim
          </span>
          <span className="flex items-center gap-1.5">
            <span className="relative inline-block size-3 rounded-sm border border-fd-border">
              <span className="absolute inset-x-0 bottom-0 h-[3px] bg-fd-muted-foreground/70" />
            </span>
            written by blanking the row
          </span>
        </div>
      </div>

      <div className="overflow-x-auto border-t border-fd-border">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Cells of the blank tail touched per line and in total
          </caption>
          <thead>
            <tr className="text-fd-muted-foreground">
              <th scope="col" className="p-3 text-left font-medium" />
              <th scope="col" className="p-3 text-right font-medium">
                this line
              </th>
              <th scope="col" className="p-3 text-right font-medium">
                {fmt(total.lines)} {total.lines === 1 ? "line" : "lines"}{" "}
                scrolled
              </th>
            </tr>
          </thead>
          <tbody aria-live="polite">
            <tr className="border-t border-fd-border">
              <th scope="row" className="p-3 text-left font-normal">
                before
              </th>
              <Count cells={perBefore} />
              <Count cells={total.before} />
            </tr>
            <tr className="border-t border-fd-border">
              <th scope="row" className="p-3 text-left font-normal">
                after
              </th>
              <Count cells={perAfter} />
              <Count
                cells={total.after}
                strong
                note={
                  total.lines === 0
                    ? undefined
                    : Number.isFinite(ratio)
                      ? `${ratio.toLocaleString("en-GB", { maximumFractionDigits: 1 })}x fewer`
                      : "none touched"
                }
              />
            </tr>
          </tbody>
        </table>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-xs leading-relaxed text-fd-muted-foreground">
        One row of the 207-column benchmark screen as it scrolls off the top.
        The counts cover only the two walks the extent changed: the scrollback
        push reading back from the end to find the text, and the scroll blanking
        the row for reuse. Writing the text and encoding it into the scrollback
        cost the same in both and are left out. Bytes are cells times 112, the
        size of one cell. Type trailing spaces and the extent grows with them:
        it is an upper bound, not the exact end of the text.
      </figcaption>
    </figure>
  );
}
