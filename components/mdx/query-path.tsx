'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The three bugs from the post, drawn as the same round trip: a program asks,
 * something answers, and the answer should come back to the program. Each
 * case breaks a different leg of that trip. Every node and symptom is taken
 * from the post's own account of the bug.
 */
interface Leg {
  label: string;
  ok: boolean;
}

interface Case {
  id: string;
  tab: string;
  asker: string;
  answerer: string;
  receiver: string;
  query: Leg;
  reply: Leg;
  back: Leg;
  symptom: string;
  shape: string;
}

const CASES: Case[] = [
  {
    id: 'dropped',
    tab: 'one: tuitest',
    asker: 'glow',
    answerer: "tuitest's emulator",
    receiver: 'an internal pipe',
    query: { label: 'OSC 11, CPR', ok: true },
    reply: { label: 'correct replies', ok: true },
    back: { label: 'nothing reads the pipe', ok: false },
    symptom: 'a blank capture, exit 0',
    shape: 'producer with no consumer',
  },
  {
    id: 'wrong',
    tab: 'two: replay tool',
    asker: 'program under test',
    answerer: 'the outer tmux',
    receiver: "the driver script's stdin",
    query: { label: 'mirrored to stdout', ok: false },
    reply: { label: 'DA, mode reports', ok: true },
    back: { label: 'nothing reads stdin, the pane echoes it', ok: false },
    symptom: 'a burst of garbage after exit',
    shape: 'consumer that is the wrong process',
  },
  {
    id: 'unparsed',
    tab: 'three: demo shell',
    asker: 'image display',
    answerer: 'browser terminal',
    receiver: "the demo's fake shell",
    query: { label: 'kitty graphics', ok: true },
    reply: { label: '_Gi=2;OK', ok: true },
    back: { label: 'read as typed text', ok: false },
    symptom: 'text at a prompt nobody typed',
    shape: 'consumer with no parser',
  },
];

function Node({ children }: { children: string }) {
  return (
    <div className="rounded-md border border-fd-border bg-fd-background px-3 py-2 text-center font-mono text-sm text-fd-foreground">
      {children}
    </div>
  );
}

function Arrow({ leg }: { leg: Leg }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1 font-mono text-xs sm:flex-col sm:gap-0.5 sm:px-0',
        leg.ok ? 'text-fd-muted-foreground' : 'text-fd-primary',
      )}
    >
      <span aria-hidden="true" className="sm:hidden">
        {leg.ok ? '↓' : '✕'}
      </span>
      <span aria-hidden="true" className="hidden sm:inline">
        {leg.ok ? '→' : '✕'}
      </span>
      <span className="sm:text-center">
        {leg.label}
        <span className="sr-only">{leg.ok ? '' : ' (broken)'}</span>
      </span>
    </div>
  );
}

export function QueryPath() {
  const [idx, setIdx] = useState(0);
  const c = CASES[idx];

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-wrap gap-2 p-4" role="tablist" aria-label="The three bugs">
        {CASES.map((k, i) => (
          <button
            key={k.id}
            type="button"
            role="tab"
            aria-selected={i === idx}
            aria-controls="query-path-panel"
            onClick={() => setIdx(i)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-fd-primary',
              i === idx
                ? 'border-fd-primary/60 text-fd-foreground'
                : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/40',
            )}
          >
            {k.tab}
          </button>
        ))}
      </div>

      <div
        id="query-path-panel"
        role="tabpanel"
        className="border-t border-fd-border p-4"
      >
        <div className="grid grid-cols-1 items-center gap-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-3">
          <Node>{c.asker}</Node>
          <Arrow leg={c.query} />
          <Node>{c.answerer}</Node>
          <Arrow leg={c.reply} />
          <Node>{c.receiver}</Node>
        </div>
        <div className="mt-3 flex items-center gap-2 font-mono text-xs">
          <span className={c.back.ok ? 'text-fd-muted-foreground' : 'text-fd-primary'}>
            {c.back.ok ? '←' : '✕'} back to {c.asker}: {c.back.label}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-fd-border px-4 py-3 text-sm">
        <span className="font-mono text-fd-primary">{c.shape}</span>
        <span className="text-fd-muted-foreground">symptom: {c.symptom}</span>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        The same round trip three times. The query goes out, something
        answers, and the answer has to reach the program that asked. Each bug
        breaks a different leg, marked with a cross, so each one shows a
        different symptom, and none of the symptoms says &quot;terminal
        query&quot;.
      </figcaption>
    </figure>
  );
}
