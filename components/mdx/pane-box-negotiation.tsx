"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Two clients on one session, over one daemon that runs two shells.
 *
 * This is a model of the mechanism, not a capture. The constants are the real
 * ones: the rail is 28 columns on a screen at least 90 wide, 16 from 60 to 89
 * and 3 from 40 to 59 (GetSidebarWidth), and the dock is 2 rows
 * (config.DockHeight). The session's size is the minimum over its clients in
 * both modes, as it has been since b71def75.
 *
 * Old mode is the tree before 8de5a589: each client subtracts its own chrome
 * from the session size and tiles what is left. A client adopts a peer's
 * rectangles and resizes the shells to them, then retiles if the layout sticks
 * out of its box or stops short of its far edges. The near edges were not
 * checked until 97024b2f. A zoom flag stays on the client that zoomed, and only
 * the rectangle travels (fixed in 38cefd4b).
 *
 * New mode is the tree after: every client reports its chrome, the daemon takes
 * the largest reserve on each edge, and every client tiles that one box. A
 * client with less chrome draws a blank band. The zoom flag travels.
 *
 * Borders and gaps are left out, so a shell's size is its pane's rectangle.
 */

type Rail = "left" | "right" | "off";
type Dock = "top" | "bottom";
type Mode = "old" | "new";

interface Cfg {
  size: number;
  rail: Rail;
  dock: Dock;
}
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Res {
  l: number;
  r: number;
  t: number;
  b: number;
}
interface Size {
  w: number;
  h: number;
}

interface Frame {
  rects: Rect[][];
  pty: Size[];
  note: string;
}

interface Sim {
  final: Frame;
  frames: Frame[];
  focus: number;
  /** Old mode: the pane each client has zoomed, on that client alone. */
  zoomLocal: (number | null)[];
  /** New mode: the pane the session has zoomed. */
  zoomShared: number | null;
  last: number;
  total: number;
  lines: string[];
}

const SIZES: Size[] = [
  { w: 80, h: 24 },
  { w: 100, h: 30 },
  { w: 120, h: 36 },
  { w: 150, h: 42 },
];
const DOCK = 2;
const NAMES = ["A", "B"];
const STEP_MS = 900;

function railWidth(renderWidth: number): number {
  if (renderWidth < 40) return 0;
  let w = renderWidth < 60 ? 3 : renderWidth < 90 ? 16 : 28;
  // The pane floor: never leave the panes fewer than 30 columns.
  if (renderWidth - w < 30) {
    if (renderWidth - 16 >= 30) w = 16;
    else if (renderWidth - 3 >= 30) w = 3;
    else return 0;
  }
  return w;
}

interface World {
  eff: Size;
  own: Res[];
  agreed: Res;
  boxes: Rect[];
}

function world(cfgs: Cfg[], mode: Mode): World {
  const eff = {
    w: Math.min(...cfgs.map((c) => SIZES[c.size].w)),
    h: Math.min(...cfgs.map((c) => SIZES[c.size].h)),
  };
  const rw = railWidth(eff.w);
  const own = cfgs.map((c) => ({
    l: c.rail === "left" ? rw : 0,
    r: c.rail === "right" ? rw : 0,
    t: c.dock === "top" ? DOCK : 0,
    b: c.dock === "bottom" ? DOCK : 0,
  }));
  const agreed = {
    l: Math.max(own[0].l, own[1].l),
    r: Math.max(own[0].r, own[1].r),
    t: Math.max(own[0].t, own[1].t),
    b: Math.max(own[0].b, own[1].b),
  };
  const boxOf = (r: Res): Rect => ({
    x: r.l,
    y: r.t,
    w: Math.max(2, eff.w - r.l - r.r),
    h: Math.max(1, eff.h - r.t - r.b),
  });
  const boxes =
    mode === "new" ? [boxOf(agreed), boxOf(agreed)] : own.map(boxOf);
  return { eff, own, agreed, boxes };
}

