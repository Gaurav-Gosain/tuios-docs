"use client";

import { useRef } from "react";
import { perform, TillyFigure } from "@/components/learn/tilly-figure";
import type { TillyMood } from "@/lib/learn/tilly";

const MOODS: { mood: TillyMood; name: string; use: string }[] = [
  {
    mood: "idle",
    name: "Idle",
    use: "Resting: a slow bob, a blink, and a focus border that moves between the panes.",
  },
  {
    mood: "happy",
    name: "Happy",
    use: "A small bounce with smiling eyes, for a step done right.",
  },
  {
    mood: "think",
    name: "Thinking",
    use: "Tilted, eyes up, for a hint or a pause.",
  },
  {
    mood: "cheer",
    name: "Cheer",
    use: "A jump with both arms up, for finishing something.",
  },
  {
    mood: "wave",
    name: "Wave",
    use: "A raised hand, for hello and goodbye.",
  },
];

// The wave is a move, not a pose, on the Learn page. Here it is held so the
// still figure shows it.
const POSE_CSS =
  ".tilly.tilly-pose[data-mood=wave] [data-part=arm-right]{transform:translate(6px,-24px) rotate(-12deg)}";

function Mood({ mood, name, use }: (typeof MOODS)[number]) {
  const svg = useRef<SVGSVGElement>(null);
  return (
    <li className="flex flex-col rounded-xl border border-fd-border bg-fd-card">
      <button
        type="button"
        onClick={() => perform(svg.current, mood)}
        aria-label={`Play Tilly's ${name.toLowerCase()} move`}
        className="group flex items-center justify-center rounded-t-xl bg-[#1e1e2e] px-4 pt-6 pb-4 focus-visible:outline-2 focus-visible:outline-fd-primary"
      >
        <TillyFigure
          svgRef={svg}
          mood={mood}
          className="tilly-pose size-24 transition-transform group-hover:-translate-y-0.5 sm:size-28"
          title={`Tilly, ${name.toLowerCase()}`}
        />
      </button>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="font-medium font-mono text-fd-foreground text-sm">
          {name}
          <code className="ml-2 font-normal text-fd-muted-foreground text-xs">
            {mood}
          </code>
        </p>
        <p className="text-fd-muted-foreground text-sm leading-relaxed">
          {use}
        </p>
      </div>
    </li>
  );
}

/** Tilly large, then each mood as a card that plays its move on click. */
export function TillyMoods() {
  return (
    <>
      <style>{POSE_CSS}</style>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {MOODS.map((item) => (
          <Mood key={item.mood} {...item} />
        ))}
      </ul>
    </>
  );
}

/** Tilly at the size of an illustration, resting. */
export function TillyLarge({ className }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  return (
    <button
      type="button"
      onClick={() => perform(svg.current, "cheer")}
      aria-label="Make Tilly cheer"
      className="rounded-2xl focus-visible:outline-2 focus-visible:outline-fd-primary"
    >
      <TillyFigure svgRef={svg} className={className} />
    </button>
  );
}
