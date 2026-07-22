'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The same string drawn two ways. The top row is what an unshaped terminal grid
 * does: one codepoint per cell, in memory order, left to right, each glyph
 * isolated in its own box so nothing can join across a cell boundary. The bottom
 * row is a plain span, which the browser shapes with HarfBuzz and orders
 * bidirectionally. For Arabic the two rows are not the same text laid out
 * differently; the top one is unreadable.
 */

function hex(cp: number) {
  return `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
}

const PRESETS: { label: string; value: string }[] = [
  { label: 'Arabic phrase', value: 'السلام عليكم' },
  { label: 'Latin ligature', value: 'ffi' },
  { label: 'Arabic with harakat', value: 'مُحَمَّد' },
  { label: 'Devanagari', value: 'नमस्ते' },
];

export function ShapingCompare() {
  const [value, setValue] = useState(PRESETS[0].value);
  const codepoints = useMemo(
    () => Array.from(value, (ch) => ch.codePointAt(0) ?? 0),
    [value],
  );

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="border-b border-fd-border p-4">
        <label
          htmlFor="shaping-input"
          className="mb-2 block text-sm font-medium text-fd-foreground"
        >
          Text to render
        </label>
        <input
          id="shaping-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck={false}
          className={cn(
            'w-full rounded-md border border-fd-border bg-fd-background px-3 py-2',
            'font-mono text-base text-fd-foreground',
            'focus:border-fd-primary focus:outline-none focus:ring-1 focus:ring-fd-primary',
          )}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setValue(p.value)}
              className={cn(
                'rounded-md border border-fd-border px-2.5 py-1 text-xs',
                'text-fd-muted-foreground transition-colors',
                'hover:border-fd-primary/50 hover:text-fd-foreground',
                'focus:outline-none focus:ring-1 focus:ring-fd-primary motion-reduce:transition-none',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Per codepoint: one isolated glyph per cell, memory order, left to right. */}
      <div className="border-b border-fd-border px-4 py-4">
        <div className="mb-2 font-mono text-xs uppercase tracking-wide text-fd-muted-foreground">
          per codepoint
        </div>
        <div className="overflow-x-auto" dir="ltr">
          <div className="flex min-w-max gap-1">
            {codepoints.map((cp, i) => (
              <div
                key={i}
                className="flex w-11 shrink-0 flex-col items-center gap-1 rounded-sm border border-fd-border bg-fd-background/60 px-1 py-1.5"
              >
                <span
                  className="flex h-8 items-center justify-center font-mono text-2xl leading-none text-fd-foreground"
                  style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
                >
                  {String.fromCodePoint(cp)}
                </span>
                <span className="font-mono text-[9px] tabular-nums text-fd-muted-foreground">
                  {hex(cp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shaped: a plain span, shaped and bidi-ordered by the browser. */}
      <div className="px-4 py-4">
        <div className="mb-2 font-mono text-xs uppercase tracking-wide text-fd-muted-foreground">
          shaped
        </div>
        <div
          dir="auto"
          className="rounded-sm border border-fd-primary/40 bg-fd-primary/5 px-3 py-3 font-mono text-2xl leading-tight text-fd-foreground"
        >
          {value || ' '}
        </div>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        The top row is {codepoints.length} codepoints in {codepoints.length}{' '}
        cells, each glyph isolated in memory order. The bottom row is the same
        string shaped: letters join, ligatures form, marks land on their base,
        and Arabic runs right to left. A per-codepoint terminal grid can only draw
        the top row.
      </figcaption>
    </figure>
  );
}
