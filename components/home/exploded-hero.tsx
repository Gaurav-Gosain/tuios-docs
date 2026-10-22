import type { CSSProperties, ReactNode } from "react";
import type { Run, Style } from "@/lib/hero/cells";
import {
  cellSheet,
  dock,
  geometry,
  palettes,
  paneSheets,
  panes,
  probe,
  programs,
  rail,
  type Sheet,
  scratch,
} from "@/lib/hero/scene";
import { ExplodedHeroMotion } from "./exploded-hero-motion";
import "./exploded-hero.css";

/**
 * The exploded view of one real tuios screen. As the page scrolls, the
 * screen comes apart into the layers tuios composes it from, each a sheet at
 * its own depth, and closes again into the one frame.
 *
 * Every glyph is a cell of a real frame (lib/hero/scene.ts). The motion is
 * CSS: each moving part has keyframes on one scroll timeline, the section's
 * (view-timeline). Where the browser has no scroll timelines,
 * ExplodedHeroMotion sets the same animations' time from the scroll position.
 *
 * The keyframes are written here, from one table of states, so the depth of
 * every layer, its focus and its callout stay in step.
 */

// The layers, nearest the reader first.
const LAYERS = [
  { id: "host", z: 18 },
  { id: "chrome", z: 12 },
  { id: "scratch", z: 6.5 },
  { id: "panes", z: 0 },
  { id: "cells", z: -7 },
  { id: "daemon", z: -15 },
] as const;
type LayerId = (typeof LAYERS)[number]["id"];

/** How far the layers above the one in focus rise out of the way, in em. */
const LIFT = 6;
/** The gap between tiled panes, in em: each is its own layer. */
const PANE_STEP = 0.45;

// The timeline, in percent of the section's scroll.
const FLAT_END = 4;
const OPEN = 21;
const BEAT_START = 25;
const BEAT = 9;
const HOLD = 6; // the part of a beat that holds still
const CLOSE_START = BEAT_START + BEAT * LAYERS.length + 1; // 80
const FLAT_AGAIN = 92;

const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

type State = {
  t: number;
  /** -1 flat, -2 open with no focus, else the layer in focus. */
  focus: number;
};

function timeline(): State[] {
  const s: State[] = [
    { t: 0, focus: -1 },
    { t: FLAT_END, focus: -1 },
    { t: OPEN, focus: -2 },
  ];
  LAYERS.forEach((_, k) => {
    const from = BEAT_START + BEAT * k + (BEAT - HOLD) / 2;
    s.push({ t: from, focus: k }, { t: from + HOLD, focus: k });
  });
  s.push(
    { t: CLOSE_START, focus: -2 },
    { t: FLAT_AGAIN, focus: -1 },
    { t: 100, focus: -1 },
  );
  return s;
}

const STATES = timeline();

/** A layer's depth in em, in a state. */
function depth(i: number, focus: number): number {
  if (focus === -1) return 0;
  const lift = focus >= 0 && i < focus ? LIFT : 0;
  return LAYERS[i].z + lift;
}

function focusOpacity(i: number, focus: number): number {
  if (focus < 0) return 1;
  if (i === focus) return 1;
  return i < focus ? 0.1 : 0.72;
}

function focusBlur(i: number, focus: number): number {
  if (focus < 0 || i === focus) return 0;
  return i < focus ? 1.5 : 0.6;
}

const f = (n: number) => Number(n.toFixed(3)).toString();

/**
 * The open pose on a wide screen. exploded-hero.css takes these as its
 * custom properties through POSE_CSS, so the 3D and the projection below
 * cannot disagree.
 */
const POSE = {
  rx: 54,
  rz: -30,
  s: 0.66,
  tx: 0.1,
  ty: 0.02,
  perspective: 224, // em
  originY: 0.4,
};
// The rig in em: 140 columns of 0.6em, 44 rows of 1.32em.
const RIG_W = 84;
const RIG_H = 44 * 1.32;
/** How far a leader runs out from the right edge, in em. */
const RULE = 8;

/**
 * Where a point of a layer lands on the screen, in em from the rig's top
 * left: the same rotate, scale and perspective the browser applies.
 */
