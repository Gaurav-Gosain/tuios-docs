'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The keycast overlay, on the reader's own keyboard. Focus the box and every
 * keypress is drawn as a chip in the bottom right, formatted the way tuios draws
 * it: modifier-prefixed, repeats coalesced to a count, oldest chips fading as
 * new ones arrive. This is the cheapest honest demo on the page, because the
 * widget does exactly what the feature does.
 */

const MAX = 6;
const TIMEOUT = 2600;

// Keys that would scroll the page. These are the only defaults swallowed while
// the box is focused; everything else is left alone.
const SCROLL_KEYS = new Set([
  ' ',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'PageUp',
  'PageDown',
  'Home',
  'End',
]);

const SPECIAL: Record<string, string> = {
  Enter: 'Enter',
  Escape: 'Esc',
  Tab: 'Tab',
  Backspace: 'Backspace',
  Delete: 'Delete',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Home: 'Home',
  End: 'End',
  PageUp: 'PgUp',
  PageDown: 'PgDn',
  ' ': 'Space',
};

interface Chip {
  id: number;
  base: string;
  mods: string[];
  count: number;
  ts: number;
}

function isSingleLetter(key: string) {
  return /^[a-zA-Z]$/.test(key);
}

function describe(e: React.KeyboardEvent) {
  const mods: string[] = [];
  if (e.ctrlKey) mods.push('Ctrl');
  if (e.altKey) mods.push('Alt');
  // Shift is implied by an uppercase letter, so it is shown only on other keys,
  // the same rule the overlay uses.
  if (e.shiftKey && !isSingleLetter(e.key)) mods.push('Shift');
  const base = SPECIAL[e.key] ?? e.key;
  return { base, mods };
}

function label(chip: Chip) {
  const key =
    chip.mods.length > 0 ? `${chip.mods.join('+')} + ${chip.base}` : chip.base;
  return chip.count > 1 ? `${key} ×${chip.count}` : key;
}

export function KeycastDemo() {
  const [chips, setChips] = useState<Chip[]>([]);
  const [focused, setFocused] = useState(false);
  const idRef = useRef(0);

  // Age chips out on a timer, so a burst of typing decays the way the overlay
  // does rather than sitting on screen.
  useEffect(() => {
    if (!focused || chips.length === 0) return;
    const t = setInterval(() => {
      setChips((prev) => prev.filter((c) => Date.now() - c.ts < TIMEOUT));
    }, 400);
    return () => clearInterval(t);
  }, [focused, chips.length]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Bare modifier presses are not keys in their own right.
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
    if (SCROLL_KEYS.has(e.key)) e.preventDefault();

    const { base, mods } = describe(e);
    setChips((prev) => {
      const last = prev[prev.length - 1];
      if (
        last &&
        last.base === base &&
        last.mods.join('+') === mods.join('+')
      ) {
        const next = prev.slice();
        next[next.length - 1] = { ...last, count: last.count + 1, ts: Date.now() };
        return next;
      }
      idRef.current += 1;
      const chip: Chip = { id: idRef.current, base, mods, count: 1, ts: Date.now() };
      const appended = [...prev, chip];
      return appended.length > MAX ? appended.slice(appended.length - MAX) : appended;
    });
  }, []);

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      {/* A focusable region rather than a button, so the terminal mock inside is
          valid DOM. A tabIndex of 0 makes it focusable by click and by tab. */}
      {/* biome-ignore lint/a11y/useSemanticElements: this is an interactive canvas, not a button or listbox */}
      <div
        role="application"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setChips([]);
        }}
        aria-label="Keycast demo. Focus and type to see your keypresses drawn as chips."
        className={cn(
          'relative block h-56 w-full cursor-text select-none overflow-hidden bg-fd-background/40 text-left',
          'focus:outline-none',
        )}
      >
        {/* A faint workspace behind the overlay. */}
        <div className="pointer-events-none absolute inset-3 rounded-sm border border-fd-border/60 bg-fd-background/50">
          <div className="border-b border-fd-border/60 bg-fd-muted/30 px-2 py-0.5 font-mono text-[10px] text-fd-muted-foreground">
            zsh
          </div>
          <div className="px-2 py-1.5 font-mono text-[11px] text-fd-muted-foreground">
            <span className="text-fd-primary">~</span> ${' '}
            <span
              className={cn(
                'ml-0.5 inline-block h-3.5 w-2 translate-y-0.5',
                focused ? 'bg-fd-foreground motion-safe:animate-pulse' : 'border border-fd-muted-foreground',
              )}
            />
          </div>
        </div>

        {/* Focus ring, drawn as an inset so it does not clip. */}
        {focused ? (
          <span
            className="pointer-events-none absolute inset-0 rounded-sm ring-2 ring-inset ring-fd-primary/70"
            aria-hidden="true"
          />
        ) : null}

        {/* The hint, when unfocused. */}
        {!focused ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-sm text-fd-muted-foreground">
            click, then type
          </span>
        ) : null}

        {/* The keycast overlay, bottom right. */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-end gap-1.5">
          {chips.map((chip, i) => {
            // Oldest chips fade. The newest is fully opaque.
            const age = chips.length - 1 - i;
            const opacity = Math.max(0.35, 1 - age * 0.16);
            return (
              <span
                key={chip.id}
                style={{ opacity }}
                className="rounded-md bg-fd-primary/85 px-2 py-1 font-mono text-xs font-medium tabular-nums text-fd-primary-foreground shadow-sm transition-opacity duration-200 motion-reduce:transition-none"
              >
                {label(chip)}
              </span>
            );
          })}
        </div>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        Click the box and type. Keys are drawn the way the overlay draws them:
        modifiers prefix the key, a held or repeated key collapses to a count,
        and older chips fade as new ones arrive. Focus leaves and the overlay
        clears. Only keys that would scroll the page are swallowed while the box
        has focus.
      </figcaption>
    </figure>
  );
}
