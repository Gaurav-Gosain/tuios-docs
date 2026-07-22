'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * The three startup settings drive an exact first frame. Each is off by default,
 * so all three off reproduces the old empty workspace. The reader flips switches
 * to find their own combination; the right panel is the frame they would get on
 * the next launch, not an illustration of one.
 *
 * start_in_terminal_mode has a real dependency on open_default_window: with no
 * window there is nothing to focus, so the toggle is disabled and says why.
 */

const SETTINGS = [
  {
    key: 'open_default_window',
    desc: 'Open one terminal on launch instead of an empty workspace.',
  },
  {
    key: 'tiled',
    desc: 'Start with tiling on, so the window fills its tile.',
  },
  {
    key: 'start_in_terminal_mode',
    desc: 'Send the first keystroke to the shell, not the window manager.',
  },
] as const;

/** A block cursor, filled in terminal mode and outlined in normal mode. */
function Cursor({ solid }: { solid: boolean }) {
  return (
    <span
      className={cn(
        'ml-0.5 inline-block h-3.5 w-2 translate-y-0.5',
        solid ? 'bg-fd-foreground' : 'border border-fd-foreground',
      )}
      aria-hidden="true"
    />
  );
}

function ShellBody({ terminalMode }: { terminalMode: boolean }) {
  return (
    <div className="px-2 py-1.5 font-mono text-[11px] leading-5">
      <span className="text-fd-primary">~</span>
      <span className="text-fd-muted-foreground"> $ </span>
      <Cursor solid={terminalMode} />
    </div>
  );
}

export function StartupPreview() {
  const [openDefault, setOpenDefault] = useState(false);
  const [tiled, setTiled] = useState(false);
  const [termMode, setTermMode] = useState(false);

  // The dependency: terminal mode needs a window to focus.
  const termModeEffective = openDefault && termMode;
  const state = { open_default_window: openDefault, tiled, start_in_terminal_mode: termMode };

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="grid gap-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Toggles. */}
        <div className="flex flex-col gap-3 border-b border-fd-border p-4 sm:border-b-0 sm:border-r">
          {SETTINGS.map((s) => {
            const disabled = s.key === 'start_in_terminal_mode' && !openDefault;
            const checked = state[s.key] && !(disabled);
            const onChange = (v: boolean) => {
              if (s.key === 'open_default_window') setOpenDefault(v);
              else if (s.key === 'tiled') setTiled(v);
              else setTermMode(v);
            };
            return (
              <label
                key={s.key}
                className={cn(
                  'flex cursor-pointer items-start gap-3',
                  disabled && 'cursor-not-allowed opacity-55',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={(e) => onChange(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-fd-primary"
                />
                <span className="min-w-0">
                  <span className="block font-mono text-sm text-fd-foreground">
                    {s.key}
                  </span>
                  <span className="block text-xs text-fd-muted-foreground">
                    {disabled ? 'needs a window to focus' : s.desc}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {/* First frame. */}
        <div className="relative flex h-56 flex-col bg-fd-background/40 p-3">
          {openDefault ? (
            tiled ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm border border-fd-primary/60 bg-fd-background/70">
                <div className="border-b border-fd-border/70 bg-fd-muted/40 px-2 py-0.5 font-mono text-[10px] text-fd-muted-foreground">
                  zsh
                </div>
                <ShellBody terminalMode={termModeEffective} />
              </div>
            ) : (
              <div className="min-h-0 flex-1">
                <div className="mx-auto w-[85%] overflow-hidden rounded-md border border-fd-border bg-fd-background/80 shadow-md">
                  <div className="flex items-center gap-1.5 border-b border-fd-border/70 bg-fd-muted/50 px-2 py-1">
                    <span className="size-2 rounded-full bg-fd-muted-foreground/40" aria-hidden="true" />
                    <span className="font-mono text-[10px] text-fd-muted-foreground">zsh</span>
                  </div>
                  <ShellBody terminalMode={termModeEffective} />
                </div>
              </div>
            )
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <span className="font-mono text-[11px] text-fd-muted-foreground">
                no windows. press the leader key to open one.
              </span>
            </div>
          )}

          {/* Dock: mode indicator plus a workspace marker. */}
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-fd-border/70 pt-2">
            <span
              className={cn(
                'rounded-sm px-2 py-0.5 font-mono text-[10px] font-medium',
                termModeEffective
                  ? 'bg-fd-primary/15 text-fd-primary'
                  : 'bg-fd-muted/60 text-fd-muted-foreground',
              )}
            >
              {termModeEffective ? 'TERMINAL' : 'NORMAL'}
            </span>
            <span className="font-mono text-[10px] text-fd-muted-foreground">
              workspace 1
            </span>
          </div>
        </div>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        All three off is a fresh install: an empty workspace. Turn on{' '}
        <code className="font-mono text-xs">open_default_window</code> for a
        floating terminal, add <code className="font-mono text-xs">tiled</code>{' '}
        to fill the tile, and{' '}
        <code className="font-mono text-xs">start_in_terminal_mode</code> to put
        the cursor in the shell, where the mode reads TERMINAL and the cursor is
        solid rather than hollow.
      </figcaption>
    </figure>
  );
}
