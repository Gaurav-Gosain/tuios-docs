"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import { perform, TillyFigure } from "@/components/learn/tilly-figure";
import type {
  TillyController,
  TillyVariant,
} from "@/components/tilly-3d/scene";
import type { TillyMood } from "@/lib/learn/tilly";
import { choose3D, type DeviceHints } from "@/lib/tilly-3d/motion";

/**
 * Tilly in 3D, with the 2D drawing as the placeholder and the fallback.
 *
 * The page renders the SVG figure. Once it has painted, and only when the
 * figure is near the viewport, this loads three.js and the model with a
 * dynamic import, draws the 3D Tilly on a canvas over the figure, and fades
 * between them. The drawing stays when WebGL is missing, the device looks
 * weak, the data saver is on, or the 3D Tilly cannot keep a steady frame rate.
 */

const MODEL_URL = "/tilly/tilly.glb";

type Status = "2d" | "loading" | "3d";

function deviceHints(): DeviceHints {
  let webgl = false;
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2", {
      failIfMajorPerformanceCaveat: true,
    });
    webgl = gl !== null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl = false;
  }
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return {
    webgl,
    cores: nav.hardwareConcurrency,
    memoryGB: nav.deviceMemory,
    saveData: nav.connection?.saveData,
  };
}

const isDark = () => document.documentElement.classList.contains("dark");

const prefersReducedMotion = () => {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
};

/** Runs `fn` after the load event and an idle moment, so it never competes with first paint. */
function afterFirstPaint(fn: () => void): () => void {
  let cancelled = false;
  let idle = 0;
  const run = () => {
    if (cancelled) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    if (w.requestIdleCallback) {
      idle = w.requestIdleCallback(() => !cancelled && fn(), { timeout: 2500 });
    } else {
      idle = window.setTimeout(() => !cancelled && fn(), 400);
    }
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
    const w = window as Window & { cancelIdleCallback?: (id: number) => void };
    w.cancelIdleCallback?.(idle);
    window.clearTimeout(idle);
  };
}

function useTilly3D(
  variant: TillyVariant,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  anchorRef: RefObject<HTMLElement | null>,
): { status: Status; ctrl: RefObject<TillyController | null> } {
  const [status, setStatus] = useState<Status>("2d");
  const ctrl = useRef<TillyController | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const anchor = anchorRef.current;
    if (!canvas || !anchor) return;
    let disposed = false;
    let started = false;
    let visible = false;
    let cancelWait: (() => void) | null = null;
    let weakCheck = 0;
    let greet = 0;

    const sync = () => ctrl.current?.setActive(visible && !document.hidden);

    const fallback = () => {
      ctrl.current?.dispose();
      ctrl.current = null;
      setStatus("2d");
    };

    const load = async () => {
      if (disposed || !choose3D(deviceHints())) return;
      setStatus("loading");
      try {
        const { createTilly } = await import("@/components/tilly-3d/scene");
        if (disposed) return;
        const reducedMotion = prefersReducedMotion();
        const c = await createTilly({
          canvas,
          anchor,
          variant,
          modelUrl: MODEL_URL,
          reducedMotion,
          dark: isDark(),
          onLost: fallback,
        });
        if (disposed) {
          c.dispose();
          return;
        }
        ctrl.current = c;
        setStatus("3d");
        sync();
        if (!reducedMotion) {
          greet = window.setTimeout(
            () => ctrl.current?.play("wave", false),
            450,
          );
          // A device that cannot hold about 16 frames a second gets the drawing.
          weakCheck = window.setTimeout(() => {
            const cost = ctrl.current?.frameCost() ?? 0;
            if (cost > 60) fallback();
          }, 3500);
        }
      } catch {
        fallback();
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible && !started) {
          started = true;
          cancelWait = afterFirstPaint(load);
        }
        sync();
      },
      { rootMargin: "200px" },
    );
    io.observe(anchor);

    const onVisibility = () => sync();
    document.addEventListener("visibilitychange", onVisibility);
    const themes = new MutationObserver(() => ctrl.current?.setDark(isDark()));
    themes.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      disposed = true;
      cancelWait?.();
      window.clearTimeout(weakCheck);
      window.clearTimeout(greet);
      io.disconnect();
      themes.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      ctrl.current?.dispose();
      ctrl.current = null;
    };
  }, [variant, canvasRef, anchorRef]);

  return { status, ctrl };
}

