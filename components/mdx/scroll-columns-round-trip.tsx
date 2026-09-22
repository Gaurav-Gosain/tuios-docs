'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * A model of the scrolling layout's strip across a session switch.
 *
 * The numbers are the ones the regression tests run on: a screen 80 cells wide,
 * three panes, a new column at the default 55 percent (44 cells), and the width
 * presets `scroll_cycle_width` steps through. Widths are truncated to whole
 * cells, the way `ResolveColumnWidth` does it.
 *
 * "Before the fix" is what the daemon's state carried until 209cb44c: the
 * strip's offset and nothing about its columns. A switch rebuilds the client
 * from that state, so the strip comes back one column per pane at the default
 * width, with the old offset laid over it. A second client on the session kept
 * its own columns and took only the offset. "After the fix" carries the columns
 * by window ID, and both routes rebuild or adopt them.
 */

const SCREEN = 80;
const DEFAULT_WIDTH = 0.55;
const PRESETS = [0.333, 0.5, 0.55, 0.667, 0.9];
const PANES = ['A', 'B', 'C'];
// The fixed scale every strip is drawn at, in cells. Three columns at the
// widest preset are 216 cells, so this holds any strip the widget can build.
const SCALE = 224;
const AWAY_MS = 650;

interface Column {
  panes: string[];
  /** Share of the screen, and 0 is the default width. */
  prop: number;
  /** Index in panes the column is focused on. */
  active: number;
}

interface Strip {
  cols: Column[];
  focused: number;
  viewportX: number;
}

type Mode = 'before' | 'after';

const initialCols = (): Column[] => PANES.map((p) => ({ panes: [p], prop: 0, active: 0 }));

const initialStrip = (): Strip => ({ cols: initialCols(), focused: 0, viewportX: 0 });

const cloneCols = (cols: Column[]): Column[] =>
  cols.map((c) => ({ panes: [...c.panes], prop: c.prop, active: c.active }));

const widthOf = (c: Column) => Math.trunc(SCREEN * (c.prop || DEFAULT_WIDTH));

const xOf = (cols: Column[], i: number) =>
  cols.slice(0, i).reduce((x, c) => x + widthOf(c), 0);

const totalOf = (cols: Column[]) => xOf(cols, cols.length);

const clampView = (cols: Column[], x: number) =>
  Math.max(0, Math.min(x, Math.max(totalOf(cols) - SCREEN, 0)));

// Cells of the neighbouring column kept on screen beside the focused one, as
// scrollPeek in internal/layout/scrolling.go.
const PEEK = 4;

/**
 * Scroll by the least amount that shows the focused column with `margin` cells
 * to spare on each side, and not at all when it is already there. This is
 * `ScrollingLayout.reveal`. Keyboard steps call it with a margin of 4
 * (ScrollToFocusedColumn). A click calls it with 0, and only when no part of
 * the column is on screen (EnsureFocusedVisible).
 */
const reveal = (s: Strip, margin: number): Strip => {
  const col = s.cols[s.focused];
  if (!col) return s;
  const x = xOf(s.cols, s.focused);
  const w = widthOf(col);
  let m = margin;
  if (w + 2 * m > SCREEN) m = Math.max(Math.trunc((SCREEN - w) / 2), 0);
  let vx = s.viewportX;
  if (x - m < vx) vx = x - m;
  if (x + w + m > vx + SCREEN) vx = x + w + m - SCREEN;
  return { ...s, viewportX: clampView(s.cols, vx) };
};

/** EnsureFocusedVisible: move only when none of the column is on screen. */
const ensureVisible = (s: Strip): Strip => {
  const col = s.cols[s.focused];
  if (!col) return s;
  const x = xOf(s.cols, s.focused);
  if (x < s.viewportX + SCREEN && x + widthOf(col) > s.viewportX) return s;
  return reveal(s, 0);
};

const focusedPane = (s: Strip) => {
  const c = s.cols[s.focused];
  return c ? c.panes[c.active] : undefined;
};