function project(x: number, y: number, z: number): [number, number] {
  const rad = Math.PI / 180;
  const cx = RIG_W / 2;
  const cy = RIG_H / 2;
  let px = (x - cx) * POSE.s;
  let py = (y - cy) * POSE.s;
  // scale() is 2D: it leaves depth alone.
  let pz = z;
  // rotateZ, then rotateX, as transform: rotateX() rotateZ() applies them.
  const cz = Math.cos(POSE.rz * rad);
  const sz = Math.sin(POSE.rz * rad);
  [px, py] = [px * cz - py * sz, px * sz + py * cz];
  const cxr = Math.cos(POSE.rx * rad);
  const sxr = Math.sin(POSE.rx * rad);
  [py, pz] = [py * cxr - pz * sxr, py * sxr + pz * cxr];
  px += cx + POSE.tx * RIG_W;
  py += cy + POSE.ty * RIG_H;
  const ox = RIG_W / 2;
  const oy = RIG_H * POSE.originY;
  const k = POSE.perspective / (POSE.perspective - pz);
  return [ox + (px - ox) * k, oy + (py - oy) * k];
}

function labelAt(t: { layer: LayerId; y: number }, focus: number): string {
  const i = LAYERS.findIndex((l) => l.id === t.layer);
  const [x, y] = project(
    RIG_W + 0.8 + RULE,
    t.y * 1.32,
    depth(i, focus === -1 ? -2 : focus),
  );
  return `translate(${f(x)}em,${f(y)}em)`;
}

function keyframes(
  name: string,
  value: (st: State) => string,
  states = STATES,
): string {
  const frames = states.map((st, n) => {
    const next = states[n + 1];
    const moving = next && value(next) !== value(st);
    return `${f(st.t)}%{${value(st)}${moving ? `;animation-timing-function:${EASE}` : ""}}`;
  });
  return `@keyframes ${name}{${frames.join("")}}`;
}

/**
 * A caption is in view through its beat's hold, and fades fast at either
 * end, so two captions are never on the screen together.
 */
function captionKeyframes(id: string, k: number): string {
  const from = BEAT_START + BEAT * k + (BEAT - HOLD) / 2;
  const to = from + HOLD;
  const fade = 1;
  const hidden = (dy: number) => `opacity:0;transform:translateY(${dy}rem)`;
  return (
    `@keyframes xh-cap-${id}{` +
    `0%,${f(from - fade)}%{${hidden(0.6)};animation-timing-function:${EASE}}` +
    `${f(from)}%,${f(to)}%{opacity:1;transform:translateY(0);animation-timing-function:${EASE}}` +
    `${f(to + fade)}%,100%{${hidden(-0.6)}}}`
  );
}