/**
 * The home page hero's Tilly. The box is the drawing's, so the layout does not
 * move; the canvas is larger than the box and hangs over it, leaving room for
 * hops, waves and the head turning.
 */
export function HeroTilly({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const anchor = useRef<HTMLButtonElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const { status, ctrl } = useTilly3D("hero", canvas, anchor);
  const shown = status === "3d";

  return (
    <button
      ref={anchor}
      type="button"
      aria-label="Tilly, the tuios mascot. Press to make Tilly hop."
      onClick={() => {
        if (ctrl.current) ctrl.current.poke();
        else perform(svg.current, "happy");
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") ctrl.current?.setHover(true);
      }}
      onPointerLeave={() => ctrl.current?.setHover(false)}
      className={`relative shrink-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-fd-primary ${className ?? ""}`}
    >
      <TillyFigure
        svgRef={svg}
        title="Tilly"
        className={`size-full transition-opacity duration-500 ${shown ? "opacity-0" : ""}`}
      />
      <canvas
        ref={canvas}
        aria-hidden
        className={`pointer-events-none absolute transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`}
        style={{ left: "-45%", top: "-30%", width: "190%", height: "145%" }}
      />
    </button>
  );
}

const MOODS: { mood: TillyMood; name: string }[] = [
  { mood: "idle", name: "Idle" },
  { mood: "happy", name: "Happy" },
  { mood: "think", name: "Thinking" },
  { mood: "cheer", name: "Cheer" },
  { mood: "wave", name: "Wave" },
];

/**
 * The brand page viewer: a larger Tilly to turn around with the pointer or a
 * finger, and a button for each mood. Without WebGL the buttons drive the 2D
 * figure instead.
 */
export function TillyViewer({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const { status, ctrl } = useTilly3D("viewer", canvas, anchor);
  const [mood, setMood] = useState<TillyMood>("idle");
  const shown = status === "3d";

  const choose = (m: TillyMood) => {
    setMood(m);
    if (ctrl.current) ctrl.current.play(m);
    else perform(svg.current, m);
  };

  return (
    <div className={`flex flex-col gap-3 ${className ?? ""}`}>
      <div className="tilly-stage relative aspect-square select-none w-full overflow-hidden rounded-2xl border border-fd-border">
        <div
          ref={anchor}
          className="pointer-events-none absolute top-[48%] left-1/2 size-[56%] -translate-x-1/2 -translate-y-1/2"
        >
          <TillyFigure
            svgRef={svg}
            mood={mood}
            title={`Tilly, ${MOODS.find((m) => m.mood === mood)?.name.toLowerCase()}`}
            className={`tilly-pose size-full transition-opacity duration-500 ${shown ? "opacity-0" : ""}`}
          />
        </div>
        <canvas
          ref={canvas}
          aria-label={
            shown
              ? "Tilly in 3D. Drag to turn Tilly around, click to say hello."
              : undefined
          }
          aria-hidden={!shown}
          className={`absolute inset-0 size-full cursor-grab transition-opacity duration-500 active:cursor-grabbing ${shown ? "opacity-100" : "pointer-events-none opacity-0"}`}
        />
        <p className="pointer-events-none absolute right-0 bottom-3 left-0 text-center font-mono text-fd-muted-foreground text-xs">
          {shown
            ? "Drag to turn Tilly around. Click Tilly to say hello."
            : status === "loading"
              ? "Loading the 3D Tilly..."
              : "Pick a mood below."}
        </p>
      </div>
      <fieldset className="flex flex-wrap justify-center gap-2">
        <legend className="sr-only">Mood</legend>
        {MOODS.map((m) => (
          <button
            key={m.mood}
            type="button"
            aria-pressed={mood === m.mood}
            onClick={() => choose(m.mood)}
            className="rounded-full border border-fd-border px-3 py-1 font-mono text-fd-muted-foreground text-sm transition-colors hover:border-fd-primary/50 hover:text-fd-foreground aria-pressed:border-fd-primary aria-pressed:bg-fd-primary/10 aria-pressed:text-fd-foreground"
          >
            {m.name}
          </button>
        ))}
      </fieldset>
    </div>
  );
}
