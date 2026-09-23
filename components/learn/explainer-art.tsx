"use client";

import { Laptop, Server } from "lucide-react";
import type { Explainer } from "@/lib/learn/types";

const PANE_COLORS = ["#bb9af7", "#7aa2f7", "#9ece6a"];

const FRAME =
  "flex h-36 items-center justify-center rounded-lg border border-fd-border bg-[#0b0b13]";

function AgentBox({
  color,
  name,
  badge,
}: {
  color: string;
  name: string;
  badge?: string;
}) {
  return (
    <div
      className="relative flex h-16 w-20 flex-col justify-between rounded-md border p-2"
      style={{ borderColor: color }}
    >
      <span className="text-white/60">agent</span>
      <span style={{ color }}>{name}</span>
      {badge ? (
        <span className="ex-dot absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-[#e0af68] text-[0.55rem] text-[#11111b]">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function MiniDesktop({ className = "" }: { className?: string }) {
  return (
    <div
      className={`grid h-full w-full grid-cols-2 grid-rows-2 gap-1 rounded-md border border-white/10 bg-[#11111b] p-1 ${className}`}
    >
      {PANE_COLORS.map((c, i) => (
        <div
          key={c}
          className={`rounded-[4px] border ${i === 0 ? "row-span-2" : ""}`}
          style={{ borderColor: c, background: `${c}14` }}
        >
          <div
            className="mt-1.5 ml-1.5 h-1 w-1/2 rounded-full"
            style={{ background: `${c}66` }}
          />
          <div
            className="mt-1 ml-1.5 h-1 w-1/3 rounded-full"
            style={{ background: `${c}44` }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Short looping pictures for what a browser tab cannot run. They say the
 * same thing as the text beside them, so they are hidden from screen readers.
 */
export function ExplainerArt({ art }: { art: Explainer["art"] }) {
  if (art === "detach") {
    return (
      <div
        aria-hidden
        className="relative h-36 overflow-hidden rounded-lg border border-fd-border bg-[#0b0b13]"
      >
        <div className="ex-detach-panes absolute top-4 left-1/2 h-20 w-36 -translate-x-1/2">
          <MiniDesktop />
        </div>
        <div className="ex-detach-daemon absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#9ece6a]/40 bg-[#9ece6a]/10 px-2.5 py-1 font-mono text-[#9ece6a] text-[0.65rem]">
          <span className="size-1.5 rounded-full bg-[#9ece6a]" />
          daemon: 3 windows running
        </div>
        <div className="absolute top-2 left-3 font-mono text-[0.65rem] text-white/50">
          <span className="ex-detach-on">attached</span>
          <span className="ex-detach-off absolute left-0">detached</span>
        </div>
      </div>
    );
  }
  if (art === "clients") {
    return (
      <div
        aria-hidden
        className="flex h-36 items-center justify-center gap-6 rounded-lg border border-fd-border bg-[#0b0b13]"
      >
        <div className="h-20 w-32">
          <MiniDesktop />
        </div>
        <div className="ex-sync font-mono text-[#bb9af7] text-xs">⇄</div>
        <div className="h-20 w-32">
          <MiniDesktop />
        </div>
      </div>
    );
  }
  if (art === "mail") {
    return (
      <div aria-hidden className={FRAME}>
        <div className="flex items-center gap-5 font-mono text-[0.65rem] text-[#cdd6f4]">
          <AgentBox color="#bb9af7" name="review" />
          <div className="relative h-0.5 w-20 overflow-hidden rounded bg-white/10">
            <div className="ex-packet absolute -top-1.5 flex h-3.5 w-5 items-center justify-center rounded-sm bg-[#e0af68] text-[0.5rem] text-[#11111b]">
              @
            </div>
          </div>
          <AgentBox color="#7aa2f7" name="tests" badge="1" />
        </div>
      </div>
    );
  }
  if (art === "fanout" || art === "worktree") {
    const branches =
      art === "fanout"
        ? ["fan/dark-mode", "fan/dark-mode-2", "fan/dark-mode-3"]
        : ["main", "feat/retry", "fix/login"];
    return (
      <div aria-hidden className={FRAME}>
        <div className="flex items-center gap-4 font-mono text-[0.6rem] text-[#cdd6f4]">
          <div className="rounded-md border border-[#bb9af7]/60 bg-[#bb9af7]/10 px-2 py-1.5 text-[#bb9af7]">
            {art === "fanout" ? "one prompt" : "one repo"}
          </div>
          <div className="flex flex-col gap-1.5">
            {branches.map((b, i) => (
              <div
                key={b}
                className="ex-pop flex items-center gap-1.5 rounded-md border border-white/15 px-2 py-1"
                style={{ animationDelay: `${i * 0.35}s` }}
              >
                <span
                  className="ex-dot size-1.5 rounded-full"
                  style={{ background: PANE_COLORS[i] }}
                />
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (art === "protocol" || art === "hooks") {
    const lines =
      art === "protocol"
        ? [
            '{"verb":"new-window"}',
            '{"ok":true,"id":"a1f3"}',
            '{"verb":"send-text"}',
            '{"verb":"wait-for"}',
            '{"ok":true,"exit":0}',
            '{"verb":"capture-pane"}',
          ]
        : [
            "after-new-window",
            "  notify-send 'hi'",
            "after-agent-state",
            "  ~/bin/ping-phone.sh",
            "after-focus-change",
            "  echo moved >> log",
          ];
    return (
      <div aria-hidden className={`${FRAME} overflow-hidden`}>
        <div className="h-24 w-56 overflow-hidden font-mono text-[0.65rem] leading-5">
          <div className="ex-scroll">
            {[...lines, ...lines].map((line, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: the list repeats on purpose
                key={i}
                className={
                  line.startsWith(" ") || line.startsWith('{"ok')
                    ? "text-[#9ece6a]"
                    : "text-[#7aa2f7]"
                }
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (art === "remote") {
    return (
      <div
        aria-hidden
        className="flex h-36 items-center justify-center gap-5 rounded-lg border border-fd-border bg-[#0b0b13] text-[#cdd6f4]"
      >
        <Laptop className="size-10 text-[#bb9af7]" />
        <div className="relative h-0.5 w-24 overflow-hidden rounded bg-white/10">
          <div className="ex-packet absolute top-0 h-0.5 w-6 rounded bg-[#7aa2f7]" />
        </div>
        <Server className="size-10 text-[#7aa2f7]" />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="flex h-36 items-center justify-center gap-3 rounded-lg border border-fd-border bg-[#0b0b13] font-mono text-[0.7rem] text-[#cdd6f4]"
    >
      {[
        ["#9ece6a", "working"],
        ["#e0af68", "needs you"],
        ["#7aa2f7", "idle"],
      ].map(([c, t]) => (
        <div
          key={t}
          className="flex h-20 w-24 flex-col justify-between rounded-md border p-2"
          style={{ borderColor: c }}
        >
          <span className="text-white/60">agent</span>
          <span className="flex items-center gap-1.5" style={{ color: c }}>
            <span
              className="ex-dot size-1.5 rounded-full"
              style={{ background: c }}
            />
            {t}
          </span>
        </div>
      ))}
    </div>
  );
}
