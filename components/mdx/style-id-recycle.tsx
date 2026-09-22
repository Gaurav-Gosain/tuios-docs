'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * A model of the style ID cache in the libghostty-vt backend. The library
 * interns every distinct style under a 16-bit ID and frees the ID when the
 * style's last cell is gone. The backend cached its conversion of each style
 * by ID, and until 915e4d6d only cleared that cache on a theme or palette
 * change. The fix clears it at every render snapshot (clear(t.styleCache) in
 * ghostty_grid.go). The prompt and file names here are illustrative; the
 * mechanism and the pink, 255;105;180, are the post's.
 */
interface Style {
  fg: string;
  bg?: string;
  bold?: boolean;
  name: string;
}

const PINK = 'rgb(255 105 180)';
const PROMPT: Style = { fg: '#ffffff', bg: PINK, name: 'white on pink' };
const BRANCH: Style = { fg: '#ffffff', bg: PINK, name: 'white on pink, bold', bold: true };
// Mid tones, readable on both the light and the dark page background.
const DIR: Style = { fg: 'rgb(59 130 246)', name: 'blue' };
const EXE: Style = { fg: 'rgb(22 163 74)', name: 'green' };
const DEFAULT: Style = { fg: 'currentColor', name: 'default' };

interface Cell {
  key: string;
  text: string;
  id: number;
}

const STEPS = [
  'the prompt is drawn',
  'a frame is composed',
  'clear',
  'ls prints file names',
  'the next frame is composed',
] as const;

interface State {
  /** Styles the library currently holds, by ID. */
  interned: Map<number, Style>;
  /** The backend's conversion cache, by ID. */
  cache: Map<number, Style>;
  screen: Cell[];
  /** What the host was last shown, as converted styles. */
  shown: { key: string; text: string; style: Style }[] | null;
}

function run(upTo: number, composeFirst: boolean, clearEachSnapshot: boolean): State {
  // ID 0 is the default style, which is never freed.
  const interned = new Map<number, Style>([[0, DEFAULT]]);
  const cache = new Map<number, Style>();
  let screen: Cell[] = [];
  let shown: State['shown'] = null;

  const compose = () => {
    if (clearEachSnapshot) cache.clear();
    shown = screen.map((c) => {
      let style = cache.get(c.id);
      if (!style) {
        style = interned.get(c.id) as Style;
        cache.set(c.id, style);
      }
      return { key: c.key, text: c.text, style };
    });
  };

  for (let s = 0; s <= upTo; s++) {
    switch (s) {
      case 0:
        interned.set(1, PROMPT);
        interned.set(2, BRANCH);
        screen = [
          { key: 'cwd', text: ' ~/code ', id: 1 },
          { key: 'branch', text: ' main ', id: 2 },
        ];
        break;
      case 1:
        if (composeFirst) compose();
        break;
      case 2:
        // Last cell gone, refcount zero, the ID goes back to the pool.
        screen = [];
        interned.delete(1);
        interned.delete(2);
        break;
      case 3:
        // The allocator hands the next new styles the freshly freed IDs.
        interned.set(1, DIR);
        interned.set(2, EXE);
        screen = [
          { key: 'cmd', text: 'cmd/', id: 1 },
          { key: 'gap1', text: ' ', id: 0 },
          { key: 'docs', text: 'docs/', id: 1 },
          { key: 'gap2', text: ' ', id: 0 },
          { key: 'install', text: 'install.sh', id: 2 },
        ];
        break;
      case 4:
        compose();
        break;
    }
  }
  return { interned, cache, screen, shown };
}

function Swatch({ style }: { style: Style }) {
  return (
    <span
      className="rounded-sm px-1"
      style={{
        color: style.fg,
        backgroundColor: style.bg,
        fontWeight: style.bold ? 700 : undefined,
      }}
    >
      {style.name}
    </span>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        'rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-fd-primary',
        on
          ? 'border-fd-primary/60 text-fd-foreground'
          : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/40',
      )}
    >
      {on ? 'on' : 'off'}: {label}
    </button>
  );
}