const columnHolding = (cols: Column[], pane: string | undefined) =>
  Math.max(
    0,
    cols.findIndex((c) => pane !== undefined && c.panes.includes(pane)),
  );

const describe = (cols: Column[]) =>
  cols
    .map((c) => `[${c.panes.join(',')}] ${widthOf(c)}`)
    .join('  ');

export function ScrollColumnsRoundTrip() {
  const [mode, setMode] = useState<Mode>('before');
  const [local, setLocal] = useState<Strip>(initialStrip);
  // The second client builds its own strip from the window list, as every
  // client did. Before the fix nothing it received ever changed it.
  const [peerCols, setPeerCols] = useState<Column[]>(initialCols);
  const [away, setAway] = useState(false);
  const [result, setResult] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const id = useId();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Every local change is pushed to the daemon. After the fix the push carries
  // the columns and the peer adopts them in place; before it, the peer keeps
  // its own and takes only the offset, which it clamps to its own strip.
  const commit = (next: Strip) => {
    setLocal(next);
    if (mode === 'after') setPeerCols(cloneCols(next.cols));
  };

  // Keyboard actions show the whole column with a peek beside it. A click
  // leaves the strip alone unless the column is entirely off screen.
  const act = (fn: (s: Strip) => Strip | null, click = false) => {
    if (away) return;
    const next = fn({ ...local, cols: cloneCols(local.cols) });
    if (!next) return;
    setResult('');
    commit(click ? ensureVisible(next) : reveal(next, PEEK));
  };

  const focusStep = (d: number) =>
    act((s) => {
      const f = s.focused + d;
      if (f < 0 || f >= s.cols.length) return null;
      return { ...s, focused: f };
    });

  const cycleWidth = () =>
    act((s) => {
      const col = s.cols[s.focused];
      const current = col.prop || DEFAULT_WIDTH;
      const next = PRESETS.find((w) => w > current + 0.01);
      col.prop = next ?? PRESETS[0];
      return s;
    });

  const consume = () =>
    act((s) => {
      const next = s.cols[s.focused + 1];
      if (!next) return null;
      const moved = next.panes.splice(next.active, 1)[0];
      next.active = Math.min(next.active, Math.max(next.panes.length - 1, 0));
      const col = s.cols[s.focused];
      col.panes.push(moved);
      col.active = col.panes.length - 1;
      if (next.panes.length === 0) s.cols.splice(s.focused + 1, 1);
      return s;
    });

  const expel = () =>
    act((s) => {
      const col = s.cols[s.focused];
      if (col.panes.length < 2) return null;
      const moved = col.panes.splice(col.active, 1)[0];
      col.active = Math.min(col.active, col.panes.length - 1);
      s.cols.splice(s.focused + 1, 0, { panes: [moved], prop: 0, active: 0 });
      return { ...s, focused: s.focused + 1 };
    });

  const focusPane = (ci: number, pi: number) =>
    act((s) => {
      s.cols[ci].active = pi;
      return { ...s, focused: ci };
    }, true);

  const reset = () => {
    window.clearTimeout(timer.current);
    setAway(false);
    setLocal(initialStrip());
    setPeerCols(initialCols());
    setResult('');
  };

  const switchAndBack = () => {
    if (away) return;
    const before = local;
    const pane = focusedPane(before);
    const saved = cloneCols(before.cols);
    const savedX = before.viewportX;

    const rebuild = () => {
      // Before: the state names the panes and the offset, so the strip is
      // built from the window list. After: it is built from the columns the
      // state carries. Either way the session's offset is laid over it.
      const cols = mode === 'after' ? saved : initialCols();
      const focused = columnHolding(cols, pane);
      const next: Strip = { cols, focused, viewportX: clampView(cols, savedX) };
      setLocal(next);
      setAway(false);

      const lost: string[] = [];
      if (cols.length !== saved.length)
        lost.push(`${saved.length} columns came back as ${cols.length}`);
      for (const c of saved) {
        const now = cols[columnHolding(cols, c.panes[0])];
        if (widthOf(c) !== widthOf(now))
          lost.push(`${c.panes.join('+')} was ${widthOf(c)} cells, now ${widthOf(now)}`);
      }
      setResult(
        lost.length
          ? `Back on the session: ${lost.join('; ')}.`
          : 'Back on the session: every column as you left it.',
      );
    };

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setResult('');
    if (reduce) {
      rebuild();
      return;
    }
    setAway(true);
    timer.current = window.setTimeout(rebuild, AWAY_MS);
  };

  const peer: Strip = {
    cols: peerCols,
    focused: columnHolding(peerCols, focusedPane(local)),
    viewportX: clampView(peerCols, local.viewportX),
  };

  const state =
    mode === 'after'
      ? `scroll_strip: {viewport_x: ${local.viewportX}}\nworkspace_scroll_columns: {1: [${local.cols
          .map(
            (c) =>
              `{windows: [${c.panes.join(', ')}]${c.prop ? `, proportion: ${c.prop}` : ''}}`,
          )
          .join(', ')}]}`
      : `scroll_strip: {viewport_x: ${local.viewportX}}\n(no columns)`;

  const btn =
    'rounded-md border border-fd-border px-2.5 py-1.5 text-sm text-fd-foreground hover:border-fd-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary disabled:opacity-40 disabled:hover:border-fd-border';

  const canConsume = local.focused < local.cols.length - 1;
  const canExpel = (local.cols[local.focused]?.panes.length ?? 0) > 1;

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <fieldset className="m-0 min-w-0 flex flex-wrap items-center gap-2 border-0 border-b border-fd-border bg-fd-muted/40 px-3 py-2">
        <legend className="sr-only">Which build of tuios</legend>
        {(['before', 'after'] as const).map((m) => (
          <label
            key={m}
            className={cn(
              'relative cursor-pointer rounded-md px-2.5 py-1 font-mono text-xs has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-fd-primary',
              mode === m
                ? 'bg-fd-primary text-fd-primary-foreground'
                : 'text-fd-muted-foreground hover:text-fd-foreground',
            )}
          >
            <input
              type="radio"
              name={`scroll-columns-mode-${id}`}
              value={m}
              checked={mode === m}
              onChange={() => {
                setMode(m);
                reset();
              }}
              className="sr-only"
            />
            {m === 'before' ? 'before the fix' : 'after the fix'}
          </label>
        ))}
        <span className="ml-auto font-mono text-xs text-fd-muted-foreground">
          screen 80 cells, new column 55%
        </span>
      </fieldset>

      <div className="space-y-4 p-3 sm:p-4">
        <StripView
          label="this client"
          strip={local}
          away={away}
          onPane={focusPane}
          interactive
        />
        <StripView label="second client, same session" strip={peer} away={false} />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-fd-border p-3 sm:p-4">
        <button type="button" className={btn} onClick={() => focusStep(-1)} disabled={away || local.focused === 0}>
          focus left
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => focusStep(1)}
          disabled={away || local.focused >= local.cols.length - 1}
        >
          focus right
        </button>
        <button type="button" className={btn} onClick={cycleWidth} disabled={away}>
          cycle width
        </button>
        <button type="button" className={btn} onClick={consume} disabled={away || !canConsume}>
          stack next pane below
        </button>
        <button type="button" className={btn} onClick={expel} disabled={away || !canExpel}>
          unstack
        </button>
        <button
          type="button"
          onClick={switchAndBack}
          disabled={away}
          className="rounded-md bg-fd-primary px-3 py-1.5 text-sm font-medium text-fd-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary focus-visible:ring-offset-2 focus-visible:ring-offset-fd-card disabled:opacity-60"
        >
          switch session and back
        </button>
        <button type="button" className={cn(btn, 'ml-auto')} onClick={reset}>
          reset
        </button>
      </div>

      <div className="grid gap-3 border-t border-fd-border px-3 py-3 font-mono text-xs sm:grid-cols-2 sm:px-4">
        <div>
          <div className="mb-1 text-fd-muted-foreground">what the daemon holds</div>
          <pre className="whitespace-pre-wrap break-words text-fd-foreground">{state}</pre>
        </div>
        <div>
          <div className="mb-1 text-fd-muted-foreground">columns, width in cells</div>
          <div className="text-fd-foreground">this client: {describe(local.cols)}</div>
          <div className="text-fd-foreground">second client: {describe(peerCols)}</div>
        </div>
      </div>

      <div
        aria-live="polite"
        className={cn(
          'border-t border-fd-border px-3 py-3 font-mono text-xs sm:px-4',
          result.startsWith('Back on the session: every') ? 'text-fd-foreground' : 'text-fd-primary',
        )}
      >
        {away
          ? 'On session "elsewhere". This client has thrown its strip away.'
          : result || 'Widen a column or stack two panes, then switch session and back.'}
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        A model of the strip, at the sizes the regression tests use. The tinted
        band is the screen. Before the fix the daemon kept only the offset, so a
        round trip rebuilt one column per pane at 44 cells and laid the old offset
        over a strip it no longer matched. The second client never took the
        columns at all, so the same offset showed it different panes. After the
        fix both read the columns from the session.
      </figcaption>
    </figure>
  );
}