function motionCss(): string {
  const out: string[] = [];

  // The whole stack: flat, then tilted into an axonometric view, then flat.
  out.push(
    `@keyframes xh-rig{` +
      `0%,${FLAT_END}%{transform:translate(0,0) rotateX(0deg) rotateZ(0deg) scale(1);animation-timing-function:${EASE}}` +
      `${OPEN}%{transform:translate(var(--tx),var(--ty)) rotateX(var(--rx)) rotateZ(var(--rz)) scale(var(--s));animation-timing-function:linear}` +
      `${CLOSE_START}%{transform:translate(var(--tx),var(--ty)) rotateX(var(--rx)) rotateZ(var(--rz)) scale(var(--s));animation-timing-function:${EASE}}` +
      `${FLAT_AGAIN}%,100%{transform:translate(0,var(--fty)) rotateX(0deg) rotateZ(0deg) scale(var(--fs))}}`,
  );

  LAYERS.forEach((layer, i) => {
    out.push(
      keyframes(
        `xh-z-${layer.id}`,
        (st) =>
          `transform:translateZ(calc(${f(depth(i, st.focus))}em * var(--zs)))`,
      ),
      keyframes(
        `xh-focus-${layer.id}`,
        (st) =>
          `opacity:${f(focusOpacity(i, st.focus))};filter:blur(${f(focusBlur(i, st.focus))}px)`,
      ),
      keyframes(`xh-label-${layer.id}`, (st) => {
        const tag = TAGS.find((t) => t.layer === layer.id);
        const at = tag ? labelAt(tag, st.focus) : "none";
        // A layer lifted out of the way above the one in focus loses its
        // label with it.
        const o =
          st.focus === -1
            ? 0
            : st.focus === -2
              ? 0.55
              : st.focus === i
                ? 1
                : i < st.focus
                  ? 0
                  : 0.32;
        return `transform:${at};opacity:${o}`;
      }),
      keyframes(`xh-tag-${layer.id}`, (st) => {
        if (st.focus === -1) return "opacity:0";
        if (st.focus === -2) return "opacity:0.55";
        return `opacity:${st.focus === i ? 1 : i < st.focus ? 0 : 0.32}`;
      }),
      captionKeyframes(layer.id, i),
    );
  });

  // Each tiled pane is its own layer, a little above the one before it.
  paneSheets.forEach((_, j) => {
    out.push(
      keyframes(
        `xh-pane-${j}`,
        (st) =>
          `transform:translateZ(${st.focus === -1 ? 0 : f(j * PANE_STEP)}em)`,
      ),
    );
  });

  // In its beat the cell layer comes forward and grows, so the lattice and
  // the marked cell read. It moves toward the middle of the stack.
  const cellsIdx = LAYERS.findIndex((l) => l.id === "cells");
  const r = cellSheet.rect;
  const dx = (geometry.cols / 2 - (r.x + r.w / 2)) * 0.6 * 0.7;
  const dy = (geometry.rows / 2 - (r.y + r.h / 2)) * 1.32 * 0.7;
  out.push(
    keyframes("xh-cells-zoom", (st) =>
      st.focus === cellsIdx
        ? `transform:translate(${f(dx)}em,${f(dy)}em) scale(1.75)`
        : "transform:translate(0em,0em) scale(1)",
    ),
  );

  // The sheets' edges, shadows and glass show only while the stack is apart.
  out.push(
    keyframes("xh-apart", (st) => `opacity:${st.focus === -1 ? 0 : 1}`),
    keyframes("xh-ground", (st) => `opacity:${st.focus === -1 ? 1 : 0.88}`),
  );

  // The PTY lines from each program up to its pane: as long as the gap
  // between the daemon and the panes, which changes as layers lift.
  const panesIdx = LAYERS.findIndex((l) => l.id === "panes");
  const daemonIdx = LAYERS.findIndex((l) => l.id === "daemon");
  const baseGap = LAYERS[panesIdx].z - LAYERS[daemonIdx].z;
  out.push(
    keyframes("xh-pty", (st) => {
      if (st.focus === -1) return "transform:rotateX(90deg) scaleY(0)";
      const gap = depth(panesIdx, st.focus) - depth(daemonIdx, st.focus);
      return `transform:rotateX(90deg) scaleY(${f(gap / baseGap)})`;
    }),
    keyframes("xh-pty-glow", (st) => {
      if (st.focus === -1) return "opacity:0";
      return `opacity:${st.focus === daemonIdx ? 1 : st.focus === -2 ? 0.45 : 0.3}`;
    }),
  );

  // The intro hint leaves as the stack opens. The closing line arrives as it
  // shuts.
  out.push(
    `@keyframes xh-hint{0%,2%{opacity:1}${OPEN - 8}%,100%{opacity:0}}`,
    `@keyframes xh-outro{0%,${FLAT_AGAIN - 4}%{opacity:0;transform:translateY(0.75rem)}${FLAT_AGAIN + 2}%,100%{opacity:1;transform:translateY(0)}}`,
  );

  return out.join("\n");
}

function paletteCss(): string {
  const rule = (prefix: string, s: Style, n: number) => {
    const d: string[] = [];
    if (s.fg) d.push(`color:${s.fg}`);
    if (s.bg) d.push(`background:${s.bg}`);
    if (s.b) d.push("font-weight:700");
    if (s.i) d.push("font-style:italic");
    if (s.f) d.push("opacity:.55");
    if (s.u) d.push(`text-decoration:${s.u}`);
    return d.length ? `.xh .${prefix}${n}{${d.join(";")}}` : "";
  };
  return [
    ...palettes.screen.styles.map((s, n) => rule("a", s, n)),
    ...palettes.tiles.styles.map((s, n) => rule("b", s, n)),
  ].join("");
}

function Rows({ rows, palette }: { rows: Run[][]; palette: "a" | "b" }) {
  return rows.map((runs, y) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: rows are fixed
    <div key={y} className="xh-row">
      {runs.map(([x, text, s]) =>
        s === 0 ? (
          text
        ) : (
          <span key={x} className={`${palette}${s}`}>
            {text}
          </span>
        ),
      )}
    </div>
  ));
}

function rectStyle(r: { x: number; y: number; w: number; h: number }) {
  return {
    "--x": r.x,
    "--y": r.y,
    "--w": r.w,
    "--h": r.h,
  } as CSSProperties;
}

function SheetView({
  sheet,
  className,
  anim,
  children,
}: {
  sheet: Sheet;
  className?: string;
  anim?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`xh-sheet ${className ?? ""}`}
      style={{ ...rectStyle(sheet.rect), animationName: anim }}
      data-anim={anim ? "" : undefined}
    >
      <div className="xh-ground" data-anim="" />
      <div className="xh-text">
        <Rows
          rows={sheet.rows}
          palette={sheet.palette === "screen" ? "a" : "b"}
        />
      </div>
      {children}
      <div className="xh-edge" data-anim="" />
    </div>
  );
}

