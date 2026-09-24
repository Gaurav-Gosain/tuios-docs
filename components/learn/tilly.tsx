"use client";

import {
  MessageCircle,
  MessageCircleOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { memo, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  armAudio,
  getPrefs,
  getServerPrefs,
  setPrefs,
  subscribePrefs,
} from "@/lib/learn/sound";
import type { TillyMood, TillyScript } from "@/lib/learn/tilly";
import {
  getSaid,
  getServerSaid,
  type Said,
  say,
  subscribeSaid,
} from "@/lib/learn/tilly-store";
import { perform, TillyFigure } from "./tilly-figure";

export function usePrefs() {
  return useSyncExternalStore(subscribePrefs, getPrefs, getServerPrefs);
}

function useSaid() {
  return useSyncExternalStore(subscribeSaid, getSaid, getServerSaid);
}

/** How long a mood lasts before Tilly goes back to the idle bob, in ms. */
const MOOD_MS: Record<TillyMood, number> = {
  idle: 0,
  happy: 1400,
  wave: 1800,
  think: 2600,
  cheer: 3600,
};

/** How long the bubble stays up: long enough to read, then out of the way. */
function bubbleMs(said: Said) {
  const read = 2600 + said.text.length * 55;
  return said.mood === "think" || said.mood === "cheer"
    ? Math.max(read, 9000)
    : read;
}

/**
 * Tilly beside the step card, with a speech bubble. The lesson makes Tilly
 * talk through lib/learn/tilly-store, so nothing here re-renders the lesson
 * or the terminal. `panel` is the larger, still Tilly on the finish panel.
 */
export const TillyGuide = memo(function TillyGuide({
  script,
  variant = "lesson",
  className = "",
}: {
  script?: TillyScript;
  variant?: "lesson" | "panel";
  className?: string;
}) {
  const prefs = usePrefs();
  const said = useSaid();
  const svg = useRef<SVGSVGElement>(null);
  const [mood, setMood] = useState<TillyMood>("idle");
  const [open, setOpen] = useState(false);
  const panel = variant === "panel";

  useEffect(() => {
    if (!said) {
      setOpen(false);
      setMood("idle");
      return;
    }
    setOpen(true);
    setMood(said.mood);
    // Wait a frame so the mood's CSS is on before the move starts.
    const raf = requestAnimationFrame(() => perform(svg.current, said.mood));
    const calm = MOOD_MS[said.mood]
      ? setTimeout(() => setMood("idle"), MOOD_MS[said.mood])
      : undefined;
    const quiet = panel
      ? undefined
      : setTimeout(() => setOpen(false), bubbleMs(said));
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(calm);
      clearTimeout(quiet);
    };
  }, [said, panel]);

  if (prefs.tillyHidden) return null;

  const poke = () => {
    if (script) say(script.poke());
  };

  return (
    <div
      className={`flex items-end gap-2 ${
        panel ? "" : "flex-row lg:flex-row-reverse lg:gap-1"
      } ${className}`}
    >
      <button
        type="button"
        onClick={poke}
        onMouseDown={(e) => e.preventDefault()}
        disabled={!script}
        title="Tilly"
        aria-label="Tilly, the tuios mascot. Click to say hi."
        className={`shrink-0 rounded-lg transition-transform focus-visible:outline-2 focus-visible:outline-[var(--brand-a)] enabled:hover:-translate-y-0.5 ${
          panel ? "size-20" : "size-12 lg:size-28"
        }`}
      >
        <TillyFigure
          svgRef={svg}
          mood={mood}
          className="size-full"
          title="Tilly"
        />
      </button>
      <output
        aria-live="polite"
        className={`relative block min-w-0 flex-1 transition-[opacity,transform] duration-300 ${
          open && said
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0"
        } ${panel ? "" : "lg:mb-10"}`}
      >
        {said ? (
          <p
            key={said.id}
            className={`tilly-bubble rounded-xl border border-fd-border bg-fd-card px-3 py-2 text-fd-foreground leading-snug shadow-md ${
              panel ? "text-base" : "text-[0.8rem] lg:text-sm"
            }`}
            data-side={panel ? "left" : undefined}
          >
            {said.text}
          </p>
        ) : null}
      </output>
    </div>
  );
});

/**
 * The mute and hide-Tilly switches for the lesson header. Both are
 * remembered. It also arms the audio for the reader's first key or click.
 */
export function TillyControls() {
  const prefs = usePrefs();
  useEffect(() => armAudio(), []);
  const btn =
    "inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground";
  return (
    <>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setPrefs({ muted: !prefs.muted })}
        aria-pressed={prefs.muted}
        aria-label={prefs.muted ? "Turn sounds on" : "Mute sounds"}
        title={prefs.muted ? "Sounds off" : "Sounds on"}
        className={btn}
      >
        {prefs.muted ? (
          <VolumeX className="size-4" />
        ) : (
          <Volume2 className="size-4" />
        )}
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setPrefs({ tillyHidden: !prefs.tillyHidden })}
        aria-pressed={prefs.tillyHidden}
        aria-label={prefs.tillyHidden ? "Show Tilly" : "Hide Tilly"}
        title={prefs.tillyHidden ? "Show Tilly" : "Hide Tilly"}
        className={btn}
      >
        {prefs.tillyHidden ? (
          <MessageCircleOff className="size-4" />
        ) : (
          <MessageCircle className="size-4" />
        )}
      </button>
    </>
  );
}