function tile(box: Rect, zoomed: number | null): Rect[] {
  const w1 = Math.floor(box.w / 2);
  const rects = [
    { x: box.x, y: box.y, w: w1, h: box.h },
    { x: box.x + w1, y: box.y, w: box.w - w1, h: box.h },
  ];
  if (zoomed !== null) rects[zoomed] = { ...box };
  return rects;
}

const copyRects = (r: Rect[]) => r.map((x) => ({ ...x }));
const sameSize = (a: Size, r: Rect) => a.w === r.w && a.h === r.h;

function overlap(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  );
}

/** The staleness check as it stood before 97024b2f, and before zoom was shared. */
function staleOld(rects: Rect[], box: Rect, zoomFlag: boolean): string | null {
  for (const r of rects) {
    if (
      r.x < box.x ||
      r.y < box.y ||
      r.x + r.w > box.x + box.w ||
      r.y + r.h > box.y + box.h
    ) {
      return "They stick out of its own box.";
    }
  }
  if (!zoomFlag && overlap(rects[0], rects[1])) {
    return "One pane covers the box, and nothing on this client says why.";
  }
  const right = Math.max(...rects.map((r) => r.x + r.w));
  const bottom = Math.max(...rects.map((r) => r.y + r.h));
  if (right !== box.x + box.w || bottom !== box.y + box.h) {
    return "They stop short of its own box.";
  }
  return null;
}

function snap(rects: Rect[][], pty: Size[], note: string): Frame {
  return { rects: rects.map(copyRects), pty: pty.map((p) => ({ ...p })), note };
}

function initial(w: World, mode: Mode): Sim {
  const rects = [tile(w.boxes[0], null), tile(w.boxes[1], null)];
  // Both clients retile on a size change. The shells end at the sizes of
  // whichever one got there last; here that is B.
  const pty = rects[1].map((r) => ({ w: r.w, h: r.h }));
  const note =
    mode === "old"
      ? "Each client tiled its own box. The shells took B’s sizes, because B retiled last."
      : "Both clients tiled the one agreed box.";
  const f = snap(rects, pty, note);
  return {
    final: f,
    frames: [f],
    focus: 0,
    zoomLocal: [null, null],
    zoomShared: null,
    last: 0,
    total: 0,
    lines: [],
  };
}

function resizeTo(pty: Size[], rects: Rect[], lines: string[]): number {
  let n = 0;
  rects.forEach((r, i) => {
    if (!sameSize(pty[i], r)) {
      lines.push(`shell ${i + 1}: ${pty[i].w}x${pty[i].h} -> ${r.w}x${r.h}`);
      pty[i] = { w: r.w, h: r.h };
      n++;
    }
  });
  return n;
}

function push(
  s: Sim,
  w: World,
  mode: Mode,
  from: number,
  frames: Frame[],
  lines: string[],
  rects: Rect[][],
  pty: Size[],
): number {
  const peer = 1 - from;
  let n = 0;
  if (mode === "new") {
    rects[peer] = copyRects(rects[from]);
    frames.push(
      snap(
        rects,
        pty,
        `${NAMES[peer]} adopts the rectangles. They fill its box, because it is the same box. No shell changes size.`,
      ),
    );
    return 0;
  }
  const pushed = copyRects(rects[from]);
  rects[peer] = pushed;
  const adopted = resizeTo(pty, pushed, lines);
  n += adopted;
  frames.push(
    snap(
      rects,
      pty,
      adopted
        ? `${NAMES[peer]} adopts ${NAMES[from]}’s rectangles and resizes the shells to them.`
        : `${NAMES[peer]} adopts ${NAMES[from]}’s rectangles.`,
    ),
  );
  const why = staleOld(pushed, w.boxes[peer], s.zoomLocal[peer] !== null);
  if (why) {
    rects[peer] = tile(w.boxes[peer], s.zoomLocal[peer]);
    const back = resizeTo(pty, rects[peer], lines);
    n += back;
    frames.push(
      snap(
        rects,
        pty,
        `${why} ${NAMES[peer]} retiles${back ? " and resizes the shells back" : ""}.`,
      ),
    );
  } else {
    frames.push(
      snap(rects, pty, `They pass ${NAMES[peer]}’s check, so it keeps them.`),
    );
  }
  return n;
}

