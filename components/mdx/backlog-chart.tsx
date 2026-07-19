"use client";

import { useId, useState } from "react";

/**
 * Measured drain rates, in motion events serviced per second.
 *
 * `before` is the low end of the 150 to 300 events/sec that a 3.3 to 6.7 ms
 * frame allows when every event composes one. `after` is the two-window figure
 * from BenchmarkResizeMotionFrame, 24 us per event.
 */
const DRAIN_BEFORE = 150;
const DRAIN_AFTER = 1_000_000 / 24;

/** One composed frame at the slow end of the measured range, in seconds. */
const SLOW_FRAME = 0.0067;

const DURATION = 3; // seconds of drag plotted
const W = 640;
const H = 220;
const PAD = { top: 16, right: 16, bottom: 34, left: 52 };

function backlog(rate: number, drain: number, t: number) {
  return Math.max(0, (rate - drain) * t);
}

export function BacklogChart() {
  const [rate, setRate] = useState(600);
  const sliderId = useId();

  const peak = backlog(rate, DRAIN_BEFORE, DURATION);
  const yMax = Math.max(peak, 60);

  const x = (t: number) =>
    PAD.left + (t / DURATION) * (W - PAD.left - PAD.right);
  const y = (v: number) =>
    H - PAD.bottom - (v / yMax) * (H - PAD.top - PAD.bottom);

  const line = (drain: number) =>
    `M ${x(0)} ${y(backlog(rate, drain, 0))} L ${x(DURATION)} ${y(backlog(rate, drain, DURATION))}`;

  // A frame that is merely slow settles at a constant lag of one frame's worth
  // of events. It never grows, which is the whole distinction.
  const slowFrameLag = rate * SLOW_FRAME;

  const endBefore = Math.round(peak);
  const endAfter = Math.round(backlog(rate, DRAIN_AFTER, DURATION));

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="overflow-x-auto p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full min-w-[420px]"
          role="img"
          aria-label={`Backlog over a ${DURATION} second drag at ${rate} motion events per second. Composing a frame per event ends ${endBefore} events behind the pointer and is still growing. Coalescing to one frame per interval ends ${endAfter} events behind. A frame that is merely slow, rather than backlogged, would sit flat at about ${Math.round(slowFrameLag)} events behind for the whole drag.`}
        >
          <title>Backlog growth during a drag</title>

          <line
            x1={PAD.left}
            y1={H - PAD.bottom}
            x2={W - PAD.right}
            y2={H - PAD.bottom}
            className="stroke-fd-border"
            strokeWidth="1"
          />
          <line
            x1={PAD.left}
            y1={PAD.top}
            x2={PAD.left}
            y2={H - PAD.bottom}
            className="stroke-fd-border"
            strokeWidth="1"
          />

          <text
            x={PAD.left - 8}
            y={y(0)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-fd-muted-foreground text-[10px]"
          >
            0
          </text>
          <text
            x={PAD.left - 8}
            y={y(yMax)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-fd-muted-foreground text-[10px]"
          >
            {Math.round(yMax)}
          </text>
          <text
            x={x(DURATION)}
            y={H - PAD.bottom + 18}
            textAnchor="end"
            className="fill-fd-muted-foreground text-[10px]"
          >
            {DURATION}s of dragging
          </text>
          <text
            x={PAD.left}
            y={H - PAD.bottom + 18}
            className="fill-fd-muted-foreground text-[10px]"
          >
            0s
          </text>

          {/* Reference: a slow frame that still keeps up. */}
          <line
            x1={x(0)}
            y1={y(slowFrameLag)}
            x2={x(DURATION)}
            y2={y(slowFrameLag)}
            className="stroke-fd-muted-foreground"
            strokeDasharray="5 4"
            strokeWidth="1.5"
          />
          <text
            x={x(DURATION)}
            y={y(slowFrameLag) - 8}
            textAnchor="end"
            className="fill-fd-muted-foreground text-[10px]"
          >
            a merely slow frame settles at {Math.round(slowFrameLag)} events and
            stays there
          </text>

          <path
            d={line(DRAIN_BEFORE)}
            fill="none"
            className="stroke-red-500 dark:stroke-red-400"
            strokeWidth="2.5"
          />
          <path
            d={line(DRAIN_AFTER)}
            fill="none"
            className="stroke-fd-primary"
            strokeWidth="2.5"
          />
        </svg>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 border-fd-border border-t px-4 py-3 text-xs">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-5 rounded bg-red-500 dark:bg-red-400" />
          one frame per event
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-5 rounded bg-fd-primary" />
          coalesced to a frame interval
        </span>
        <span className="flex items-center gap-2 text-fd-muted-foreground">
          <span className="h-0.5 w-5 rounded bg-fd-muted-foreground opacity-70" />
          a merely slow frame, for comparison
        </span>
      </div>

      <div className="border-fd-border border-t px-4 py-4">
        <label htmlFor={sliderId} className="block text-fd-foreground text-xs">
          Pointer speed:{" "}
          <span className="font-medium tabular-nums">{rate}</span> motion events
          per second
        </label>
        <input
          id={sliderId}
          type="range"
          min={100}
          max={2000}
          step={50}
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="mt-3 w-full accent-fd-primary"
        />
        <p className="mt-3 mb-0 text-fd-muted-foreground text-xs leading-relaxed">
          At {rate} events per second the old path finishes a three second drag{" "}
          <span className="font-medium tabular-nums">{endBefore}</span> events
          behind the pointer and still climbing.{" "}
          {endAfter === 0
            ? "The coalesced path never falls behind at all, because it drains faster than the pointer can generate events."
            : `The coalesced path finishes ${endAfter} behind.`}
        </p>
      </div>

      <figcaption className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-xs leading-relaxed">
        Arithmetic on measured drain rates: 150 events per second when every
        motion event composes a frame, and 41,667 when it does not. The shape is
        the diagnosis. A slow frame costs a fixed lag that does not change with
        how long you drag. A backlog grows for as long as you keep moving, which
        is what the pointer trail actually looked like.
      </figcaption>
    </figure>
  );
}
