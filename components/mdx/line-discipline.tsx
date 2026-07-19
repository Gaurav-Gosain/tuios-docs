'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The flags the PTY fix clears, plus the one it deliberately keeps. ICANON is in
 * the list precisely so a reader can turn it off and see that doing so changes
 * what the program receives, which is why the fix stops where it does.
 */
interface Flags {
  ISIG: boolean;
  ECHO: boolean;
  IXON: boolean;
  ICANON: boolean;
}

const DEFAULT_FLAGS: Flags = { ISIG: true, ECHO: true, IXON: true, ICANON: true };

type ChildState = 'running' | 'killed' | 'stopped';

interface Lane {
  written: string[];
  received: string[];
  echoed: string[];
}

const EMPTY: Lane = { written: [], received: [], echoed: [] };

interface Key {
  label: string;
  byte: number;
  text?: string;
}

const KEYS: Key[] = [
  { label: '^C', byte: 0x03 },
  { label: '^S', byte: 0x13 },
  { label: '^Q', byte: 0x11 },
  { label: '^D', byte: 0x04 },
  { label: 'hello', byte: -1, text: 'hello' },
  { label: 'Enter', byte: 0x0d },
];

function hex(b: number) {
  return `0x${b.toString(16).padStart(2, '0')}`;
}

/**
 * A simulated line discipline sitting between what a harness writes and what the
 * program receives. Every rule here is one the kernel applies to a PTY that
 * nobody has put into raw mode, which is the state tuitest left its PTYs in.
 */
export function LineDiscipline() {
  const [flags, setFlags] = useState<Flags>(DEFAULT_FLAGS);
  const [child, setChild] = useState<ChildState>('running');
  const [lanes, setLanes] = useState<Lane>(EMPTY);
  const [lineBuf, setLineBuf] = useState<string>('');

  const reset = () => {
    setChild('running');
    setLanes(EMPTY);
    setLineBuf('');
  };

  const send = (k: Key) => {
    if (child === 'killed') return;

    const written: string[] = [];
    const received: string[] = [];
    const echoed: string[] = [];

    const bytes = k.text
      ? Array.from(k.text, (c) => c.charCodeAt(0))
      : [k.byte];

    for (const b of bytes) {
      written.push(k.text ? String.fromCharCode(b) : hex(b));

      // ISIG turns 0x03 into a signal. The program never sees the byte, and the
      // discipline echoes a literal ^C, which is the two-byte screen capture the
      // whole investigation started from.
      if (b === 0x03 && flags.ISIG) {
        if (flags.ECHO) echoed.push('^C');
        setChild('killed');
        setLanes((l) => ({
          written: [...l.written, ...written],
          received: [...l.received, ...received],
          echoed: [...l.echoed, ...echoed],
        }));
        return;
      }

      // Flow control stops output without anything looking wrong. A stray 0x13
      // in a tape could stall a session indefinitely.
      if (b === 0x13 && flags.IXON) {
        setChild('stopped');
        continue;
      }
      if (b === 0x11 && flags.IXON) {
        setChild((c) => (c === 'stopped' ? 'running' : c));
        continue;
      }

      // Echo puts harness keystrokes back on the master, where a screen model
      // reading that stream counts them as program output.
      if (flags.ECHO) echoed.push(k.text ? String.fromCharCode(b) : hex(b));

      // Canonical mode holds bytes until a newline. This is the one the fix
      // keeps, because it is what a real terminal does to a not-yet-raw program.
      if (flags.ICANON && b !== 0x0d) {
        setLineBuf((s) => s + (k.text ? String.fromCharCode(b) : hex(b)));
        continue;
      }
      if (flags.ICANON && b === 0x0d) {
        setLineBuf((s) => {
          if (s) received.push(`${s}\\n`);
          return '';
        });
        continue;
      }

      received.push(k.text ? String.fromCharCode(b) : hex(b));
    }

    setLanes((l) => ({
      written: [...l.written, ...written],
      received: [...l.received, ...received],
      echoed: [...l.echoed, ...echoed],
    }));
  };

  const flagRow = (name: keyof Flags, note: string) => (
    <label key={name} className="flex items-baseline gap-2 text-sm">
      <input
        type="checkbox"
        checked={flags[name]}
        onChange={(e) => setFlags((f) => ({ ...f, [name]: e.target.checked }))}
        className="size-4 accent-current"
      />
      <span className="font-mono text-fd-foreground">{name}</span>
      <span className="text-xs text-fd-muted-foreground">{note}</span>
    </label>
  );

  const lane = (title: string, items: string[], tone: string) => (
    <div className="min-w-0 flex-1">
      <div className="mb-1.5 font-mono text-xs text-fd-muted-foreground">{title}</div>
      <div
        className={cn(
          'h-24 overflow-y-auto rounded border border-fd-border bg-fd-background p-2',
          'font-mono text-xs leading-5',
          tone,
        )}
      >
        {items.length ? items.join(' ') : <span className="opacity-40">nothing</span>}
      </div>
    </div>
  );

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-wrap gap-2 border-b border-fd-border p-4">
        {KEYS.map((k) => (
          <button
            key={k.label}
            type="button"
            onClick={() => send(k)}
            disabled={child === 'killed'}
            className={cn(
              'rounded-md border border-fd-border px-3 py-1.5 font-mono text-sm',
              'text-fd-foreground transition-colors',
              'hover:border-fd-primary/60 focus:outline-none focus:ring-1 focus:ring-fd-primary',
              'disabled:cursor-not-allowed disabled:opacity-40',
            )}
          >
            {k.label}
          </button>
        ))}
        <button
          type="button"
          onClick={reset}
          className="ml-auto rounded-md px-3 py-1.5 text-sm text-fd-muted-foreground hover:text-fd-foreground focus:outline-none focus:ring-1 focus:ring-fd-primary"
        >
          reset
        </button>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-fd-border px-4 py-3">
        {flagRow('ISIG', 'turns bytes into signals')}
        {flagRow('ECHO', 'writes input back up the master')}
        {flagRow('IXON', 'flow control')}
        {flagRow('ICANON', 'line buffering, the fix keeps this')}
      </div>

      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        {lane('written to the master', lanes.written, 'text-fd-foreground')}
        {lane('received by the program', lanes.received, 'text-fd-foreground')}
        {lane('echoed back', lanes.echoed, 'text-fd-primary')}
      </div>

      <div className="flex items-center gap-3 border-t border-fd-border px-4 py-2.5 font-mono text-xs">
        <span className="text-fd-muted-foreground">child:</span>
        <span
          className={cn(
            child === 'running' && 'text-fd-foreground',
            child === 'killed' && 'text-fd-primary',
            child === 'stopped' && 'text-fd-muted-foreground',
          )}
        >
          {child === 'running' && 'running'}
          {child === 'killed' && 'killed by interrupt'}
          {child === 'stopped' && 'stopped by flow control'}
        </span>
        {flags.ICANON && lineBuf ? (
          <span className="ml-auto text-fd-muted-foreground">
            line buffer: {lineBuf}
          </span>
        ) : null}
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        Press <code>^C</code> with <code>ISIG</code> on. The program receives
        nothing, the child dies, and a literal <code>^C</code> lands in the echo
        lane, which is the entire screen tuitest captured. Turn{' '}
        <code>ISIG</code> off and the same press arrives as an ordinary byte.
        Press <code>^S</code> to stall output with nothing visibly wrong, then{' '}
        <code>^Q</code> to revive it. The echo lane is the third bug: harness
        keystrokes coming back up the master, where a screen model counts them as
        output the program never wrote.
      </figcaption>
    </figure>
  );
}
