"use client";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { perform, TillyFigure } from "@/components/learn/tilly-figure";

const STAY_MS = 7000;

/**
 * Tilly looks in from the bottom of the page, waves and says one line. It
 * leaves after a few seconds, on Escape or on the close button. With reduced
 * motion Tilly is just there, with no slide and no wave.
 */
export default function TillyPeek({ onDone }: { onDone: () => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const wave = setTimeout(() => perform(svg.current, "wave"), 450);
    const leave = setTimeout(() => setLeaving(true), STAY_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLeaving(true);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(wave);
      clearTimeout(leave);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const done = setTimeout(onDone, reduce ? 0 : 400);
    return () => clearTimeout(done);
  }, [leaving, onDone]);

  return (
    <div
      className="tilly-peek pointer-events-none fixed bottom-0 left-4 z-50 flex items-end gap-2 sm:left-8"
      data-leaving={leaving || undefined}
    >
      <TillyFigure
        svgRef={svg}
        mood="happy"
        className="h-24 w-auto translate-y-3 drop-shadow-lg sm:h-28"
        title="Tilly"
      />
      {/* biome-ignore lint/a11y/useSemanticElements: output cannot hold the paragraph and the button */}
      <div
        role="status"
        className="pointer-events-auto relative mb-12 max-w-64 rounded-xl border bg-fd-popover px-3 py-2 pe-8 text-sm text-fd-popover-foreground shadow-lg"
      >
        <p>
          Hi, I'm Tilly. You found me, so here is a secret:{" "}
          <kbd className="keycap">Ctrl+B</kbd> shows the keys of this site.
        </p>
        <button
          type="button"
          aria-label="Close"
          onClick={() => setLeaving(true)}
          className="absolute top-1.5 right-1.5 rounded p-1 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
