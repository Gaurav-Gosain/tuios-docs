'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The kitty graphics medium negotiation through the multiplexer, before and
 * after the fix in a7d49a48. File, temp file and shared memory all count as
 * file media (isFileMedium), and hostReadsFiles is false for a browser client.
 * Before the fix the passthrough answered OK to every probe. After it, a file
 * medium gets ENOTSUPPORTED when the host cannot read files, and a file
 * transmission from a guest that never asked is re-encoded as direct data.
 */
type Host = 'terminal' | 'browser';
type Proxy = 'lies' | 'asks';
type Guest = 'probes' | 'never';

const PROBES = [
  { medium: 't=d', name: 'inline pixels', file: false },
  { medium: 't=t', name: 'temp file', file: true },
  { medium: 't=s', name: 'shared memory', file: true },
];

interface Outcome {
  replies: { medium: string; name: string; reply: string }[] | null;
  sends: string;
  forwarded: string;
  drawn: boolean;
  why: string;
}

function outcome(host: Host, proxy: Proxy, guest: Guest): Outcome {
  const hostReadsFiles = host === 'terminal';

  if (guest === 'never') {
    if (proxy === 'lies' || hostReadsFiles) {
      return {
        replies: null,
        sends: 'a file path',
        forwarded: 'the path, as sent',
        drawn: hostReadsFiles,
        why: hostReadsFiles
          ? 'The host shares the filesystem, so the path resolves.'
          : 'The browser cannot open a path on the server and drops the transmission.',
      };
    }
    return {
      replies: null,
      sends: 'a file path',
      forwarded: 're-encoded as direct data',
      drawn: true,
      why: 'The multiplexer reads the file itself and forwards the bytes.',
    };
  }

  const replies = PROBES.map((p) => ({
    medium: p.medium,
    name: p.name,
    reply:
      proxy === 'lies' || !p.file || hostReadsFiles ? 'OK' : 'ENOTSUPPORTED',
  }));
  const fileOk = replies.some((r, i) => PROBES[i].file && r.reply === 'OK');

  if (fileOk) {
    return {
      replies,
      sends: 'a file path',
      forwarded: 'the path, as sent',
      drawn: hostReadsFiles,
      why: hostReadsFiles
        ? 'The yes happens to be true: the host can read the file.'
        : 'The yes was never checked. The browser drops the path and draws nothing.',
    };
  }
  return {
    replies,
    sends: 'the pixels inline',
    forwarded: 'the bytes',
    drawn: true,
    why: 'Told no, the guest falls back to the medium that always works.',
  };
}

function Choice<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 font-mono text-xs text-fd-muted-foreground">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={o.id === value}
            onClick={() => onChange(o.id)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-fd-primary',
              o.id === value
                ? 'border-fd-primary/60 text-fd-foreground'
                : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/40',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function MediumProbe() {
  const [host, setHost] = useState<Host>('browser');
  const [proxy, setProxy] = useState<Proxy>('lies');
  const [guest, setGuest] = useState<Guest>('probes');
  const o = outcome(host, proxy, guest);

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="grid gap-4 p-4 sm:grid-cols-3">
        <Choice
          legend="host outside the multiplexer"
          value={host}
          onChange={setHost}
          options={[
            { id: 'terminal', label: 'local terminal' },
            { id: 'browser', label: 'browser client' },
          ]}
        />
        <Choice
          legend="multiplexer passthrough"
          value={proxy}
          onChange={setProxy}
          options={[
            { id: 'lies', label: 'before: always OK' },
            { id: 'asks', label: 'after: asks the host' },
          ]}
        />
        <Choice
          legend="guest program"
          value={guest}
          onChange={setGuest}
          options={[
            { id: 'probes', label: 'icat, probes first' },
            { id: 'never', label: 'never asks' },
          ]}
        />
      </div>

      <div className="overflow-x-auto border-t border-fd-border">
        <pre className="min-w-max px-4 py-3 font-mono text-sm leading-6">
          {o.replies ? (
            o.replies.map((r) => (
              <div key={r.medium}>
                <span className="text-fd-foreground">
                  a=q,{r.medium}
                </span>
                <span className="text-fd-muted-foreground">
                  {'  '}
                  {r.name.padEnd(14)}
                </span>
                <span
                  className={
                    r.reply === 'OK' ? 'text-fd-primary' : 'text-fd-muted-foreground'
                  }
                >
                  {r.reply}
                </span>
              </div>
            ))
          ) : (
            <div className="text-fd-muted-foreground">no query sent</div>
          )}
          <div className="mt-2 text-fd-muted-foreground">
            guest sends{'      '}
            <span className="text-fd-foreground">{o.sends}</span>
          </div>
          <div className="text-fd-muted-foreground">
            host receives{'    '}
            <span className="text-fd-foreground">{o.forwarded}</span>
          </div>
        </pre>
      </div>

      <div
        className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-fd-border px-4 py-3 text-sm"
        aria-live="polite"
      >
        <span
          className={cn(
            'font-mono',
            o.drawn ? 'text-fd-foreground' : 'text-fd-primary',
          )}
        >
          {o.drawn ? 'image drawn' : 'nothing drawn, nothing logged'}
        </span>
        <span className="text-fd-muted-foreground">{o.why}</span>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        Only one pairing fails: the old passthrough in front of a host that
        cannot read the server&apos;s files. Change either and the image
        appears, which is why each layer passed its own tests. The replies
        here are the passthrough&apos;s, not the host&apos;s: the guest never
        talks to the host directly.
      </figcaption>
    </figure>
  );
}
