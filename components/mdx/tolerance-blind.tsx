'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';

const COLS = 24;
const ROWS = 12;

/** The colour the escape sequence specifies. */
const EXACT: [number, number, number] = [123, 189, 255];

/**
 * A model of the measured defect, not a capture of it. Roughly half the pixels
 * come back one step off, concentrated toward cell edges, which is where the
 * dither actually sat. Deterministic so the figure does not shift under the
 * reader while they move a slider.
 */
function defectAt(x: number, y: number): [number, number, number] {
  const edge = x % 4 === 0 || x % 4 === 3 || y % 3 === 0;
  const hash = (x * 73856093) ^ (y * 19349663);
  const dither = (hash >>> 3) % 2 === 0;
  if (edge && dither) return [EXACT[0], EXACT[1] + 1, EXACT[2]];
  if (edge) return [EXACT[0], EXACT[1], EXACT[2] - 1];
  if (dither && (hash >>> 7) % 5 === 0) return [EXACT[0], EXACT[1] + 1, EXACT[2]];
  return EXACT;
}

function rgb([r, g, b]: [number, number, number]) {
  return `rgb(${r},${g},${b})`;
}

/**
 * A test can only report a defect it can represent. Widen the acceptance band
 * past the size of the fault, or sample away from where the fault lives, and the
 * suite reports green while the defect sits in plain view.
 */
export function ToleranceBlind() {
  const [tolerance, setTolerance] = useState(2);
  const [insetX, setInsetX] = useState(20);
  const [insetY, setInsetY] = useState(12);
  const [noise, setNoise] = useState(false);
  const [session, setSession] = useState(0);

  const { flagged, scanned, worst } = useMemo(() => {
    const cx = Math.round((COLS * insetX) / 100);
    const cy = Math.round((ROWS * insetY) / 100);
    let flagged = 0;
    let scanned = 0;
    let worst = 0;
    for (let y = cy; y < ROWS - cy; y++) {
      for (let x = cx; x < COLS - cx; x++) {
        scanned++;
        const px = defectAt(x, y);
        // Readback noise from the instrument, not from the render. It moves the
        // verdict between sessions while the picture on screen never changes.
        const n = noise && ((x * 31 + y * 17 + session * 101) % 7 === 0) ? 1 : 0;
        const delta = Math.max(
          Math.abs(px[0] - EXACT[0]),
          Math.abs(px[1] - EXACT[1]),
          Math.abs(px[2] - EXACT[2]),
        ) + n;
        if (delta > worst) worst = delta;
        if (delta > tolerance) flagged++;
      }
    }
    return { flagged, scanned, worst };
  }, [tolerance, insetX, insetY, noise, session]);

  const cx = Math.round((COLS * insetX) / 100);
  const cy = Math.round((ROWS * insetY) / 100);

  const cells = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const inScan = x >= cx && x < COLS - cx && y >= cy && y < ROWS - cy;
      const px = defectAt(x, y);
      const delta = Math.max(
        Math.abs(px[0] - EXACT[0]),
        Math.abs(px[1] - EXACT[1]),
        Math.abs(px[2] - EXACT[2]),
      );
      cells.push({ x, y, px, inScan, caught: inScan && delta > tolerance });
    }
  }

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 font-mono text-xs text-fd-muted-foreground">
            what is on screen
          </div>
          <div
            className="grid overflow-hidden rounded"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
            role="img"
            aria-label="A patch of flat colour with roughly half its pixels one step off, concentrated at cell edges."
          >
            {cells.map((c) => (
              <div
                key={`${c.x}-${c.y}`}
                style={{ background: rgb(c.px), aspectRatio: '1' }}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 font-mono text-xs text-fd-muted-foreground">
            what the comparison reports
          </div>
          <div
            className="grid overflow-hidden rounded"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
            role="img"
            aria-label={`Diff map. ${flagged} of ${scanned} scanned pixels exceed the tolerance.`}
          >
            {cells.map((c) => (
              <div
                key={`${c.x}-${c.y}`}
                className={cn(
                  !c.inScan && 'bg-fd-muted/20',
                  c.inScan && !c.caught && 'bg-fd-background',
                  c.caught && 'bg-fd-primary',
                )}
                style={{ aspectRatio: '1' }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-fd-border p-4">
        <label className="flex items-center gap-3 text-sm">
          <span className="w-24 shrink-0 text-fd-muted-foreground">tolerance</span>
          <input
            type="range"
            min={0}
            max={4}
            step={1}
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
            className="flex-1 accent-current"
            aria-label="Per-channel tolerance"
          />
          <span className="w-8 font-mono text-xs tabular-nums text-fd-muted-foreground">
            {tolerance}
          </span>
        </label>
        <label className="flex items-center gap-3 text-sm">
          <span className="w-24 shrink-0 text-fd-muted-foreground">inset</span>
          <input
            type="range"
            min={0}
            max={30}
            step={2}
            value={insetX}
            onChange={(e) => {
              setInsetX(Number(e.target.value));
              setInsetY(Math.round(Number(e.target.value) * 0.6));
            }}
            className="flex-1 accent-current"
            aria-label="How far the scan is inset from the edges, as a percentage"
          />
          <span className="w-8 font-mono text-xs tabular-nums text-fd-muted-foreground">
            {insetX}%
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={noise}
              onChange={(e) => setNoise(e.target.checked)}
              className="size-4 accent-current"
            />
            <span className="text-fd-foreground">Instrument adds its own noise</span>
          </label>
          {noise ? (
            <button
              type="button"
              onClick={() => setSession((s) => s + 1)}
              className="rounded-md border border-fd-border px-3 py-1 text-sm text-fd-foreground hover:border-fd-primary/60 focus:outline-none focus:ring-1 focus:ring-fd-primary"
            >
              new session
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-6 border-t border-fd-border px-4 py-3 font-mono text-sm">
        <span className={flagged ? 'text-fd-primary' : 'text-fd-foreground'}>
          {flagged ? 'FAIL' : 'PASS'}
        </span>
        <span className="text-fd-muted-foreground">
          {flagged} of {scanned} scanned pixels over tolerance
        </span>
        <span className="text-fd-muted-foreground">worst delta {worst}</span>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        A model of the measured defect, not a capture of it. At tolerance 2, the
        suite's setting, the diff map is blank while the dither is plainly visible
        beside it. Drag tolerance to 0 and it lights up. The inset slider then
        crops the edges where the fault concentrates, which was the second
        blindness stacked on the first. Turn on instrument noise and press{' '}
        <strong>new session</strong>: the verdict changes while the render does
        not, because the measurement now has a noise floor of its own.
      </figcaption>
    </figure>
  );
}
