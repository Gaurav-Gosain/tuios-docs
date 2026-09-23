"use client";

import { Play, RotateCcw, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { type CheatRow, cheatsheet, shellIdeas } from "@/lib/learn/cheatsheet";
import { chordParts, keyBytes } from "@/lib/learn/keys";
import { runSetup, sleep, type TuiosInstance } from "@/lib/learn/runtime";
import type { KeyItem, TuiosEvent, TuiosState } from "@/lib/learn/types";
import { KeySequence, useHeldKeys } from "./keycaps";
import { LiveTerminal } from "./live-terminal";
import { ModeBadge } from "./mode-badge";

/**
 * Free play: the live tuios with a cheat sheet beside it. No steps and no
 * timer. Every row plays its keys into tuios when clicked, so the sheet is
 * also a way to try a key before learning it.
 */
export function Playground({ onExit }: { onExit: () => void }) {
  const held = useHeldKeys();
  const [sim, setSim] = useState<Set<string>>(() => new Set());
  const [tstate, setTstate] = useState<TuiosState | null>(null);
  const [run, setRun] = useState(0);
  const tuiosRef = useRef<TuiosInstance | null>(null);
  const busy = useRef(false);
  // Windows whose shell is running a program right now, such as top or the
  // agent. A shell idea typed into one would go to the program instead.
  const running = useRef(new Set<string>());

  const onReady = useCallback(async (t: TuiosInstance) => {
    tuiosRef.current = t;
    running.current.clear();
    t.onEvent((e: TuiosEvent) => {
      if (e.state) setTstate(e.state);
      if (!e.windowId) return;
      if (e.type === "shell.start") running.current.add(e.windowId);
      if (e.type === "shell.command" || e.type === "window.close")
        running.current.delete(e.windowId);
    });
    await new Promise<void>((resolve) => t.onFirstFrame(resolve));
    await runSetup(t, [
      { command: "newWindow", wait: 300 },
      { command: "mode", args: ["terminal"], wait: 150 },
      { command: "type", args: ["neofetch\r"] },
    ]);
    t.term.focus();
  }, []);

  // The page behind should not scroll while free play is open.
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  const play = useCallback(
    async (keys: KeyItem[], needs?: CheatRow["needs"]) => {
      const t = tuiosRef.current;
      if (!t || busy.current) return;
      busy.current = true;
      t.term.focus();
      if (needs && t.api.state().mode !== needs) {
        t.api.command("mode", needs);
        await sleep(250);
      }
      for (const item of keys) {
        if (typeof item === "string") {
          setSim(new Set(chordParts(item)));
          t.api.input(keyBytes(item));
          await sleep(320);
          setSim(new Set());
        } else {
          for (const ch of item.text) {
            t.api.input(ch);
            await sleep(40);
          }
        }
        await sleep(200);
      }
      busy.current = false;
    },
    [],
  );

  const runLine = useCallback(
    async (line: string) => {
      const t = tuiosRef.current;
      if (!t || busy.current) return;
      const s = t.api.state();
      if (!s.focused || running.current.has(s.focused)) {
        t.api.command("newWindow");
        await sleep(350);
      }
      await play([{ text: line }, "enter"], "terminal");
    },
    [play],
  );

  const allHeld = new Set([...held, ...sim]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-fd-background">
      <header className="flex h-14 shrink-0 items-center gap-4 border-fd-border border-b px-4 md:px-6">
        <Link
          href="/learn"
          onClick={(e) => {
            e.preventDefault();
            onExit();
          }}
          className="flex items-center gap-2 font-mono font-semibold text-sm"
        >
          {/* biome-ignore lint/performance/noImgElement: a static icon in a static export */}
          <img src="/tuios-icon.png" alt="" width={22} height={22} />
          <span>
            learn <span className="text-fd-muted-foreground">/</span>{" "}
            <span className="learn-gradient-text">Free play</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setRun((n) => n + 1)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-fd-muted-foreground text-xs transition-colors hover:bg-fd-accent hover:text-fd-foreground"
          >
            <RotateCcw className="size-3.5" />
            Start over
          </button>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-fd-muted-foreground text-xs transition-colors hover:bg-fd-accent hover:text-fd-foreground"
          >
            <X className="size-3.5" />
            Leave
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-5 lg:flex-row">
        <div className="relative min-h-0 min-w-0 flex-1">
          <LiveTerminal
            key={run}
            className="absolute inset-0"
            onReady={onReady}
            label="tuios, running live. Free play."
          />
        </div>

        <aside className="flex max-h-[46%] shrink-0 flex-col gap-4 overflow-y-auto lg:max-h-none lg:w-[400px]">
          <div className="flex flex-col gap-3 rounded-xl border border-fd-border bg-fd-card p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-fd-muted-foreground text-xs tracking-widest">
                CHEAT SHEET
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-fd-muted-foreground text-xs">
                <Sparkles className="size-3.5 text-[var(--brand-a)]" />
                click a row to try it
              </span>
            </div>
            <ModeBadge state={tstate} />
          </div>

          <div className="rounded-xl border border-fd-border bg-fd-card p-4">
            <p className="font-mono text-fd-muted-foreground text-xs tracking-widest">
              TRY IN THE SHELL
            </p>
            <ul className="mt-2 flex flex-col">
              {shellIdeas.map((idea) => (
                <li key={idea.line}>
                  <button
                    type="button"
                    onClick={() => runLine(idea.line)}
                    className="group flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-fd-accent"
                  >
                    <Play className="size-3.5 shrink-0 text-[#9ece6a] opacity-60 group-hover:opacity-100" />
                    <code className="font-mono text-[#9ece6a] text-xs">
                      {idea.line}
                    </code>
                    <span className="ml-auto text-fd-muted-foreground text-xs">
                      {idea.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {cheatsheet.map((group) => (
            <div
              key={group.title}
              className="rounded-xl border border-fd-border bg-fd-card p-4"
            >
              <p className="font-mono text-fd-muted-foreground text-xs tracking-widest">
                {group.title.toUpperCase()}
              </p>
              <ul className="mt-2 flex flex-col">
                {group.rows.map((row) => (
                  <li key={row.label}>
                    <button
                      type="button"
                      onClick={() => play(row.keys, row.needs)}
                      className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-fd-accent"
                    >
                      <KeySequence items={row.keys} size="sm" held={allHeld} />
                      <span className="ml-auto text-right text-fd-muted-foreground text-xs">
                        {row.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
