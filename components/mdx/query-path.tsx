'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The three bugs from the post, drawn as the same round trip: a program asks,
 * something answers, the answer lands somewhere, and it should get back to the
 * program. Each case breaks the trip at a different point, marked with a
 * cross. Legs after the break are drawn as lost, since they fail only because
 * the break came first. Every node and symptom is taken from the post's own
 * account of the bug.
 */
type Status = 'ok' | 'break' | 'lost';

interface Leg {
  label: string;
  status: Status;
}

interface Case {
  id: string;
  tab: string;
  asker: string;
  answerer: string;
  receiver: string;
  receiverBroken: boolean;
  query: Leg;
  reply: Leg;
  back: Leg;
  breakPoint: string;
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
    receiverBroken: false,
    query: { label: 'OSC 11, CPR', status: 'ok' },
    reply: { label: 'correct replies', status: 'ok' },
    back: { label: 'nothing reads the pipe', status: 'break' },
    breakPoint: 'the way out of the pipe',
    symptom: 'a blank capture, exit 0',
    shape: 'producer with no consumer',
  },
  {
    id: 'wrong',
    tab: 'two: replay tool',
    asker: 'program under test',
    answerer: 'the outer tmux',
    receiver: "the driver script's stdin",
    receiverBroken: false,
    query: { label: 'mirrored to stdout', status: 'break' },
    reply: { label: 'DA, mode reports', status: 'ok' },
    back: { label: 'nothing reads stdin, the pane echoes it', status: 'lost' },
    breakPoint: 'the query, which reached the wrong terminal',
    symptom: 'a burst of garbage after exit',
    shape: 'consumer that is the wrong process',
  },
  {
    id: 'unparsed',
    tab: 'three: demo shell',
    asker: 'image display',
    answerer: 'browser terminal',
    receiver: "the demo's fake shell",
    receiverBroken: true,
    query: { label: 'kitty graphics', status: 'ok' },
    reply: { label: '_Gi=2;OK', status: 'ok' },
    back: { label: 'read as typed text and echoed', status: 'lost' },
    breakPoint: 'the receiver, which has no parser',
    symptom: 'text at a prompt nobody typed',
    shape: 'consumer with no parser',
  },
];

const tone: Record<Status, string> = {
  ok: 'text-fd-muted-foreground',
  break: 'text-fd-primary font-semibold',
  lost: 'text-fd-muted-foreground/60',
};

const srText: Record<Status, string> = {
  ok: '',
  break: ' (broken here)',
  lost: ' (fails because of the break)',
};

function Node({ children, broken }: { children: string; broken?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-md border bg-fd-background px-3 py-2 text-center font-mono text-sm text-fd-foreground',
        broken ? 'border-fd-primary border-2' : 'border-fd-border',
      )}
    >
      {broken ? (
        <span aria-hidden="true" className="mr-1 text-fd-primary">
          ✕
        </span>
      ) : null}
      {children}
      {broken ? <span className="sr-only"> (broken here: no parser)</span> : null}
    </div>
  );
}

function glyph(status: Status, dir: 'down' | 'right' | 'left'): string {
  if (status === 'break') return '✕';
  if (status === 'lost') return '⋯';
  return dir === 'down' ? '↓' : dir === 'right' ? '→' : '←';
}

function Arrow({ leg }: { leg: Leg }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1 font-mono text-xs sm:flex-col sm:gap-0.5 sm:px-0',
        tone[leg.status],
      )}
    >
      <span aria-hidden="true" className="sm:hidden">
        {glyph(leg.status, 'down')}
      </span>
      <span aria-hidden="true" className="hidden sm:inline">
        {glyph(leg.status, 'right')}
      </span>
      <span className={cn('sm:text-center', leg.status === 'lost' && 'line-through')}>
        {leg.label}
        <span className="sr-only">{srText[leg.status]}</span>
      </span>
    </div>
  );
}

export function QueryPath() {
  const [idx, setIdx] = useState(0);
  const c = CASES[idx];

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (idx + (e.key === 'ArrowRight' ? 1 : CASES.length - 1)) % CASES.length;
    setIdx(next);
    const btn = e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next];
    btn?.focus();
  }

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div
        className="flex flex-wrap gap-2 p-4"
        role="tablist"
        aria-label="The three bugs"
        onKeyDown={onKeyDown}
      >
        {CASES.map((k, i) => (
          <button
            key={k.id}
            type="button"
            role="tab"
            aria-selected={i === idx}
            aria-controls="query-path-panel"
            tabIndex={i === idx ? 0 : -1}
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
          <Node broken={c.receiverBroken}>{c.receiver}</Node>
        </div>
        <div className={cn('mt-3 flex items-center gap-2 font-mono text-xs', tone[c.back.status])}>
          <span aria-hidden="true">{glyph(c.back.status, 'left')}</span>
          <span>
            back to {c.asker}:{' '}
            <span className={cn(c.back.status === 'lost' && 'line-through')}>{c.back.label}</span>
            <span className="sr-only">{srText[c.back.status]}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-fd-border px-4 py-3 text-sm">
        <span className="font-mono text-fd-primary">{c.shape}</span>
        <span className="text-fd-muted-foreground">breaks at: {c.breakPoint}</span>
        <span className="text-fd-muted-foreground">symptom: {c.symptom}</span>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        The same round trip three times. The query goes out, something
        answers, and the answer has to reach the program that asked. Each bug
        breaks the trip at a different point, marked with a cross: the way out
        of a pipe, the query itself, the receiver. A struck-through leg fails
        only because of the break before it. Each break shows a different
        symptom, and none of the symptoms says &quot;terminal query&quot;.
      </figcaption>
    </figure>
  );
}
