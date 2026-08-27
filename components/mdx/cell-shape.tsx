'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

const COLS = 10;
const ROWS = 4;

/**
 * The three states the capture's cell went through, at the measured numbers.
 * Round one and round two were measured against different kitty configs, so
 * each round carries the host it was actually held up against.
 */
const ROUNDS = [
  {
    id: 'one',
    label: 'round one: height guessed',
    host: 0.455,
    hostNote: 'kitty, 10 x 22 px',
    capture: 0.486,
    captureNote: 'M advance over 1.25 em',
  },
  {
    id: 'two',
    label: 'round two: both from the font',
    host: 0.45,
    hostNote: 'kitty, 9 x 20 px',
    capture: 0.4,
    captureNote: '5.76 x 14.4 px',
  },
  {
    id: 'fixed',
    label: 'fixed: asked the terminal',
    host: 0.4545,
    hostNote: 'kitty, 10 x 22 px',
    capture: 0.4545,
    captureNote: 'grown to the host cell',
  },
] as const;

function CellGrid({ ratio, label }: { ratio: number; label: string }) {
  // Cell height is fixed, width follows the ratio, so two grids drawn side by
  // side differ only in the thing being argued about.
  const cellH = 26;
  const cellW = cellH * ratio;
  return (
    <div className="min-w-0">
      <div className="mb-2 font-mono text-xs text-fd-muted-foreground">
        {label}
      </div>
      <div
        className="grid w-fit max-w-full gap-px overflow-hidden rounded bg-fd-border/60"
        style={{ gridTemplateColumns: `repeat(${COLS}, ${cellW}px)` }}
        role="img"
        aria-label={`${label}, cell aspect ratio ${ratio}.`}
      >
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-center bg-fd-background font-mono text-[10px] text-fd-muted-foreground"
            style={{ height: cellH }}
          >
            {'tuios$ ls -l'[i % 12] ?? ''}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The same grid drawn at the host's measured cell ratio and at the capture's,
 * for each of the two wrong rounds and the fix. The percentage is computed
 * from the two ratios on display, not asserted separately.
 */
export function CellShape() {
  const [idx, setIdx] = useState(1);
  const round = ROUNDS[idx];
  const offBy = (round.capture / round.host - 1) * 100;

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-wrap gap-2 p-4">
        {ROUNDS.map((r, i) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setIdx(i)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-fd-primary',
              i === idx
                ? 'border-fd-primary/60 text-fd-foreground'
                : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/40',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 overflow-x-auto border-t border-fd-border p-4 sm:flex-row sm:gap-8">
        <CellGrid ratio={round.host} label={`the terminal (${round.hostNote})`} />
        <CellGrid
          ratio={round.capture}
          label={`the capture (${round.captureNote})`}
        />
      </div>

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-fd-border px-4 py-3 font-mono text-sm">
        <span className="text-fd-muted-foreground">
          host {round.host.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')}
        </span>
        <span className="text-fd-muted-foreground">
          capture{' '}
          {round.capture.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')}
        </span>
        <span
          className={
            Math.abs(offBy) < 0.05 ? 'text-fd-foreground' : 'text-fd-primary'
          }
        >
          {Math.abs(offBy) < 0.05
            ? 'same shape'
            : `${offBy > 0 ? '+' : ''}${offBy.toFixed(1)}% ${
                offBy > 0 ? 'wider' : 'narrower'
              } per cell`}
        </span>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        The same ten columns at the measured ratios. Round one came out wider
        than the screen, round two narrower, and both errors are uniform, so
        nothing inside the picture looks broken. Only holding it against the
        terminal shows the shape is wrong. The two rounds were measured against
        different kitty configurations, which is why the host's own ratio
        differs between them.
      </figcaption>
    </figure>
  );
}
