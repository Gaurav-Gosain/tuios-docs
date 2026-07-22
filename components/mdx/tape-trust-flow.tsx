'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The four stages of the project-tape trust boundary, walked one screen at a
 * time. The interactive core is the "edit the tape" toggle at the last stage:
 * flipping it changes one line, which reverts trust and drops the flow back to
 * the start, because trust binds to the file's content hash rather than its
 * path. That revert is the whole argument for the boundary, so the widget lets
 * the reader cause it rather than read about it.
 */

const TAPE_BASE = [
  'Session "myproject"',
  'RenameWindow "server"',
  'Type "pnpm dev" Enter',
  'Split vertical',
  'Type "nvim ." Enter',
];

/** The one line the "edit the tape" toggle rewrites. */
const EDITED_INDEX = 2;
const EDITED_LINE = 'Type "pnpm dev --host" Enter';

const STAGES = [
  {
    label: 'detect',
    note: 'Detection is passive. A badge and a notification appear. Nothing runs.',
  },
  {
    label: 'review',
    note: 'The full tape is shown before anything executes. r runs it once, t trusts and runs, n never asks again.',
  },
  {
    label: 'run',
    note: 'Run once or Trust and run builds a session named after the project and switches you into it.',
  },
  {
    label: 're-enter',
    note: 'Flip "edit the tape" on. One line changes, trust reverts to untrusted, and the flow is back at detect. Trust bound to the path would have missed the edit.',
  },
] as const;

function Pill({
  tone,
  children,
}: {
  tone: 'untrusted' | 'trusted';
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[11px] font-medium',
        tone === 'untrusted'
          ? 'bg-amber-500/12 text-amber-700 dark:text-amber-300'
          : 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          tone === 'untrusted' ? 'bg-amber-500' : 'bg-emerald-500',
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

/** A shell prompt line, optionally with a blinking block cursor at the end. */
function Prompt({
  dir,
  command,
  cursor = false,
}: {
  dir: string;
  command?: string;
  cursor?: boolean;
}) {
  return (
    <div className="whitespace-pre">
      <span className="text-fd-primary">{dir}</span>
      <span className="text-fd-muted-foreground"> $ </span>
      <span className="text-fd-foreground">{command}</span>
      {cursor ? (
        <span className="ml-0.5 inline-block h-3.5 w-2 translate-y-0.5 animate-pulse bg-fd-foreground motion-reduce:animate-none" />
      ) : null}
    </div>
  );
}

function Pane({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-sm border border-fd-border/70 bg-fd-background/60',
        className,
      )}
    >
      <div className="border-b border-fd-border/70 bg-fd-muted/40 px-2 py-0.5 font-mono text-[10px] text-fd-muted-foreground">
        {title}
      </div>
      <div className="flex-1 px-2 py-1.5 font-mono text-[11px] leading-5">
        {children}
      </div>
    </div>
  );
}

