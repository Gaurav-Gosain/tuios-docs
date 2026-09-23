"use client";

import { useEffect, useState } from "react";
import type { Step, Track } from "@/lib/learn/types";
import { KeySequence } from "./keycaps";
import { ModeBadge } from "./mode-badge";

type Sim = {
  panes: number;
  focus: number;
  typing: boolean;
  scattered: boolean;
  zoomed: boolean;
  workspace: number;
  palette: boolean;
  away: boolean;
  text: string[];
};

const START: Sim = {
  panes: 0,
  focus: 0,
  typing: false,
  scattered: false,
  zoomed: false,
  workspace: 1,
  palette: false,
  away: false,
  text: [],
};

const COLORS = [
  "#bb9af7",
  "#7aa2f7",
  "#9ece6a",
  "#7dcfff",
  "#f7768e",
  "#e0af68",
];

type Rect = { x: number; y: number; w: number; h: number };

/** The same spiral the BSP tiler makes, for up to six panes. */
function tiles(n: number): Rect[] {
  const out: Rect[] = [];
  let rest: Rect = { x: 0, y: 0, w: 1, h: 1 };
  for (let i = 0; i < n; i++) {
    if (i === n - 1) {
      out.push(rest);
      break;
    }
    if (i % 2 === 0) {
      out.push({ ...rest, w: rest.w / 2 });
      rest = { ...rest, x: rest.x + rest.w / 2, w: rest.w / 2 };
    } else {
      out.push({ ...rest, h: rest.h / 2 });
      rest = { ...rest, y: rest.y + rest.h / 2, h: rest.h / 2 };
    }
  }
  return out;
}

/** What a step does to the pretend desktop, in two beats: during and after. */
function effect(step: Step, s: Sim): { mid?: Sim; end: Sim } {
  const keys = step.keys.map((k) => (typeof k === "string" ? k : "text"));
  const has = (k: string) => keys.includes(k);
  const last = keys[keys.length - 1];
  if (step.explainer)
    return { mid: { ...s, away: true }, end: { ...s, away: false } };
  if (has("ctrl+p"))
    return { mid: { ...s, palette: true }, end: { ...s, palette: false } };
  if (has("text")) {
    const t = step.keys.find((k) => typeof k !== "string");
    const line = typeof t === "object" ? t.text.trim() : "";
    return {
      end: { ...s, typing: true, text: [...s.text.slice(-3), `$ ${line}`] },
    };
  }
  if (has("z"))
    return { mid: { ...s, zoomed: true }, end: { ...s, zoomed: false } };
  if (last === "t" || last === "space") {
    return { mid: { ...s, scattered: true }, end: { ...s, scattered: false } };
  }
  if (has("w")) {
    const n = Number(last);
    return { end: { ...s, workspace: Number.isFinite(n) ? n : 2 } };
  }
  if (last === "n" || last === "c" || last === "|" || last === "-") {
    const panes = Math.min(6, s.panes + 1);
    return { end: { ...s, panes, focus: panes - 1, workspace: 1 } };
  }
  if (last === "x") {
    const panes = Math.max(1, s.panes - 1);
    return { end: { ...s, panes, focus: Math.min(s.focus, panes - 1) } };
  }
  if (last === "tab" || ["left", "right", "up", "down"].includes(last)) {
    return { end: { ...s, focus: (s.focus + 1) % Math.max(1, s.panes) } };
  }
  if (last === "i") return { end: { ...s, typing: true } };
  if (last === "esc") return { end: { ...s, typing: false } };
  return { end: s };
}

/**
 * A pretend run of a track that plays by itself: the keys press, the desktop
 * reacts. Used where tuios itself does not run, such as on a phone.
 */