/** A callout's leader: a hairline out from the layer's right edge. */
function Rule({ layer, y }: { layer: LayerId; y: number }) {
  return (
    <div
      className="xh-tagline"
      data-anim=""
      style={{ "--y": y, animationName: `xh-tag-${layer}` } as CSSProperties}
    />
  );
}

function Plane({ layer, children }: { layer: LayerId; children: ReactNode }) {
  return (
    <div
      className={`xh-plane xh-plane-${layer}`}
      data-anim=""
      style={{ animationName: `xh-z-${layer}` }}
    >
      {children}
    </div>
  );
}

function Focus({ layer, children }: { layer: LayerId; children: ReactNode }) {
  return (
    <div
      className="xh-focus"
      data-anim=""
      style={{ animationName: `xh-focus-${layer}` }}
    >
      {children}
    </div>
  );
}

const CAPTIONS: { layer: LayerId; title: string; body: ReactNode }[] = [
  {
    layer: "host",
    title: "Your terminal",
    body: "tuios runs inside the terminal you already use. It writes one frame to it, like any program.",
  },
  {
    layer: "chrome",
    title: "Chrome",
    body: "The dock and the sidebar are layers too. tuios draws them last, over everything else.",
  },
  {
    layer: "scratch",
    title: "A floating window",
    body: (
      <>
        Press <kbd>Ctrl+B</kbd> <kbd>g</kbd> and a scratch terminal floats over
        the tiles. Press it again and it hides.
      </>
    ),
  },
  {
    layer: "panes",
    title: "Panes",
    body: "Each pane is its own layer, with its border and title. A BSP tree places them side by side.",
  },
  {
    layer: "cells",
    title: "Cells",
    body: probe ? (
      <>
        Each pane has its own terminal emulator and keeps a grid of cells. The
        marked cell holds <code>{probe.char}</code> in <code>{probe.fg}</code>
        {probe.bold ? ", bold" : ""}.
      </>
    ) : (
      "Each pane has its own terminal emulator and keeps a grid of cells."
    ),
  },
  {
    layer: "daemon",
    title: "The daemon",
    body: "The daemon owns every PTY and the programs in them. Close the terminal and they keep running. Attach again later.",
  },
];

const cellRows0 = cellSheet.rect.h;
const TAGS: { layer: LayerId; y: number; title: string; meta: string }[] = [
  { layer: "host", y: 2, title: "Your terminal", meta: "any terminal" },
  { layer: "chrome", y: 9, title: "Dock and sidebar", meta: "z 1000" },
  {
    layer: "scratch",
    y: 18,
    title: "Scratch terminal",
    meta: "floats over the tiles",
  },
  {
    layer: "panes",
    y: 27,
    title: "Panes",
    meta: `${panes.length} layers, z 0 to ${panes.length - 1}`,
  },
  {
    layer: "cells",
    y: 34,
    title: "Cells",
    meta: `${cellSheet.rect.w} × ${cellRows0} in one pane`,
  },
  {
    layer: "daemon",
    y: 42,
    title: "Daemon",
    meta: `${panes.length + 1} PTYs`,
  },
];
const windows = [
  ...panes.map((p) => ({ name: p.title, rect: p.rect })),
  { name: "scratch", rect: geometry.scratch },
];

const POSE_CSS = `.xh{--rx:${POSE.rx}deg;--rz:${POSE.rz}deg;--s:${POSE.s};--tx:${POSE.tx * 100}%;--ty:${POSE.ty * 100}%;--persp:${POSE.perspective}em;--po:${POSE.originY * 100}%}`;

const CSS = `${POSE_CSS}\n${motionCss()}\n${paletteCss()}`;