export function TapeTrustFlow() {
  const [stage, setStage] = useState(0);
  const [edited, setEdited] = useState(false);

  const tape = edited
    ? TAPE_BASE.map((line, i) => (i === EDITED_INDEX ? EDITED_LINE : line))
    : TAPE_BASE;

  const go = (next: number) => setStage(Math.max(0, Math.min(3, next)));

  const editToggle = (on: boolean) => {
    setEdited(on);
    // Any edit reverts trust, so the flow returns to detection.
    if (on) setStage(0);
  };

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/40 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-fd-muted-foreground/35" />
          <span className="size-2.5 rounded-full bg-fd-muted-foreground/35" />
          <span className="size-2.5 rounded-full bg-fd-muted-foreground/35" />
        </span>
        <span className="font-mono text-xs text-fd-muted-foreground">
          .tuios.tape
        </span>
      </div>

      {/* The workspace screen. */}
      <div className="relative h-64 overflow-hidden bg-fd-background/40 p-3">
        {/* Stage 0: passive detection. */}
        {stage === 0 ? (
          <div className="flex h-full flex-col">
            <Pane title="zsh" className="flex-1">
              <Prompt dir="~" command="cd ~/dev/myproject" />
              <Prompt dir="~/dev/myproject" cursor />
            </Pane>
            <div
              className="pointer-events-none absolute right-3 top-3 max-w-[62%] rounded-md border border-amber-500/40 bg-fd-card px-3 py-2 text-[11px] text-fd-foreground shadow-sm motion-safe:animate-[fadeInUp_0.4s_ease-out]"
              role="status"
            >
              Project tape found (untrusted). Press ? to review.
            </div>
          </div>
        ) : null}

        {/* Stage 1: the review dialog. */}
        {stage === 1 ? (
          <div className="flex h-full items-center justify-center">
            <div className="absolute inset-0 bg-fd-foreground/10" aria-hidden="true" />
            <div className="relative w-full max-w-md overflow-hidden rounded-md border border-fd-border bg-fd-card shadow-lg">
              <div className="flex items-center justify-between gap-3 border-b border-fd-border px-3 py-2">
                <span className="font-mono text-xs text-fd-foreground">
                  Review .tuios.tape
                </span>
                <Pill tone="untrusted">
                  {edited ? 'changed since trust' : 'untrusted'}
                </Pill>
              </div>
              <pre className="overflow-x-auto px-3 py-2 font-mono text-[11px] leading-5">
                {tape.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      'whitespace-pre px-1',
                      edited && i === EDITED_INDEX
                        ? 'rounded-sm bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        : 'text-fd-foreground',
                    )}
                  >
                    {line}
                  </div>
                ))}
              </pre>
              <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-fd-border px-3 py-2 font-mono text-[11px] text-fd-muted-foreground">
                <span>
                  <kbd className="text-fd-primary">r</kbd> Run once
                </span>
                <span>
                  <kbd className="text-fd-primary">t</kbd> Trust and run
                </span>
                <span>
                  <kbd className="text-fd-primary">n</kbd> Never
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Stage 2: the built session. */}
        {stage === 2 ? (
          <div className="grid h-full grid-cols-2 gap-2">
            <Pane title="server">
              <div className="text-fd-muted-foreground">$ pnpm dev</div>
              <div className="text-fd-foreground">VITE v5.4.0 ready in 312 ms</div>
              <div className="text-fd-muted-foreground">
                Local: http://localhost:5173/
              </div>
              {edited ? (
                <div className="text-fd-muted-foreground">
                  Network: http://192.168.1.4:5173/
                </div>
              ) : null}
            </Pane>
            <Pane title="editor">
              <div className="text-fd-muted-foreground">
                <span className="mr-2 text-fd-muted-foreground/60">1</span>
                import Server from './server'
              </div>
              <div className="text-fd-muted-foreground/60">~</div>
              <div className="text-fd-muted-foreground/60">~</div>
              <div className="text-fd-muted-foreground/60">~</div>
            </Pane>
          </div>
        ) : null}

        {/* Stage 3: quiet re-entry, or reverted trust if edited. */}
        {stage === 3 ? (
          <div className="flex h-full flex-col">
            <Pane title="zsh" className="flex-1">
              <Prompt dir="~" command="cd ~/dev/myproject" />
              {edited ? (
                <Prompt dir="~/dev/myproject" cursor />
              ) : (
                <>
                  <div className="text-emerald-700 dark:text-emerald-300">
                    Trusted tape, building session "myproject".
                  </div>
                  <Prompt dir="~/dev/myproject" cursor />
                </>
              )}
            </Pane>
          </div>
        ) : null}

        {/* Dock, present on every stage. */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-fd-muted-foreground">
            session: myproject
          </span>
          {stage === 3 && !edited ? (
            <Pill tone="trusted">tape: trusted</Pill>
          ) : (
            <Pill tone="untrusted">
              {edited ? 'tape: changed since trust' : 'tape: untrusted'}
            </Pill>
          )}
        </div>
      </div>

      {/* Controls. */}
      <div className="flex flex-wrap items-center gap-3 border-t border-fd-border px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => go(stage - 1)}
            disabled={stage === 0}
            className="rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-foreground transition-colors hover:border-fd-primary/60 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary motion-reduce:transition-none"
          >
            prev
          </button>
          <button
            type="button"
            onClick={() => go(stage + 1)}
            disabled={stage === 3}
            className="rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-foreground transition-colors hover:border-fd-primary/60 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary motion-reduce:transition-none"
          >
            next
          </button>
        </div>

        <div className="flex items-center gap-2" role="tablist" aria-label="tape trust stages">
          {STAGES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              role="tab"
              aria-selected={i === stage}
              aria-label={`${s.label} stage`}
              onClick={() => go(i)}
              className={cn(
                'size-2.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary focus-visible:ring-offset-1 focus-visible:ring-offset-fd-card motion-reduce:transition-none',
                i === stage
                  ? 'bg-fd-primary'
                  : 'bg-fd-muted-foreground/30 hover:bg-fd-muted-foreground/60',
              )}
            />
          ))}
        </div>

        <label className="ml-auto flex items-center gap-2 text-xs text-fd-foreground">
          <input
            type="checkbox"
            checked={edited}
            onChange={(e) => editToggle(e.target.checked)}
            className="size-4 accent-current"
          />
          edit the tape
        </label>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        {STAGES[stage].note}
      </figcaption>
    </figure>
  );
}
