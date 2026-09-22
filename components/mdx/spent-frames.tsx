'use client';

import { useMemo, useState } from 'react';

/**
 * A model of the backlog, not a capture of it. The constants that are the
 * fix's own are real: the 4 MiB threshold, the 250 ms catch-up interval, the
 * 8 ms floor, and the pace factor of 2 are the values in window_io.go. The
 * parse rate is a round number near the measured drain, 256 KiB per 5 ms, and
 * the flood writes at twice that for one second. The measured runs are in the
 * post; this exists to show the mechanism.
 */
const PARSE_PER_MS = 256 / 5; // KiB per ms the client can parse while draining
const FLOOD_PER_MS = PARSE_PER_MS * 2;
const FLOOD_MS = 1000;
const THRESHOLD_KIB = 4 * 1024; // catchUpBacklog, 4 MiB
const CATCH_UP_MS = 250; // catchUpCoalesceInterval
const FLOOR_MS = 8; // minCoalesceInterval
const PACE_FACTOR = 2; // coalescePaceFactor
const MAX_MS = 8000;

interface Sim {
  /** Queue depth in KiB, one sample per ms. */
  queue: number[];
  /** ms from writer death until the queue is empty. */
  tailMs: number;
  /** Frames composed after the writer died. */
  framesAfter: number;
}

function simulate(costMs: number, paced: boolean): Sim {
  const queue: number[] = [];
  let depth = 0;
  let composeLeft = 0;
  let idleLeft = 0;
  let tailMs = 0;
  let framesAfter = 0;

  for (let t = 0; t < MAX_MS; t++) {
    if (t < FLOOD_MS) depth += FLOOD_PER_MS;

    if (composeLeft > 0) {
      // Composing holds the pane's read lock, so the drain waits.
      composeLeft--;
    } else {
      depth = Math.max(0, depth - PARSE_PER_MS);
      if (idleLeft > 0) {
        idleLeft--;
      } else if (depth > 0 || t < FLOOD_MS) {
        // A new frame starts. The interval it buys depends on the mode.
        composeLeft = costMs;
        idleLeft =
          paced && depth >= THRESHOLD_KIB
            ? CATCH_UP_MS
            : Math.max(PACE_FACTOR * costMs, FLOOR_MS);
        if (t >= FLOOD_MS) framesAfter++;
      }
    }

    queue.push(depth);
    if (t >= FLOOD_MS && depth > 0) tailMs = t - FLOOD_MS + 1;
    if (t >= FLOOD_MS && depth === 0 && composeLeft === 0) break;
  }
  return { queue, tailMs, framesAfter };
}

export function SpentFrames() {
  const [cost, setCost] = useState(12);

  const { every, paced, maxDepth, maxLen } = useMemo(() => {
    const every = simulate(cost, false);
    const paced = simulate(cost, true);
    const maxDepth = Math.max(...every.queue, ...paced.queue);
    const maxLen = Math.max(every.queue.length, paced.queue.length);
    return { every, paced, maxDepth, maxLen };
  }, [cost]);

  const line = (sim: Sim) =>
    sim.queue
      .filter((_, i) => i % 8 === 0)
      .map((d, i) => {
        const x = ((i * 8) / maxLen) * 100;
        const y = 40 - (d / maxDepth) * 38;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');

  const deathX = (FLOOD_MS / maxLen) * 100;

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="p-4">
        <svg
          viewBox="0 0 100 40"
          className="h-40 w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Queue depth over time. Drawing every frame keeps the pane painting ${every.tailMs} ms after the source exited; pacing down cuts that to ${paced.tailMs} ms.`}
        >
          <line
            x1={deathX}
            y1="0"
            x2={deathX}
            y2="40"
            stroke="currentColor"
            strokeWidth={0.5}
            strokeDasharray="2 2"
            className="text-fd-muted-foreground/50"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={line(every)}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            className="text-fd-muted-foreground/45"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={line(paced)}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            className="text-fd-primary"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-fd-muted-foreground">
          <span>dashed line: the source exits at 1.0 s</span>
          <span>grey: draw every frame</span>
          <span className="text-fd-primary">
            highlighted: pace down past 4 MiB
          </span>
        </div>
      </div>

      <div className="border-t border-fd-border p-4">
        <label className="flex items-center gap-3 text-sm">
          <span className="w-24 shrink-0 text-fd-muted-foreground">
            frame cost
          </span>
          <input
            type="range"
            min={6}
            max={24}
            step={1}
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
            className="flex-1 accent-current"
            aria-label="What one composed frame costs the client, in milliseconds"
          />
          <span className="w-12 font-mono text-xs tabular-nums text-fd-muted-foreground">
            {cost} ms
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-fd-border px-4 py-3 font-mono text-sm">
        <span className="text-fd-muted-foreground">
          still painting after exit: {(every.tailMs / 1000).toFixed(2)}s /{' '}
          {every.framesAfter} frames
        </span>
        <span className="text-fd-primary">
          paced: {(paced.tailMs / 1000).toFixed(2)}s / {paced.framesAfter}{' '}
          frames
        </span>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        A model, not a capture: the parse rate is a round 256 KiB per 5 ms and
        the flood writes at twice that for one second. The 4 MiB threshold, the
        250 ms catch-up interval, the 8 ms floor and the pace factor of 2 are
        the repo's real constants. Drag the frame cost up. The grey queue grows
        faster and drains slower at once, because every frame composed is drain
        time spent, and the tail after the source exits stretches with it. The
        paced line pays for a frame four times a second while it is behind, so
        nearly all of its time goes to catching up.
      </figcaption>
    </figure>
  );
}