export function ExplodedHero() {
  return (
    <section className="xh" aria-labelledby="xh-title">
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: generated keyframes, no user input
        dangerouslySetInnerHTML={{ __html: CSS }}
      />
      <div className="xh-track" id="xh-track">
        <div className="xh-stage">
          <div className="xh-scene">
            <figure className="xh-rig" data-anim="" aria-hidden="true">
              <Plane layer="daemon">
                <Focus layer="daemon">
                  <div
                    className="xh-daemon"
                    style={rectStyle({
                      x: 0,
                      y: 0,
                      w: geometry.cols,
                      h: geometry.rows,
                    })}
                  >
                    <div className="xh-edge xh-edge-on" />
                    <p className="xh-daemon-name">
                      tuios daemon{" "}
                      <span>session demo · {windows.length} PTYs</span>
                    </p>
                  </div>
                  {windows.map((w) => (
                    <div
                      key={w.name}
                      className="xh-proc"
                      style={
                        {
                          "--cx": w.rect.x + w.rect.w / 2,
                          "--cy": w.rect.y + w.rect.h / 2,
                        } as CSSProperties
                      }
                    >
                      <span className="xh-proc-name">{programs[w.name]}</span>
                    </div>
                  ))}
                </Focus>
                {windows.map((w) => (
                  <div
                    key={w.name}
                    className="xh-pty"
                    style={
                      {
                        "--cx": w.rect.x + w.rect.w / 2,
                        "--cy": w.rect.y + w.rect.h / 2,
                      } as CSSProperties
                    }
                  >
                    <div
                      className="xh-pty-line"
                      data-anim=""
                      style={{ animationName: "xh-pty, xh-pty-glow" }}
                    />
                  </div>
                ))}
              </Plane>

              <Plane layer="cells">
                <Focus layer="cells">
                  <SheetView
                    sheet={cellSheet}
                    className="xh-cells"
                    anim="xh-cells-zoom"
                  >
                    {probe ? (
                      <div
                        className="xh-probe"
                        style={
                          { "--px": probe.x, "--py": probe.y } as CSSProperties
                        }
                      />
                    ) : null}
                  </SheetView>
                </Focus>
              </Plane>

              <Plane layer="panes">
                {/* No Focus wrapper here: its filter would flatten the
                    panes onto one plane. Each pane takes the focus itself. */}
                {paneSheets.map((sheet, j) => (
                  <SheetView
                    key={sheet.id}
                    sheet={sheet}
                    anim={`xh-pane-${j}, xh-focus-panes`}
                  />
                ))}
              </Plane>

              <Plane layer="scratch">
                <Focus layer="scratch">
                  <SheetView sheet={scratch} />
                </Focus>
              </Plane>

              <Plane layer="chrome">
                <Focus layer="chrome">
                  <SheetView sheet={dock} />
                  <SheetView sheet={rail} />
                </Focus>
              </Plane>

              <Plane layer="host">
                <Focus layer="host">
                  <div className="xh-host" data-anim="" />
                </Focus>
              </Plane>
            </figure>
            {/* The callouts ride a second rig with the same motion, over
                the first. In the first they would stand up through the
                sheets above them and be cut by them. */}
            <div className="xh-rig xh-rig-tags" data-anim="" aria-hidden="true">
              {TAGS.map((t) => (
                <Plane key={t.layer} layer={t.layer}>
                  <Rule layer={t.layer} y={t.y} />
                </Plane>
              ))}
            </div>
            {/* The callouts' names, flat on the page at the end of each
                leader. Text turned in 3D comes out soft, so these are
                placed in 2D, at the leader's end as projected. */}
            <div className="xh-labels" aria-hidden="true">
              {TAGS.map((t) => (
                <div
                  key={t.layer}
                  className="xh-label"
                  data-anim=""
                  style={{
                    animationName: `xh-label-${t.layer}`,
                    transform: labelAt(t, -2),
                  }}
                >
                  <span className="xh-tag-title">{t.title}</span>
                  <span className="xh-tag-meta">{t.meta}</span>
                </div>
              ))}
            </div>
          </div>

          <ol className="xh-captions">
            {CAPTIONS.map((c, i) => (
              <li
                key={c.layer}
                className="xh-caption"
                data-anim=""
                style={{ animationName: `xh-cap-${c.layer}` }}
              >
                <span className="xh-caption-n">
                  {String(i + 1).padStart(2, "0")}
                  <span aria-hidden="true">
                    {" "}
                    / {String(CAPTIONS.length).padStart(2, "0")}
                  </span>
                </span>
                <h3 className="xh-caption-title">{c.title}</h3>
                <p className="xh-caption-body">{c.body}</p>
              </li>
            ))}
          </ol>

          <p className="xh-hint" data-anim="" aria-hidden="true">
            One frame of tuios. Scroll to take it apart.
          </p>

          <div className="xh-outro" data-anim="">
            <h2 id="xh-title" className="xh-outro-title">
              A window manager inside your terminal
            </h2>
            <p className="xh-outro-body">
              Panes, floating windows and chrome, stacked by depth and drawn as
              one frame. The daemon keeps it all running when you close the
              terminal.
            </p>
          </div>
        </div>
      </div>
      <p className="sr-only">
        tuios with four tiled panes and a scratch terminal floating over them:
        nvim on a Go file, a git diff and two agents, with the dock on top and
        the sidebar on the right. The picture comes apart into six layers: the
        host terminal, the dock and sidebar, the scratch terminal, the four
        panes, the cells of one pane, and the daemon that owns the programs.
      </p>
      <ExplodedHeroMotion />
    </section>
  );
}
