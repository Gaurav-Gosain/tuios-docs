'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The guard that decides whether a pane body may skip lipgloss.Wrap. The
 * renderer sums the printed cell widths of each row as it emits it, and
 * publishes the rectangle only when every row landed exactly on the pane's
 * content width and the row count matched. Anything else publishes zero, and
 * zero means the old wrapping path runs (internal/app/render.go).
 *
 * The column widths below are written by hand, the way the emulator's cell
 * grid decides them: a CJK ideograph, a ZWJ family and a flag pair take two
 * columns, a combining mark takes none. Bytes and runes are computed from the
 * strings, to show why the guard never counts them.
 */
interface Sample {
  label: string;
  text: string;
  /** Columns the text occupies before padding. */
  cols: number;
}

const SAMPLES: Sample[] = [
  { label: 'ascii', text: 'ls -la', cols: 6 },
  { label: 'cjk', text: '你好世界', cols: 8 },
  { label: 'combining', text: 'café', cols: 4 },
  { label: 'zwj family', text: '\u{1F468}‍\u{1F469}‍\u{1F467} ok', cols: 5 },
  { label: 'flag pair', text: '\u{1F1EF}\u{1F1F5} jp', cols: 5 },
  { label: 'blocks', text: '▀▄█▌▐░▒▓', cols: 8 },
];

const PANE_COLS = 10;
const MIN_GRID = 8;
const MAX_GRID = 12;

const encoder = new TextEncoder();

export function PreshapedGuard() {
  const [grid, setGrid] = useState(PANE_COLS);

  // Mid-resize the emulator's grid can lag the pane. Every row the emulator
  // produced is exactly as wide as its own grid, which is what the guard sees.
  const rows = SAMPLES.map((s) => {
    const line = s.text + ' '.repeat(grid - s.cols);
    return {
      ...s,
      line,
      bytes: encoder.encode(line).length,
      runes: Array.from(line).length,
      columns: grid,
    };
  });

  const vouches = rows.every((r) => r.columns === PANE_COLS);

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-sm">
          <caption className="sr-only">
            Each row of the pane body with its byte, rune and column count. The
            guard only looks at columns.
          </caption>
          <thead>
            <tr className="border-b border-fd-border text-left text-xs text-fd-muted-foreground">
              <th scope="col" className="px-3 py-2 font-normal sm:px-4">
                row
              </th>
              <th scope="col" className="px-2 py-2 text-right font-normal">
                bytes
              </th>
              <th scope="col" className="px-2 py-2 text-right font-normal">
                runes
              </th>
              <th scope="col" className="px-3 py-2 text-right font-normal sm:px-4">
                columns
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-fd-border/60 last:border-b-0">
                <td className="px-3 py-1.5 sm:px-4">
                  <span className="whitespace-pre rounded-sm px-0.5 text-fd-foreground outline outline-1 outline-fd-border">
                    {r.line}
                  </span>
                  <span className="block text-xs text-fd-muted-foreground sm:ml-3 sm:inline">
                    {r.label}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-fd-muted-foreground">
                  {r.bytes}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-fd-muted-foreground">
                  {r.runes}
                </td>
                <td
                  className={cn(
                    'px-3 py-1.5 text-right tabular-nums sm:px-4',
                    r.columns === PANE_COLS ? 'text-fd-foreground' : 'text-fd-primary',
                  )}
                >
                  {r.columns}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-fd-border p-4">
        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="shrink-0 text-fd-muted-foreground">
            emulator grid width
          </span>
          <input
            type="range"
            min={MIN_GRID}
            max={MAX_GRID}
            step={1}
            value={grid}
            onChange={(e) => setGrid(Number(e.target.value))}
            className="min-w-32 flex-1 accent-current"
            aria-label={`Emulator grid width in columns. The pane is ${PANE_COLS} columns wide.`}
          />
          <span className="font-mono text-xs tabular-nums text-fd-muted-foreground">
            {grid} of {PANE_COLS} cols
          </span>
        </label>
      </div>

      <div
        className="border-t border-fd-border px-4 py-3 font-mono text-sm"
        aria-live="polite"
      >
        {vouches ? (
          <span className="text-fd-foreground">
            every row is {PANE_COLS} columns, {rows.length} rows: publishes{' '}
            {PANE_COLS}x{rows.length}, wrap skipped
          </span>
        ) : (
          <span className="text-fd-primary">
            rows are {grid} columns, pane is {PANE_COLS}: publishes 0x0, frame
            goes through the wrap as before
          </span>
        )}
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        A model of the guard, with a pane {PANE_COLS} columns wide. At the
        pane&apos;s own width the byte and rune counts are all over the place
        and the column count is {PANE_COLS} on every row, which is the only
        number the guard trusts. Drag the grid off the pane&apos;s width, as
        it is for a moment during a resize, and the renderer declines to vouch
        for the frame instead of reporting a rectangle that is wrong. Your
        browser&apos;s font may not draw every glyph at exactly one or two
        columns; the counts are what the emulator&apos;s grid decides.
      </figcaption>
    </figure>
  );
}