function keystroke(s: Sim, w: World, mode: Mode, from: number): Sim {
  const rects = s.final.rects.map(copyRects);
  const pty = s.final.pty.map((p) => ({ ...p }));
  const frames: Frame[] = [
    snap(rects, pty, `${NAMES[from]} switches pane and pushes its state.`),
  ];
  const lines: string[] = [];
  const n = push(s, w, mode, from, frames, lines, rects, pty);
  return {
    ...s,
    focus: 1 - s.focus,
    frames,
    final: frames[frames.length - 1],
    last: n,
    total: s.total + n,
    lines,
  };
}

function zoom(s: Sim, w: World, mode: Mode, from: number): Sim {
  const rects = s.final.rects.map(copyRects);
  const pty = s.final.pty.map((p) => ({ ...p }));
  const frames: Frame[] = [];
  const lines: string[] = [];
  let n = 0;
  if (mode === "new") {
    const z = s.zoomShared === null ? s.focus : null;
    rects[0] = tile(w.boxes[0], z);
    rects[1] = tile(w.boxes[1], z);
    n += resizeTo(pty, rects[0], lines);
    frames.push(
      snap(
        rects,
        pty,
        z === null
          ? "The unzoom travels as a flag. Both clients retile the agreed box."
          : "The zoom travels as a flag. Each client computes the zoom box from the agreed box, and the shell is resized once.",
      ),
    );
    return {
      ...s,
      zoomShared: z,
      frames,
      final: frames[frames.length - 1],
      last: n,
      total: s.total + n,
      lines,
    };
  }
  const zoomLocal = [...s.zoomLocal];
  zoomLocal[from] = zoomLocal[from] === null ? s.focus : null;
  rects[from] = tile(w.boxes[from], zoomLocal[from]);
  n += resizeTo(pty, rects[from], lines);
  frames.push(
    snap(
      rects,
      pty,
      zoomLocal[from] === null
        ? `${NAMES[from]} unzooms, retiles and pushes.`
        : `${NAMES[from]} zooms shell ${s.focus + 1}, resizes it to the whole box and pushes. The flag stays on ${NAMES[from]}.`,
    ),
  );
  const next = { ...s, zoomLocal };
  n += push(next, w, mode, from, frames, lines, rects, pty);
  return {
    ...next,
    frames,
    final: frames[frames.length - 1],
    last: n,
    total: s.total + n,
    lines,
  };
}

const HATCH =
  "repeating-linear-gradient(135deg, var(--color-fd-border) 0 1.5px, transparent 1.5px 6px)";
const BAND =
  "repeating-linear-gradient(45deg, color-mix(in oklab, var(--color-fd-primary) 35%, transparent) 0 1.5px, transparent 1.5px 6px)";

function Area({
  r,
  size,
  className,
  style,
  label,
}: {
  r: Rect;
  size: Size;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}) {
  if (r.w <= 0 || r.h <= 0) return null;
  return (
    <div
      className={cn(
        "absolute flex items-center justify-center overflow-hidden",
        className,
      )}
      style={{
        left: `${(r.x / size.w) * 100}%`,
        top: `${(r.y / size.h) * 100}%`,
        width: `${(r.w / size.w) * 100}%`,
        height: `${(r.h / size.h) * 100}%`,
        ...style,
      }}
    >
      {label && r.w >= 6 && r.h >= 2 ? (
        <span className="truncate px-0.5 font-mono text-[10px] leading-none text-fd-muted-foreground">
          {label}
        </span>
      ) : null}
    </div>
  );
}

