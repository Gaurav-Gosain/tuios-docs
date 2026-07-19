'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * East Asian Wide and Fullwidth ranges, plus the emoji ranges that present as
 * wide by default. Not exhaustive, and deliberately so: this mirrors the kind of
 * per-codepoint table a terminal ships, and the argument the component makes is
 * that no such table can be sufficient on its own.
 */
const WIDE: [number, number][] = [
  [0x1100, 0x115f],
  [0x2e80, 0x303e],
  [0x3041, 0x33ff],
  [0x3400, 0x4dbf],
  [0x4e00, 0x9fff],
  [0xa000, 0xa4cf],
  [0xac00, 0xd7a3],
  [0xf900, 0xfaff],
  [0xfe30, 0xfe6f],
  [0xff00, 0xff60],
  [0xffe0, 0xffe6],
  // Regional indicators. A pair of these is one flag occupying two columns, so
  // each is wide on its own and a naive sum doubles it. That doubling is exactly
  // the failure this component is about.
  [0x1f1e6, 0x1f1ff],
  [0x1f300, 0x1f64f],
  [0x1f900, 0x1f9ff],
  [0x20000, 0x2fffd],
];

/** Combining marks, joiners and variation selectors: zero columns each. */
const ZERO: [number, number][] = [
  [0x0300, 0x036f],
  [0x0483, 0x0489],
  [0x0591, 0x05bd],
  [0x0610, 0x061a],
  [0x064b, 0x065f],
  [0x0900, 0x0903],
  [0x093a, 0x094f],
  [0x0951, 0x0957],
  [0x200b, 0x200f],
  [0xfe00, 0xfe0f],
  [0xfe20, 0xfe2f],
  [0xe0100, 0xe01ef],
];

function inRanges(cp: number, ranges: [number, number][]) {
  return ranges.some(([lo, hi]) => cp >= lo && cp <= hi);
}

function codepointWidth(cp: number) {
  if (cp === 0x200d) return 0;
  if (inRanges(cp, ZERO)) return 0;
  if (inRanges(cp, WIDE)) return 2;
  return 1;
}

function hex(cp: number) {
  return `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
}

interface Cluster {
  text: string;
  codepoints: number[];
  /** What a per-codepoint table produces if you add its answers up. */
  naive: number;
  /** What the cluster actually occupies: one advance, wide or narrow. */
  actual: number;
}

function segment(input: string): Cluster[] {
  const chars = Array.from(input);

  // Intl.Segmenter implements UAX 29, which is the same specification a terminal
  // follows to decide where one cell ends and the next begins. Without it there
  // is no correct fallback, so the component says so rather than guessing.
  const Seg = (
    Intl as unknown as {
      Segmenter?: new (
        l: string,
        o: { granularity: string },
      ) => { segment(s: string): Iterable<{ segment: string }> };
    }
  ).Segmenter;

  const pieces = Seg
    ? Array.from(new Seg('en', { granularity: 'grapheme' }).segment(input), (s) => s.segment)
    : chars;

  return pieces.map((text) => {
    const codepoints = Array.from(text, (c) => c.codePointAt(0) ?? 0);
    const naive = codepoints.reduce((n, cp) => n + codepointWidth(cp), 0);
    const base = codepoints.find((cp) => codepointWidth(cp) > 0) ?? codepoints[0];
    return { text, codepoints, naive, actual: codepointWidth(base) || 1 };
  });
}

const PRESETS: { label: string; value: string }[] = [
  { label: 'family emoji', value: '👨‍👩‍👧‍👦' },
  { label: 'flag', value: '🇯🇵' },
  { label: 'combining marks', value: 'é' + '́'.repeat(3) },
  { label: 'CJK', value: '日本語' },
  { label: 'zero width space', value: 'a​b' },
  { label: 'devanagari', value: 'नमस्ते' },
];

/**
 * Type text, see where a per-codepoint width table and the real cluster advance
 * disagree. The disagreement is the whole reason importing a correct width table
 * from another terminal did not fix anything.
 */
export function ClusterExplorer() {
  const [value, setValue] = useState('👨‍👩‍👧‍👦 日本語 é́');
  const clusters = useMemo(() => segment(value), [value]);

  const naiveTotal = clusters.reduce((n, c) => n + c.naive, 0);
  const actualTotal = clusters.reduce((n, c) => n + c.actual, 0);
  const disagrees = naiveTotal !== actualTotal;

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="border-b border-fd-border p-4">
        <label
          htmlFor="cluster-input"
          className="mb-2 block text-sm font-medium text-fd-foreground"
        >
          Text to measure
        </label>
        <input
          id="cluster-input"
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
                'focus:outline-none focus:ring-1 focus:ring-fd-primary',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-fd-border bg-fd-muted/40 text-left">
              <th className="px-4 py-2 font-medium text-fd-muted-foreground">cluster</th>
              <th className="px-4 py-2 font-medium text-fd-muted-foreground">codepoints</th>
              <th className="px-4 py-2 text-right font-medium text-fd-muted-foreground">
                table sum
              </th>
              <th className="px-4 py-2 text-right font-medium text-fd-muted-foreground">
                cells used
              </th>
            </tr>
          </thead>
          <tbody>
            {clusters.map((c, i) => {
              const wrong = c.naive !== c.actual;
              return (
                <tr
                  key={i}
                  className={cn('border-b border-fd-border/60 last:border-0', wrong && 'bg-fd-primary/5')}
                >
                  <td className="px-4 py-2 font-mono text-base">{c.text}</td>
                  <td className="px-4 py-2 font-mono text-xs text-fd-muted-foreground">
                    {c.codepoints.map(hex).join(' ')}
                  </td>
                  <td
                    className={cn(
                      'px-4 py-2 text-right font-mono tabular-nums',
                      wrong ? 'text-fd-primary' : 'text-fd-muted-foreground',
                    )}
                  >
                    {c.naive}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums text-fd-foreground">
                    {c.actual}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-fd-border bg-fd-muted/40">
              <td className="px-4 py-2 font-medium" colSpan={2}>
                {clusters.length} clusters
              </td>
              <td
                className={cn(
                  'px-4 py-2 text-right font-mono tabular-nums',
                  disagrees ? 'text-fd-primary' : '',
                )}
              >
                {naiveTotal}
              </td>
              <td className="px-4 py-2 text-right font-mono tabular-nums">{actualTotal}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        {disagrees ? (
          <>
            The table says {naiveTotal} columns. The terminal uses {actualTotal}. Highlighted
            rows are where adding up per-codepoint answers gives the wrong result, because a
            cluster occupies one advance however many codepoints it contains.
          </>
        ) : (
          <>
            These agree, which is the easy case. Try the family emoji or the combining marks
            preset to make them disagree.
          </>
        )}
      </figcaption>
    </figure>
  );
}