function StripView({
  label,
  strip,
  away,
  onPane,
  interactive = false,
}: {
  label: string;
  strip: Strip;
  away: boolean;
  onPane?: (col: number, pane: number) => void;
  interactive?: boolean;
}) {
  const pct = (cells: number) => `${(cells / SCALE) * 100}%`;
  const total = totalOf(strip.cols);
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-2 font-mono text-xs text-fd-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">
          strip {total} cells, offset {strip.viewportX}
        </span>
      </div>
      <div
        className={cn(
          'relative h-24 rounded-sm bg-fd-background transition-opacity duration-300 motion-reduce:transition-none',
          away && 'opacity-20',
        )}
      >
        {/* The screen: the part of the strip the client draws. A tinted band
            behind the panes and a bar above them, so nothing crosses a label. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-2 -bottom-1 rounded-sm bg-fd-primary/15 transition-[left] duration-300 ease-out motion-reduce:transition-none"
          style={{ left: pct(strip.viewportX), width: pct(SCREEN) }}
        >
          <div className="h-1 rounded-t-sm bg-fd-primary" />
        </div>
        {strip.cols.map((col, ci) => {
          const x = xOf(strip.cols, ci);
          const w = widthOf(col);
          const inView = x + w > strip.viewportX && x < strip.viewportX + SCREEN;
          return (
            <div
              key={col.panes.join('')}
              className="absolute top-0 bottom-0 flex flex-col gap-0.5 p-0.5 transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
              style={{ left: pct(x), width: pct(w) }}
            >
              {col.panes.map((p, pi) => {
                const isFocus = ci === strip.focused && pi === col.active;
                const cls = cn(
                  'flex min-h-0 flex-1 items-center justify-center gap-1 overflow-hidden rounded-sm border font-mono text-xs',
                  isFocus ? 'border-fd-primary' : 'border-fd-border',
                  inView ? 'bg-fd-muted/60 text-fd-foreground' : 'bg-fd-muted/20 text-fd-muted-foreground',
                );
                const body = (
                  <>
                    <span className="font-semibold">{p}</span>
                    {pi === 0 && <span className="hidden tabular-nums opacity-70 sm:inline">{w}</span>}
                  </>
                );
                return interactive && onPane ? (
                  <button
                    key={p}
                    type="button"
                    aria-label={`Pane ${p}, column ${ci + 1}, ${w} cells wide${isFocus ? ', focused' : ''}`}
                    aria-pressed={isFocus}
                    disabled={away}
                    onClick={() => onPane(ci, pi)}
                    className={cn(cls, 'focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary')}
                  >
                    {body}
                  </button>
                ) : (
                  <div key={p} className={cls}>
                    {body}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
