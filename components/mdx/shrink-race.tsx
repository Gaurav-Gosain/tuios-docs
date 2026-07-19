'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The real generated tape, with the time each command costs the child before the
 * control characters arrive. The child needs roughly 40ms to reach raw mode; the
 * longer a candidate spends before the burst, the more often the program wins
 * the race and the candidate passes.
 */
interface Cmd {
  text: string;
  /** Milliseconds this command gives the child before the next one runs. */
  cost: number;
  /** The burst itself cannot be deleted; without it nothing fails. */
  required?: boolean;
}

const TAPE: Cmd[] = [
  { text: 'Spawn ./myapp', cost: 0, required: true },
  { text: 'Type "hello"', cost: 8 },
  { text: 'Key Down', cost: 4 },
  { text: 'WaitStable @250ms', cost: 30 },
  { text: 'Mouse Drag 10 4 20 12', cost: 6 },
  { text: 'Key Ctrl+c Ctrl+c Ctrl+c', cost: 0, required: true },
];

/** Time the child needs to call MakeRaw and stop the kernel eating input. */
const RAW_MODE_MS = 40;

/** Probability a candidate fails: the less time before the burst, the likelier. */
function failureRate(kept: number[]) {
  const budget = kept.reduce((n, i) => n + TAPE[i].cost, 0);
  if (budget >= RAW_MODE_MS) return 0.05;
  return 0.95 - (budget / RAW_MODE_MS) * 0.9;
}

interface Step {
  kept: number[];
  tried: number | null;
  accepted: boolean | null;
  replays: boolean[];
  rate: number;
}

function initial(): Step {
  const kept = TAPE.map((_, i) => i);
  return { kept, tried: null, accepted: null, replays: [], rate: failureRate(kept) };
}

export function ShrinkRace() {
  const [threshold, setThreshold] = useState(1);
  const [step, setStep] = useState<Step>(initial);
  const [history, setHistory] = useState<number[]>([failureRate(initial().kept)]);
  const [done, setDone] = useState(false);

  const reset = (t = threshold) => {
    const s = initial();
    setStep(s);
    setHistory([s.rate]);
    setDone(false);
    setThreshold(t);
  };

  // One shrinker pass: propose deleting the first removable command, replay it
  // `threshold` times, and accept the deletion if every replay still failed.
  const advance = () => {
    if (done) return;
    const removable = step.kept.filter((i) => !TAPE[i].required);
    if (!removable.length) {
      setDone(true);
      return;
    }
    const tried = removable[0];
    const candidate = step.kept.filter((i) => i !== tried);
    const rate = failureRate(candidate);
    const replays = Array.from({ length: threshold }, () => Math.random() < rate);
    const accepted = replays.every(Boolean);

    const kept = accepted ? candidate : step.kept;
    setStep({ kept, tried, accepted, replays, rate: failureRate(kept) });
    setHistory((h) => [...h, failureRate(kept)]);
    if (!accepted && removable.length === 1) setDone(true);
  };

  const runAll = () => {
    let cur = step;
    const rates = [...history];
    for (let guard = 0; guard < 24; guard++) {
      const removable = cur.kept.filter((i) => !TAPE[i].required);
      if (!removable.length) break;
      let progressed = false;
      for (const tried of removable) {
        const candidate = cur.kept.filter((i) => i !== tried);
        const rate = failureRate(candidate);
        const replays = Array.from({ length: threshold }, () => Math.random() < rate);
        if (replays.every(Boolean)) {
          cur = { kept: candidate, tried, accepted: true, replays, rate: failureRate(candidate) };
          rates.push(cur.rate);
          progressed = true;
          break;
        }
      }
      if (!progressed) break;
    }
    setStep(cur);
    setHistory(rates);
    setDone(true);
  };

  const finalRate = Math.round(step.rate * 100);
  const chart = useMemo(() => {
    const w = 100;
    const h = 28;
    if (history.length < 2) return '';
    return history
      .map((r, i) => `${(i / (history.length - 1)) * w},${h - r * h}`)
      .join(' ');
  }, [history]);

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="overflow-x-auto border-b border-fd-border">
        <pre className="min-w-max px-4 py-3 font-mono text-sm leading-6">
          {TAPE.map((c, i) => {
            const kept = step.kept.includes(i);
            const isTried = step.tried === i && step.accepted === false;
            return (
              <div
                key={i}
                className={cn(
                  kept && !isTried && 'text-fd-foreground',
                  isTried && 'text-fd-muted-foreground',
                  !kept && 'text-fd-muted-foreground/60 line-through decoration-fd-primary/70',
                )}
              >
                {c.text}
                {isTried ? '   (tried, kept: it passed a replay)' : ''}
              </div>
            );
          })}
        </pre>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-fd-border p-4">
        <button
          type="button"
          onClick={advance}
          disabled={done}
          className={cn(
            'rounded-md border border-fd-border px-3 py-1.5 text-sm text-fd-foreground',
            'hover:border-fd-primary/60 focus:outline-none focus:ring-1 focus:ring-fd-primary',
            'disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          step
        </button>
        <button
          type="button"
          onClick={runAll}
          disabled={done}
          className="rounded-md border border-fd-border px-3 py-1.5 text-sm text-fd-foreground hover:border-fd-primary/60 focus:outline-none focus:ring-1 focus:ring-fd-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          run to convergence
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="text-sm text-fd-muted-foreground hover:text-fd-foreground focus:outline-none focus:ring-1 focus:ring-fd-primary"
        >
          reset
        </button>

        <label className="ml-auto flex items-center gap-3 text-sm">
          <span className="whitespace-nowrap text-fd-muted-foreground">
            replays before accepting
          </span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={threshold}
            onChange={(e) => reset(Number(e.target.value))}
            className="w-28 accent-current"
            aria-label="How many replays a candidate must fail before the deletion is accepted"
          />
          <span className="w-4 font-mono tabular-nums text-fd-muted-foreground">
            {threshold}
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-6 p-4">
        <div>
          <div className="font-mono text-xs text-fd-muted-foreground">
            failure rate of the current tape
          </div>
          <div className="font-mono text-2xl tabular-nums text-fd-foreground">
            {finalRate}%
          </div>
        </div>
        {chart ? (
          <svg
            viewBox="0 0 100 28"
            className="h-12 flex-1"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Failure rate across ${history.length} shrinker passes, ending at ${finalRate} percent.`}
          >
            <polyline
              points={chart}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              className="text-fd-primary"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        ) : null}
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        Each command gives the child a few milliseconds to reach raw mode before
        the control characters arrive, so deleting one makes the tape fail more
        often. At one replay the shrinker keeps every deletion that raises the
        failure rate and walks straight to the two-command tape, which is what it
        actually produced. Raise the bar and it stalls, refusing deletions that
        only fail sometimes. The line is the failure rate climbing as the tape
        gets shorter.
      </figcaption>
    </figure>
  );
}