export function TrackPreview({ track }: { track: Track }) {
  const [index, setIndex] = useState(0);
  const [pressed, setPressed] = useState(0);
  const [sim, setSim] = useState<Sim>(() => startFor(track));

  useEffect(() => {
    let cancelled = false;
    let s = startFor(track);
    setSim(s);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (!cancelled) {
        s = startFor(track);
        setSim(s);
        for (let i = 0; i < track.steps.length && !cancelled; i++) {
          const step = track.steps[i];
          setIndex(i);
          setPressed(0);
          await wait(700);
          for (let k = 0; k < step.keys.length && !cancelled; k++) {
            setPressed(k + 1);
            await wait(420);
          }
          const { mid, end } = effect(step, s);
          if (mid) {
            setSim(mid);
            await wait(900);
          }
          s = end;
          setSim(s);
          await wait(1300);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [track]);

  const step = track.steps[index];
  const rects = tiles(sim.panes);

  return (
    <div className="flex flex-col gap-3">
      <div className="learn-stage relative aspect-[16/10] overflow-hidden rounded-xl">
        <div className="absolute inset-x-0 top-0 flex h-6 items-center justify-between px-3 font-mono text-[0.6rem] text-white/45">
          <span>
            {[1, 2, 3].map((w) => (
              <span
                key={w}
                className={`mr-1.5 ${w === sim.workspace ? "text-[#bb9af7]" : ""}`}
              >
                {w}
              </span>
            ))}
          </span>
          <span>{sim.typing ? "TYPING" : "WINDOWS"}</span>
        </div>
        <div
          className={`absolute inset-x-2 top-6 bottom-2 transition-opacity duration-500 ${sim.away ? "opacity-15" : ""}`}
        >
          {sim.workspace === 1 ? (
            rects.map((r, i) => {
              const focused = i === sim.focus;
              const zoom = sim.zoomed && focused;
              const hidden = sim.zoomed && !focused;
              const scatter = sim.scattered
                ? { x: 0.04 + i * 0.12, y: 0.05 + i * 0.1, w: 0.55, h: 0.55 }
                : r;
              const rect = zoom ? { x: 0, y: 0, w: 1, h: 1 } : scatter;
              const color = COLORS[i % COLORS.length];
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: panes are fixed slots
                  key={i}
                  className="bsp-pane"
                  data-focus={focused || undefined}
                  style={
                    {
                      left: `${rect.x * 100}%`,
                      top: `${rect.y * 100}%`,
                      width: `${rect.w * 100}%`,
                      height: `${rect.h * 100}%`,
                      opacity: hidden ? 0 : 1,
                      zIndex: focused ? 2 : 1,
                      "--pane": color,
                    } as React.CSSProperties
                  }
                >
                  <div className="p-2 font-mono text-[0.6rem] text-[#cdd6f4] leading-snug">
                    {focused && sim.text.length ? (
                      sim.text.map((t) => <div key={t}>{t}</div>)
                    ) : (
                      <span className="mr-1 text-[#9ece6a]">~ $</span>
                    )}
                    {focused ? (
                      <span className="bsp-cursor !m-0 !h-2.5 !w-1.5" />
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid h-full place-items-center font-mono text-white/40 text-xs">
              workspace {sim.workspace} is empty
            </div>
          )}
          {sim.palette ? (
            <div className="learn-pop absolute top-[18%] left-1/2 z-10 w-3/5 -translate-x-1/2 rounded-lg border border-[#bb9af7]/60 bg-[#1e1e2e] p-2 font-mono text-[0.6rem] text-[#cdd6f4] shadow-2xl">
              <div className="mb-1 text-[#bb9af7]">&gt; command palette</div>
              <div className="text-white/50">new window</div>
              <div className="text-white/50">toggle tiling</div>
            </div>
          ) : null}
          {sim.away ? (
            <div className="learn-pop absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full border border-[#9ece6a]/40 bg-[#9ece6a]/10 px-3 py-1 font-mono text-[#9ece6a] text-[0.6rem]">
              detached, still running
            </div>
          ) : null}
        </div>
      </div>
      <div
        key={step?.id}
        className="learn-fade flex min-h-24 flex-col gap-2 rounded-xl border border-fd-border bg-fd-card p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold font-mono">{step?.title}</p>
          <ModeBadge
            size="sm"
            state={{ mode: sim.typing ? "terminal" : "window", prefix: "" }}
          />
        </div>
        {step ? (
          <KeySequence items={step.keys} size="sm" pressed={pressed} />
        ) : null}
      </div>
    </div>
  );
}

function startFor(track: Track): Sim {
  // Tracks that open a window in their setup start with one.
  return track.setup?.some((c) => "command" in c && c.command === "newWindow")
    ? { ...START, panes: 1, typing: true }
    : START;
}