export function StyleIdRecycle() {
  const [step, setStep] = useState(STEPS.length - 1);
  const [composeFirst, setComposeFirst] = useState(true);
  const [clearEach, setClearEach] = useState(false);
  const st = run(step, composeFirst, clearEach);

  const ids = [1, 2];
  const wrong =
    step === STEPS.length - 1 &&
    st.shown?.some((c) => c.style.bg !== undefined);

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-wrap gap-2 p-4">
        <Toggle
          label="compose a frame before clear"
          on={composeFirst}
          onChange={setComposeFirst}
        />
        <Toggle
          label="clear the cache each snapshot"
          on={clearEach}
          onChange={setClearEach}
        />
      </div>

      <ol className="flex flex-wrap gap-2 border-t border-fd-border p-4">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              aria-current={i === step ? 'step' : undefined}
              onClick={() => setStep(i)}
              className={cn(
                'rounded-md border px-2.5 py-1 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-fd-primary',
                i === step
                  ? 'border-fd-primary/60 text-fd-foreground'
                  : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/40',
              )}
            >
              {i + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      <div className="grid gap-4 border-t border-fd-border p-4 font-mono text-sm sm:grid-cols-2">
        <div>
          <div className="mb-2 text-xs text-fd-muted-foreground">
            library: style ID holds
          </div>
          {ids.map((id) => {
            const s = st.interned.get(id);
            return (
              <div key={id} className="leading-7">
                <span className="text-fd-muted-foreground">id {id} </span>
                {s ? <Swatch style={s} /> : <span className="text-fd-muted-foreground">free</span>}
              </div>
            );
          })}
        </div>
        <div>
          <div className="mb-2 text-xs text-fd-muted-foreground">
            backend cache: style ID converts to
          </div>
          {ids.map((id) => {
            const s = st.cache.get(id);
            const stale =
              s !== undefined && st.interned.get(id) !== s;
            return (
              <div key={id} className="leading-7">
                <span className="text-fd-muted-foreground">id {id} </span>
                {s ? <Swatch style={s} /> : <span className="text-fd-muted-foreground">empty</span>}
                {stale ? <span className="ml-2 text-fd-primary">stale</span> : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-fd-border p-4">
        <div className="mb-2 font-mono text-xs text-fd-muted-foreground">
          what the host terminal was last shown
        </div>
        <div
          className="min-h-9 overflow-x-auto whitespace-pre rounded-md border border-fd-border bg-fd-background px-3 py-1.5 font-mono text-sm leading-6"
          role="img"
          aria-label={
            st.shown
              ? `Screen: ${st.shown.map((c) => `${c.text.trim() || 'space'} in ${c.style.name}`).join(', ')}`
              : 'No frame composed yet.'
          }
        >
          {st.shown
            ? st.shown.map((c) => (
                <span
                  key={c.key}
                  style={{
                    color: c.style.fg,
                    backgroundColor: c.style.bg,
                    fontWeight: c.style.bold ? 700 : undefined,
                  }}
                >
                  {c.text}
                </span>
              ))
            : ' '}
        </div>
      </div>

      <div
        className="border-t border-fd-border px-4 py-3 font-mono text-sm"
        aria-live="polite"
      >
        {step < STEPS.length - 1 ? (
          <span className="text-fd-muted-foreground">
            step {step + 1} of {STEPS.length}
          </span>
        ) : wrong ? (
          <span className="text-fd-primary">
            file names on hot pink: the cache answered for the styles that
            used to hold those IDs
          </span>
        ) : (
          <span className="text-fd-foreground">
            file names in their own colours
          </span>
        )}
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        A model of the sequence in the post, with a made-up prompt and file
        names. Step through it, then turn off the frame before{' '}
        <code>clear</code>: nothing caches the doomed conversion and the bug
        disappears, which is the situation the differential suite was in when
        it compared once at the end. Turn on the per-snapshot clear, which is
        the fix, and the cache still does its job within a frame but stops
        answering for a style that is gone.
      </figcaption>
    </figure>
  );
}
