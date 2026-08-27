'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

const COLS = 12;
const ROWS = 4;

/**
 * A model of the zero-width bug at 12x4 instead of the real 40x4, so it fits
 * on a phone. The mechanism is the one the test pins: DECALN fills the screen
 * with E, a combining mark with no base takes the first cell, the frame emits
 * the row without it, and everything after shifts one column left.
 */
function screenRow(bug: boolean, y: number): string[] {
  const row = Array.from({ length: COLS }, () => 'E');
  if (bug && y === 0) row[0] = '◌́';
  return row;
}

function frameRow(bug: boolean, y: number): string[] {
  if (!bug || y !== 0) return Array.from({ length: COLS }, () => 'E');
  // The frame drops the zero-width cell, so the E's shift left and the last
  // column comes out blank.
  const row = Array.from({ length: COLS }, () => 'E');
  row[COLS - 1] = '';
  return row;
}

interface Check {
  name: string;
  detail: string;
  pass: boolean;
}

/**
 * The four structural invariants against the two self-referential properties,
 * run over the same corrupted screen. Only the second kind fires.
 */
export function InvariantBlind() {
  const [bug, setBug] = useState(false);

  const structural: Check[] = [
    { name: 'the screen has a size', detail: `${COLS}x${ROWS}`, pass: true },
    { name: 'the scroll region is inside it', detail: '', pass: true },
    { name: 'the cursor is inside it', detail: '', pass: true },
    { name: 'no cell is wider than the row', detail: '', pass: true },
  ];

  const roundTrip: Check = bug
    ? {
        name: 'the frame redraws the screen',
        detail: `cell (${COLS - 1},0): screen "E", frame blank`,
        pass: false,
      }
    : {
        name: 'the frame redraws the screen',
        detail: 'every cell agrees',
        pass: true,
      };

  const grid = (kind: 'screen' | 'frame') => (
    <div
      className="grid gap-px overflow-hidden rounded bg-fd-border/60"
      style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      role="img"
      aria-label={
        kind === 'screen'
          ? 'The grid the emulator holds.'
          : 'The frame it emits, replayed into a fresh emulator.'
      }
    >
      {Array.from({ length: ROWS }, (_, y) =>
        (kind === 'screen' ? screenRow(bug, y) : frameRow(bug, y)).map(
          (ch, x) => {
            const zeroWidth = kind === 'screen' && bug && y === 0 && x === 0;
            const missing = kind === 'frame' && bug && y === 0 && x === COLS - 1;
            return (
              <div
                key={`${x}-${y}`}
                className={cn(
                  'flex items-center justify-center bg-fd-background font-mono text-[10px] leading-none sm:text-xs',
                  zeroWidth && 'text-fd-primary',
                  missing && 'bg-fd-primary/20',
                  !zeroWidth && !missing && 'text-fd-muted-foreground',
                )}
                style={{ aspectRatio: '1 / 1.4' }}
              >
                {ch}
              </div>
            );
          },
        ),
      )}
    </div>
  );

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 font-mono text-xs text-fd-muted-foreground">
            the screen the emulator holds
          </div>
          {grid('screen')}
        </div>
        <div>
          <div className="mb-2 font-mono text-xs text-fd-muted-foreground">
            its own frame, replayed
          </div>
          {grid('frame')}
        </div>
      </div>

      <div className="border-t border-fd-border p-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={bug}
            onChange={(e) => setBug(e.target.checked)}
            className="size-4 accent-current"
          />
          <span className="text-fd-foreground">
            Write a combining mark with nothing to attach to
          </span>
        </label>
      </div>

      <div className="grid gap-x-6 gap-y-1 border-t border-fd-border px-4 py-3 font-mono text-xs sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="mb-1 text-fd-muted-foreground">
            structural invariants
          </span>
          {structural.map((c) => (
            <div key={c.name} className="flex items-baseline gap-2">
              <span className="text-fd-foreground">PASS</span>
              <span className="text-fd-muted-foreground">{c.name}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <span className="mb-1 text-fd-muted-foreground">
            metamorphic property
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={roundTrip.pass ? 'text-fd-foreground' : 'text-fd-primary'}
            >
              {roundTrip.pass ? 'PASS' : 'FAIL'}
            </span>
            <span className="text-fd-muted-foreground">
              {roundTrip.name}: {roundTrip.detail}
            </span>
          </div>
        </div>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        A model of the real bug at 12 columns instead of 40. Tick the box. The
        mark takes the first cell, the frame ships the row without it, and the
        last E falls off the end. All four structural invariants still pass,
        because the grid is a perfectly well-formed wrong answer. Only the
        question that compares the emulator with itself notices.
      </figcaption>
    </figure>
  );
}
