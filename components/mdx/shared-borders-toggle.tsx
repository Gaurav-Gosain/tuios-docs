'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Tiled windows can share borders. With individual borders every pane draws its
 * own full frame, so the gutter between two panes is two characters wide and the
 * content area is that much smaller. With shared borders the panes render
 * borderless and a single separator line is drawn between them, with proper
 * junction characters where lines meet, and the content areas grow to claim the
 * freed cells. The switch flips between the two on a miniature four-pane layout;
 * the math is the whole point, so the caption reports the content size directly.
 */

interface Corner {
  /** The junction glyph drawn where interior separators meet. */
  glyph: string;
  /** Absolute placement, as inline style. */
  style: React.CSSProperties;
}

// The five junctions of a 2x2 grid: the centre cross, and the four T-junctions
// where an interior separator meets the outer frame.
const JUNCTIONS: Corner[] = [
  { glyph: '┼', style: { left: '50%', top: '50%' } },
  { glyph: '┬', style: { left: '50%', top: 0 } },
  { glyph: '┴', style: { left: '50%', bottom: 0 } },
  { glyph: '├', style: { left: 0, top: '50%' } },
  { glyph: '┤', style: { right: 0, top: '50%' } },
];

export function SharedBordersToggle() {
  const [shared, setShared] = useState(false);

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/40 px-3 py-2">
        <span className="font-mono text-xs text-fd-muted-foreground">
          bsp workspace
        </span>
        <span className="ml-auto font-mono text-xs tabular-nums text-fd-muted-foreground">
          each pane&rsquo;s content: {shared ? '78x24' : '76x22'}
        </span>
      </div>

      <div className="bg-fd-background/40 p-3">
        {/* The outer frame stays; only the interior gutters change. */}
        <div className="relative h-52 rounded-sm border border-fd-border/70 bg-fd-background">
          <div
            className={cn(
              'grid h-full grid-cols-2 grid-rows-2 transition-all duration-300 ease-out motion-reduce:transition-none',
              shared ? 'gap-0 p-0' : 'gap-1.5 p-1.5',
            )}
          >
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'flex flex-col overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none',
                  shared
                    ? 'rounded-none border-0'
                    : 'rounded-sm border border-fd-border/70',
                )}
              >
                <div
                  className={cn(
                    'flex items-center gap-1 px-1.5 py-0.5 transition-colors duration-300 motion-reduce:transition-none',
                    shared ? 'bg-fd-muted/25' : 'bg-fd-muted/40',
                  )}
                >
                  <span
                    className="size-1.5 rounded-full bg-fd-muted-foreground/40"
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[9px] text-fd-muted-foreground">
                    win {i + 1}
                  </span>
                </div>
                {/* Dimmed content fill. It grows to the separators when borders
                    are shared and shrinks inside the frame when they are not. */}
                <div className="m-px flex-1 rounded-[1px] bg-fd-muted-foreground/10" />
              </div>
            ))}
          </div>

          {/* Interior separators and their junction characters, drawn only in
              the shared position. Single lines, one cell wide, tmux-style. */}
          {shared ? (
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-fd-border" />
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-fd-border" />
              {JUNCTIONS.map((j) => (
                <span
                  key={j.glyph}
                  style={j.style}
                  className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[11px] leading-none text-fd-muted-foreground"
                >
                  {j.glyph}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* The switch. */}
      <div className="flex flex-wrap items-center gap-3 border-t border-fd-border px-4 py-3">
        <div
          className="inline-flex overflow-hidden rounded-md border border-fd-border"
          role="group"
          aria-label="border style"
        >
          {(
            [
              ['individual borders', false],
              ['shared borders', true],
            ] as const
          ).map(([label, value]) => (
            <button
              key={label}
              type="button"
              aria-pressed={shared === value}
              onClick={() => setShared(value)}
              className={cn(
                'px-3 py-1.5 font-mono text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary motion-reduce:transition-none',
                shared === value
                  ? 'bg-fd-primary text-fd-primary-foreground'
                  : 'text-fd-muted-foreground hover:text-fd-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        With <strong>individual borders</strong> every pane draws its own frame,
        so the gutter between two panes is two cells wide. With{' '}
        <strong>shared borders</strong> the panes render borderless, a single
        separator line is drawn between them with proper junction characters, and
        the content areas grow into the freed cells.
      </figcaption>
    </figure>
  );
}