function Seg<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="m-0 flex items-center gap-2 border-0 p-0">
      <legend className="sr-only">{label}</legend>
      <span className="w-9 text-xs text-fd-muted-foreground" aria-hidden="true">
        {label}
      </span>
      <div className="flex overflow-hidden rounded-md border border-fd-border">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={cn(
              "px-2 py-1 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary",
              value === o
                ? "bg-fd-primary text-fd-primary-foreground"
                : "text-fd-foreground hover:bg-fd-muted/60",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function PaneBoxNegotiation() {
  const [mode, setMode] = useState<Mode>("old");
  const [cfgs, setCfgs] = useState<Cfg[]>([
    { size: 2, rail: "off", dock: "bottom" },
    { size: 1, rail: "left", dock: "bottom" },
  ]);
  const w = useMemo(() => world(cfgs, mode), [cfgs, mode]);
  const [sim, setSim] = useState<Sim>(() => initial(world(cfgs, "old"), "old"));
  const [idx, setIdx] = useState(0);
  const reduce = useRef(false);

  useEffect(() => {
    try {
      reduce.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    } catch {
      reduce.current = false;
    }
  }, []);

  // A setting or the mode changed: both clients retile and the counts restart.
  useEffect(() => {
    setSim(initial(w, mode));
    setIdx(0);
  }, [w, mode]);

  useEffect(() => {
    if (idx >= sim.frames.length - 1) return;
    const t = window.setTimeout(() => setIdx((i) => i + 1), STEP_MS);
    return () => window.clearTimeout(t);
  }, [idx, sim.frames.length]);

  const run = (next: Sim) => {
    setSim(next);
    setIdx(reduce.current ? next.frames.length - 1 : 0);
  };

  const frame = sim.frames[Math.min(idx, sim.frames.length - 1)];
  const done = idx >= sim.frames.length - 1;
  const maxCols = Math.max(...cfgs.map((c) => SIZES[c.size].w));

  const setCfg = (i: number, patch: Partial<Cfg>) =>
    setCfgs((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const zoomedOn = (client: number) =>
    mode === "new" ? sim.zoomShared : sim.zoomLocal[client];

  const screen = (i: number) => {
    const cfg = cfgs[i];
    const size = SIZES[cfg.size];
    const own = w.own[i];
    const { eff, agreed } = w;
    const rects = frame.rects[i];
    const z = zoomedOn(i);
    const order = z === null ? [0, 1] : [1 - z, z];
    const hideUnder = z !== null;

    const bands: Rect[] = [];
    if (mode === "new") {
      const top = own.t;
      const h = eff.h - own.t - own.b;
      if (agreed.l > own.l)
        bands.push({ x: own.l, y: top, w: agreed.l - own.l, h });
      if (agreed.r > own.r)
        bands.push({ x: eff.w - agreed.r, y: top, w: agreed.r - own.r, h });
      const inner = eff.w - agreed.l - agreed.r;
      if (agreed.t > own.t)
        bands.push({ x: agreed.l, y: own.t, w: inner, h: agreed.t - own.t });
      if (agreed.b > own.b)
        bands.push({
          x: agreed.l,
          y: eff.h - agreed.b,
          w: inner,
          h: agreed.b - own.b,
        });
    }

    return (
      <div key={i} className="min-w-0">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="font-mono text-sm text-fd-foreground">
            client {NAMES[i]}{" "}
            <span className="text-fd-muted-foreground">
              {size.w}x{size.h}
            </span>
          </span>
          <span className="font-mono text-[11px] text-fd-muted-foreground">
            own chrome L{own.l} R{own.r} T{own.t} B{own.b}
          </span>
        </div>
        <div style={{ width: `${(size.w / maxCols) * 100}%` }}>
          <div
            className="relative overflow-hidden rounded-sm border border-fd-border bg-fd-background"
            style={{ aspectRatio: `${size.w} / ${size.h * 2}` }}
            role="img"
            aria-label={`Client ${NAMES[i]} screen, ${size.w} by ${size.h}. ${rects
              .map(
                (r, p) =>
                  `Shell ${p + 1} drawn at ${r.w} by ${r.h}, running at ${frame.pty[p].w} by ${frame.pty[p].h}.`,
              )
              .join(" ")}`}
          >
            {size.w > eff.w && (
              <Area
                r={{ x: eff.w, y: 0, w: size.w - eff.w, h: size.h }}
                size={size}
                style={{ backgroundImage: HATCH }}
                label="outside"
              />
            )}
            {size.h > eff.h && (
              <Area
                r={{ x: 0, y: eff.h, w: eff.w, h: size.h - eff.h }}
                size={size}
                style={{ backgroundImage: HATCH }}
                label="outside the session size"
              />
            )}
            {own.l > 0 && (
              <Area
                r={{ x: 0, y: 0, w: own.l, h: eff.h }}
                size={size}
                className="bg-fd-muted"
                label="rail"
              />
            )}
            {own.r > 0 && (
              <Area
                r={{ x: eff.w - own.r, y: 0, w: own.r, h: eff.h }}
                size={size}
                className="bg-fd-muted"
                label="rail"
              />
            )}
            {own.t > 0 && (
              <Area
                r={{ x: own.l, y: 0, w: eff.w - own.l - own.r, h: own.t }}
                size={size}
                className="bg-fd-muted"
                label="dock"
              />
            )}
            {own.b > 0 && (
              <Area
                r={{
                  x: own.l,
                  y: eff.h - own.b,
                  w: eff.w - own.l - own.r,
                  h: own.b,
                }}
                size={size}
                className="bg-fd-muted"
                label="dock"
              />
            )}
            {bands.map((b) => (
              <Area
                key={`band-${b.x}-${b.y}-${b.w}-${b.h}`}
                r={b}
                size={size}
                style={{ backgroundImage: BAND }}
                label="blank"
              />
            ))}
            {order.map((p) => {
              if (hideUnder && p !== z) return null;
              const r = rects[p];
              const bad = !sameSize(frame.pty[p], r);
              return (
                <div
                  key={`pane-${p}`}
                  className={cn(
                    "absolute flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-[2px] border font-mono text-[10px] leading-tight transition-all duration-300 motion-reduce:transition-none",
                    bad
                      ? "border-fd-error bg-fd-error/10 text-fd-error"
                      : sim.focus === p
                        ? "border-fd-primary bg-fd-primary/10 text-fd-foreground"
                        : "border-fd-border bg-fd-muted/50 text-fd-foreground",
                  )}
                  style={{
                    left: `${(r.x / size.w) * 100}%`,
                    top: `${(r.y / size.h) * 100}%`,
                    width: `${(r.w / size.w) * 100}%`,
                    height: `${(r.h / size.h) * 100}%`,
                  }}
                >
                  <span className="truncate px-0.5">
                    {p + 1}: {r.w}x{r.h}
                  </span>
                  {bad && (
                    <span className="truncate px-0.5">
                      runs {frame.pty[p].w}x{frame.pty[p].h}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <span className="w-9 text-xs text-fd-muted-foreground">size</span>
            <select
              value={cfg.size}
              onChange={(e) => setCfg(i, { size: Number(e.target.value) })}
              className="rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs text-fd-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
              aria-label={`Client ${NAMES[i]} terminal size`}
            >
              {SIZES.map((s, k) => (
                <option key={`${s.w}x${s.h}`} value={k}>
                  {s.w}x{s.h}
                </option>
              ))}
            </select>
          </label>
          <Seg
            label="rail"
            value={cfg.rail}
            options={["left", "right", "off"] as Rail[]}
            onChange={(v) => setCfg(i, { rail: v })}
          />
          <Seg
            label="dock"
            value={cfg.dock}
            options={["top", "bottom"] as Dock[]}
            onChange={(v) => setCfg(i, { dock: v })}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => run(keystroke(sim, w, mode, i))}
              className="rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-foreground hover:border-fd-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
            >
              switch pane on {NAMES[i]}
            </button>
            <button
              type="button"
              onClick={() => run(zoom(sim, w, mode, i))}
              aria-pressed={zoomedOn(i) !== null}
              className="rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-foreground hover:border-fd-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
            >
              {zoomedOn(i) !== null ? "unzoom" : "zoom"} on {NAMES[i]}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const edges: { k: keyof Res; name: string }[] = [
    { k: "l", name: "left" },
    { k: "r", name: "right" },
    { k: "t", name: "top" },
    { k: "b", name: "bottom" },
  ];

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-fd-border p-4">
        <Seg
          label="box"
          value={mode === "old" ? "per-client (old)" : "negotiated (new)"}
          options={["per-client (old)", "negotiated (new)"]}
          onChange={(v) => setMode(v.startsWith("per") ? "old" : "new")}
        />
      </div>

      <div className="grid gap-6 p-4 sm:grid-cols-2">{[0, 1].map(screen)}</div>

      <div className="border-t border-fd-border bg-fd-muted/30 p-4 font-mono text-xs">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <span className="text-fd-foreground">daemon</span>
          <span className="text-fd-muted-foreground">
            session {w.eff.w}x{w.eff.h} (smallest client)
          </span>
          {["shell 1", "shell 2"].map((name, k) => (
            <span key={name} className="text-fd-foreground">
              {name}: {frame.pty[k].w}x{frame.pty[k].h}
            </span>
          ))}
        </div>
        <div
          className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1"
          aria-live="polite"
        >
          <span className="text-fd-muted-foreground">PTY resizes</span>
          <span
            className={cn(
              sim.last > 0 && mode === "old"
                ? "text-fd-error"
                : "text-fd-foreground",
            )}
          >
            last action: {done ? sim.last : "…"}
          </span>
          <span className="text-fd-foreground">
            total: {done ? sim.total : "…"}
          </span>
        </div>
        {mode === "new" && (
          <table className="mt-3 border-collapse text-left">
            <caption className="sr-only">
              Chrome each client reports, and the reserve the daemon agrees on
            </caption>
            <thead>
              <tr className="text-fd-muted-foreground">
                <th className="pr-4 font-normal">edge</th>
                <th className="pr-4 font-normal">A</th>
                <th className="pr-4 font-normal">B</th>
                <th className="font-normal">agreed (max)</th>
              </tr>
            </thead>
            <tbody>
              {edges.map(({ k, name }) => (
                <tr key={k}>
                  <td className="pr-4 text-fd-muted-foreground">{name}</td>
                  <td className="pr-4 text-fd-foreground">{w.own[0][k]}</td>
                  <td className="pr-4 text-fd-foreground">{w.own[1][k]}</td>
                  <td className="text-fd-primary">{w.agreed[k]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div
        className="border-t border-fd-border px-4 py-3 text-sm"
        aria-live="polite"
      >
        <ol className="list-decimal space-y-1 pl-5 text-fd-foreground">
          {sim.frames.slice(0, idx + 1).map((f, k) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: an append-only log of one action's steps
            <li key={k}>{f.note}</li>
          ))}
        </ol>
        {done && sim.lines.length > 0 && (
          <div className="mt-2 font-mono text-xs text-fd-muted-foreground">
            {sim.lines.map((l, k) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: an append-only log of one action's resizes
              <div key={k}>{l}</div>
            ))}
          </div>
        )}
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        In the old mode, press <strong>switch pane on A</strong> a few times.
        Every press resizes both shells out to A’s rectangles and back, four
        resizes for a change that moved nothing, and A goes on drawing panes at
        a size the shells do not run at. Press it on B instead and A keeps B’s
        layout without complaint, because the old check only looked at the far
        edges. Then switch to the negotiated box: the count stays at zero, and A
        draws a blank band where B has its rail. For zoom, give both clients the
        same chrome first, then zoom on A in the old mode: the rectangle reaches
        B and the flag does not, so B tiles the zoom away and A is left drawing
        a pane the shell does not run at. Changing a setting retiles both
        clients and restarts the count. This is a model: borders and gaps are
        left out, and the rail and dock sizes are the real defaults.
      </figcaption>
    </figure>
  );
}
