"use client";

import "@/app/learn/learn.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { LiveTerminal } from "@/components/learn/live-terminal";
import { runSetup, type TuiosInstance } from "@/lib/learn/runtime";
import type { SetupCommand } from "@/lib/learn/types";
import type { LiveDemoControl } from "./live-demo";

/**
 * The part of <LiveDemo> that loads after the press. learn.css scopes every
 * rule to its own classes, so importing it here styles the stage and nothing
 * else on the page. The variables the stage reads come from .learn-root on
 * /learn, so they are set on the wrapper instead.
 */
export function LiveDemoStage({
  title,
  setup,
  controls,
  hint,
}: {
  title: string;
  setup: SetupCommand[];
  controls: LiveDemoControl[];
  hint?: string;
}) {
  const tuios = useRef<TuiosInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [commands, setCommands] = useState<string[]>([]);
  const stage = useRef<HTMLDivElement | null>(null);

  // The start button is gone once the stage is in, so focus goes to the
  // stage while the engine loads. onReady moves it into the terminal.
  useEffect(() => {
    stage.current?.focus();
  }, []);

  const onReady = useCallback(
    async (t: TuiosInstance) => {
      tuios.current = t;
      await new Promise<void>((resolve) => t.onFirstFrame(resolve));
      setCommands(t.api.commands());
      await runSetup(t, setup);
      setReady(true);
      t.term.focus();
    },
    [setup],
  );

  // An engine built before a command existed ignores it, so a control whose
  // command the engine does not list is left out rather than shown dead.
  const usable = controls.filter((c) => commands.includes(c.command));

  return (
    <div
      style={
        {
          "--learn-term": "#11111b",
          "--brand-a": "#bb9af7",
          "--brand-b": "#7aa2f7",
        } as React.CSSProperties
      }
    >
      <LiveTerminal
        label={`${title}: tuios, running live`}
        fontSize={13}
        onReady={onReady}
        stageRef={stage}
        className="aspect-[16/10] w-full"
      />
      {usable.length > 0 || hint ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {usable.map((c) => (
            <button
              key={c.label}
              type="button"
              disabled={!ready}
              onClick={(e) => {
                tuios.current?.api.command(c.command, ...(c.args ?? []));
                // A click hands the keys to tuios. Enter or space on the
                // button leaves focus on it, so the next button is one tab
                // away instead of three esc presses.
                if (e.detail > 0) tuios.current?.term.focus();
              }}
              className="rounded-full border border-fd-border px-3 py-1 hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-fd-primary focus-visible:outline-offset-2 disabled:opacity-50"
            >
              {c.label}
            </button>
          ))}
          {hint ? (
            <span className="text-fd-muted-foreground">{hint}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
