'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Windows created in a daemon session used to skip placement: they landed at the
 * same origin and stacked, while the mode indicator still claimed TILING. The
 * switch flips the same set of windows between the old placement and the new
 * one, so a reader can pile up five and watch them snap into a grid. Placement
 * now runs for daemon-created windows too, which is the whole fix.
 */

const MAX = 6;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A binary space partition: each new window splits the most recent pane along
 * its longer side. This is the tiling the reader sees in the "now" position.
 */
function bspRects(n: number): Rect[] {
  if (n <= 0) return [];
  const rects: Rect[] = [{ x: 0, y: 0, w: 100, h: 100 }];
  for (let i = 1; i < n; i++) {
    const last = rects[rects.length - 1];
    let a: Rect;
    let b: Rect;
    if (last.w >= last.h) {
      a = { x: last.x, y: last.y, w: last.w / 2, h: last.h };
      b = { x: last.x + last.w / 2, y: last.y, w: last.w / 2, h: last.h };
    } else {
      a = { x: last.x, y: last.y, w: last.w, h: last.h / 2 };
      b = { x: last.x, y: last.y + last.h / 2, w: last.w, h: last.h / 2 };
    }
    rects[rects.length - 1] = a;
    rects.push(b);
  }
  return rects;
}

export function DaemonTilePlacement() {
  const [count, setCount] = useState(3);
  const [mode, setMode] = useState<'v0.7.0' | 'now'>('v0.7.0');

  const tiled = useMemo(() => bspRects(count), [count]);

  const geometry = (i: number): React.CSSProperties => {
    if (mode === 'now') {
      const r = tiled[i];
      return {
        left: `calc(${r.x}% + 3px)`,
        top: `calc(${r.y}% + 3px)`,
        width: `calc(${r.w}% - 6px)`,
        height: `calc(${r.h}% - 6px)`,
      };
    }
    // Stacked at the same origin, offset just enough to see the pile.
    return {
      left: `${8 + i * 7}%`,
      top: `${8 + i * 10}%`,
      width: '52%',
      height: '42%',
    };
  };

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="relative h-60 overflow-hidden bg-fd-background/40 p-3">
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className={cn(
              'absolute flex flex-col overflow-hidden rounded-sm border shadow-sm transition-all duration-300 ease-out motion-reduce:transition-none',
              i === count - 1
                ? 'z-10 border-fd-primary/70 bg-fd-background'
                : 'border-fd-border/70 bg-fd-background/85',
            )}
            style={geometry(i)}
          >
            <div className="flex items-center gap-1 border-b border-fd-border/60 bg-fd-muted/40 px-1.5 py-0.5">
              <span className="size-1.5 rounded-full bg-fd-muted-foreground/40" aria-hidden="true" />
              <span className="font-mono text-[9px] text-fd-muted-foreground">
                win {i + 1}
              </span>
            </div>
            <div className="flex-1 px-1.5 py-1 font-mono text-[10px] leading-4 text-fd-muted-foreground">
              <span className="text-fd-primary">~</span> $
            </div>
          </div>
        ))}

        {/* Dock: the layout mode indicator. */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
          <span className="rounded-sm bg-fd-primary/15 px-2 py-0.5 font-mono text-[10px] font-medium text-fd-primary">
            TILING
          </span>
          <span className="font-mono text-[10px] text-fd-muted-foreground">
            {count} window{count === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Controls. */}
      <div className="flex flex-wrap items-center gap-3 border-t border-fd-border px-4 py-3">
        <button
          type="button"
          onClick={() => setCount((c) => Math.min(MAX, c + 1))}
          disabled={count >= MAX}
          className="rounded-md border border-fd-border px-3 py-1.5 text-sm text-fd-foreground transition-colors hover:border-fd-primary/60 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary motion-reduce:transition-none"
        >
          open window
        </button>
        <button
          type="button"
          onClick={() => setCount(1)}
          className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary motion-reduce:transition-none"
        >
          reset
        </button>

        <div
          className="ml-auto inline-flex overflow-hidden rounded-md border border-fd-border"
          role="group"
          aria-label="placement version"
        >
          {(['v0.7.0', 'now'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                'px-3 py-1.5 font-mono text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary motion-reduce:transition-none',
                mode === m
                  ? 'bg-fd-primary text-fd-primary-foreground'
                  : 'text-fd-muted-foreground hover:text-fd-foreground',
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        Open a few windows in the <strong>v0.7.0</strong> position: they land at
        the same origin and pile up, though the dock still reads TILING. Flip to{' '}
        <strong>now</strong> and the same windows split and tile. Placement used
        to run only for windows the attached client created; daemon-created
        windows now tile too.
      </figcaption>
    </figure>
  );
}
