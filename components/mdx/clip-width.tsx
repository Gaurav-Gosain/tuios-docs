'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The offscreen guard in clipWindowContent (tuios internal/app/render_helpers.go),
 * on the layout the bug kept showing up in: one tall pane on the left, two
 * stacked on the right. A pane's frame is discarded when x + width <= 0. The
 * width used to come from the first line only, and now comes from the widest
 * line. Only a pane at x = 0 can trip the guard with a zero width, which is why
 * it was always one pane and never the whole screen.
 */
interface Pane {
  id: string;
  label: string;
  x: number;
  lines: string[];
}

const SCREEN = 80;

const PANES: Pane[] = [
  {
    id: 'left',
    label: 'left',
    x: 0,
    lines: ['  1 package app', '  2', '  3 import (', '  4   "strings"', '  5 )', '~', '~'],
  },
  {
    id: 'top',
    label: 'top right',
    x: 40,
    lines: ['~/dev/tuios', '$ go test ./...', 'ok  internal/app'],
  },
  {
    id: 'bottom',
    label: 'bottom right',
    x: 40,
    lines: ['~/dev/tuios', '$ git status', 'nothing to commit'],
  },
];

export function ClipWidth() {
  const [widest, setWidest] = useState(false);
  const [blank, setBlank] = useState<Record<string, boolean>>({ left: true });

  const frames = PANES.map((p) => {
    const lines = blank[p.id] ? ['', ...p.lines.slice(1)] : p.lines;
    const width = widest
      ? Math.max(...lines.map((l) => l.length))
      : lines[0].length;
    const discarded = p.x + width <= 0;
    return { ...p, lines, width, discarded };
  });

  const box = (f: (typeof frames)[number], className: string) => (
    <div
      key={f.id}
      className={cn(
        'overflow-hidden rounded-sm border p-1.5 font-mono text-[10px] leading-snug sm:text-xs',
        f.discarded
          ? 'border-fd-primary/70 border-dashed bg-fd-background'
          : 'border-fd-border bg-fd-muted/40',
        className,
      )}
      role="img"
      aria-label={`${f.label} pane: ${f.discarded ? 'discarded, drawn as bare background' : 'drawn'}`}
    >
      {f.discarded
        ? null
        : f.lines.map((l, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed content
              key={i}
              className="truncate whitespace-pre text-fd-foreground"
            >
              {l || ' '}
            </div>
          ))}
    </div>
  );

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div
        className="mx-auto grid max-w-[520px] grid-cols-2 gap-1 p-4"
        style={{ gridTemplateRows: 'repeat(2, minmax(4.5rem, auto))' }}
      >
        {box(frames[0], 'row-span-2')}
        {box(frames[1], '')}
        {box(frames[2], '')}
      </div>

      <div className="flex flex-col gap-3 border-t border-fd-border p-4">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">How the window width is measured</legend>
          {[
            { v: false, label: 'width of lines[0]' },
            { v: true, label: 'width of the widest line' },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={widest === o.v}
              onClick={() => setWidest(o.v)}
              className={cn(
                'rounded-md border px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-fd-primary',
                widest === o.v
                  ? 'border-fd-primary bg-fd-primary/10 text-fd-foreground'
                  : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/60',
              )}
            >
              {o.label}
            </button>
          ))}
        </fieldset>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {PANES.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!blank[p.id]}
                onChange={(e) => setBlank((b) => ({ ...b, [p.id]: e.target.checked }))}
                className="size-4 accent-current"
              />
              <span className="text-fd-foreground">{p.label}: first line blank</span>
            </label>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border-t border-fd-border px-4 py-3" aria-live="polite">
        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="text-left text-fd-muted-foreground">
              <th className="pr-3 font-normal">pane</th>
              <th className="pr-3 font-normal">x</th>
              <th className="pr-3 font-normal">width</th>
              <th className="font-normal">x + width &lt;= 0</th>
            </tr>
          </thead>
          <tbody>
            {frames.map((f) => (
              <tr key={f.id}>
                <td className="pr-3 text-fd-foreground">{f.label}</td>
                <td className="pr-3 text-fd-foreground">{f.x}</td>
                <td className="pr-3 text-fd-foreground">{f.width}</td>
                <td className={f.discarded ? 'text-fd-primary' : 'text-fd-muted-foreground'}>
                  {f.discarded ? 'true: discarded' : 'false: drawn'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        A model of the guard on an {SCREEN}-column screen. With the width taken
        from <code>lines[0]</code>, a blank first line measures zero, and the
        pane at x = 0 is thrown away as off-screen. Blank the first line of a
        right-hand pane and nothing happens, because 40 + 0 is still on screen.
        Switch to the widest line and every pane draws.
      </figcaption>
    </figure>
  );
}
