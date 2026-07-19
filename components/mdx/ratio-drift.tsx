'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The layout writes a ratio out as integer rows by truncating, and the sync
 * reads it back by dividing. Both halves are individually reasonable. Together
 * they lose a fraction on every pass, always downward, and then settle on a
 * value they will not leave, which is what made the round-trip test useless.
 */
function applyLayout(ratio: number, extent: number) {
  return Math.trunc(ratio * extent);
}
function syncFromGeometry(line: number, extent: number) {
  return line / extent;
}

const START_EXTENT = 29;

interface Pass {
  ratio: number;
  line: number;
  extent: number;
}

export function RatioDrift() {
  const [extent, setExtent] = useState(START_EXTENT);
  const [ratio, setRatio] = useState(0.5);
  const [history, setHistory] = useState<Pass[]>([
    { ratio: 0.5, line: applyLayout(0.5, START_EXTENT), extent: START_EXTENT },
  ]);

  const line = applyLayout(ratio, extent);
  const top = line;
  const bottom = extent - line;

  const sync = () => {
    const next = syncFromGeometry(applyLayout(ratio, extent), extent);
    setRatio(next);
    setHistory((h) => [...h, { ratio: next, line: applyLayout(next, extent), extent }]);
  };

  const resize = (delta: number) => {
    const e = Math.max(10, Math.min(60, extent + delta));
    setExtent(e);
    setHistory((h) => [...h, { ratio, line: applyLayout(ratio, e), extent: e }]);
  };

  const reset = () => {
    setExtent(START_EXTENT);
    setRatio(0.5);
    setHistory([{ ratio: 0.5, line: applyLayout(0.5, START_EXTENT), extent: START_EXTENT }]);
  };

  const drifted = Math.abs(ratio - 0.5) > 1e-9;
  const even = Math.abs(top - bottom) <= 1;

  // The fraction is shown alongside the decimal because 14/29 explains where
  // 0.482759 came from and a decimal on its own does not.
  const fraction = `${line}/${extent}`;

  const chartPoints = history
    .map((p, i) => {
      const x = history.length === 1 ? 0 : (i / (history.length - 1)) * 100;
      // Plot 0.44 to 0.51 so the drift is visible rather than a flat line.
      const y = 24 - ((p.ratio - 0.44) / 0.07) * 24;
      return `${x},${Math.max(0, Math.min(24, y))}`;
    })
    .join(' ');

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
        {/* The pair, drawn at whatever the current ratio and extent produce. */}
        <div className="flex w-full shrink-0 flex-col gap-0.5 sm:w-52">
          <div
            className="flex items-center justify-center rounded-t bg-fd-muted/60 font-mono text-xs text-fd-foreground"
            style={{ height: `${(top / extent) * 160}px`, minHeight: 18 }}
          >
            {top} rows
          </div>
          <div
            className="flex items-center justify-center rounded-b bg-fd-muted/30 font-mono text-xs text-fd-foreground"
            style={{ height: `${(bottom / extent) * 160}px`, minHeight: 18 }}
          >
            {bottom} rows
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 font-mono text-sm">
            <span className="text-fd-muted-foreground">stored ratio</span>
            <span className={cn('tabular-nums', drifted ? 'text-fd-primary' : 'text-fd-foreground')}>
              {ratio.toFixed(6)}
            </span>
            <span className="text-fd-muted-foreground">= {fraction}</span>
          </div>

          <svg
            viewBox="0 0 100 24"
            className="h-16 w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Stored ratio across ${history.length} passes, currently ${ratio.toFixed(6)}.`}
          >
            <line
              x1="0"
              y1={24 - ((0.5 - 0.44) / 0.07) * 24}
              x2="100"
              y2={24 - ((0.5 - 0.44) / 0.07) * 24}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeDasharray="2 2"
              className="text-fd-muted-foreground/50"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={chartPoints}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              className="text-fd-primary"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="font-mono text-xs text-fd-muted-foreground">
            dashed line is 0.500, {history.length - 1} pass
            {history.length === 2 ? '' : 'es'} so far
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-fd-border p-4">
        <button
          type="button"
          onClick={sync}
          className="rounded-md border border-fd-border px-3 py-1.5 text-sm text-fd-foreground hover:border-fd-primary/60 focus:outline-none focus:ring-1 focus:ring-fd-primary"
        >
          sync once
        </button>
        <button
          type="button"
          onClick={() => resize(+1)}
          className="rounded-md border border-fd-border px-3 py-1.5 font-mono text-sm text-fd-foreground hover:border-fd-primary/60 focus:outline-none focus:ring-1 focus:ring-fd-primary"
        >
          grow
        </button>
        <button
          type="button"
          onClick={() => resize(-1)}
          className="rounded-md border border-fd-border px-3 py-1.5 font-mono text-sm text-fd-foreground hover:border-fd-primary/60 focus:outline-none focus:ring-1 focus:ring-fd-primary"
        >
          shrink
        </button>
        <span className="ml-2 font-mono text-xs text-fd-muted-foreground">
          total {extent} rows
        </span>
        <button
          type="button"
          onClick={reset}
          className="ml-auto text-sm text-fd-muted-foreground hover:text-fd-foreground focus:outline-none focus:ring-1 focus:ring-fd-primary"
        >
          reset
        </button>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        Press <strong>sync once</strong>. The ratio goes from 0.500 to 0.482759,
        which is 14/29, and every press after that leaves it there. One-way, then
        a fixed point, which is why a test that syncs a fresh layout and finds it
        stable can never see the loss that already happened. Now grow the pair to
        36 rows: {even ? 'the split is still even' : 'the split is visibly lopsided'}.
        At 0.5 that would be 18 rows against 18.
      </figcaption>
    </figure>
  );
}
