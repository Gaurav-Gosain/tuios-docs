/**
 * Morphs one sketch drawing into the next, the way `tuios mermaid --watch`
 * does in the terminal (tuios.dev/sketch/raster, motion.go), here on the SVG
 * DOM.
 *
 * Every group with a data-id is an object: a node, an edge, a cluster, a
 * label. pele keeps the ids stable across two drawings of one diagram, so an
 * object keeps its identity when its class and id match. A node moves and
 * resizes from where it was to where it is now (FLIP). An edge's line is
 * resampled to a fixed number of points on both sides and blended point by
 * point, and its arrowheads ride the ends. A new object grows in from 92 %
 * and fades in, and a new edge draws itself. An object that went away fades
 * out where it was, in the old drawing, which stays on top until the motion
 * ends.
 *
 * Everything is measured in screen space, so the motion is right when the
 * drawing changes scale too, and a change that comes mid-motion starts from
 * what is on screen and bends the movement instead of jumping.
 */

type Pt = { x: number; y: number };
type Box = { x0: number; y0: number; x1: number; y1: number };

/** Where an object is on screen. */
export type Pose = { box: Box; line?: Pt[]; opacity: number };

/** What was on screen, by object key. */
export type Snapshot = Map<string, Pose>;

type Obj = {
  key: string;
  cls: string;
  id: string;
  g: SVGGElement;
  edge: boolean;
  main?: SVGGeometryElement;
  marks: { el: SVGGraphicsElement; end: boolean; orig: string | null }[];
  texts: { el: SVGGraphicsElement; orig: string | null; c: Pt }[];
  orig: string | null;
};

/** The points an edge's line is resampled to, as in motion.go. */
const SAMPLES = 48;

/** The length of a motion in ms. The terminal uses 260. */
export const DURATION = 320;

/** A cubic ease out: fast at first, settling gently. */
export function ease(p: number) {
  const q = 1 - Math.min(1, Math.max(0, p));
  return 1 - q * q * q;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * An element's screen CTM as a DOMMatrix. Chrome returns an SVGMatrix, which
 * DOMMatrix.multiply does not take.
 */
function ctm(el: Node | null): DOMMatrix | null {
  const m = (el as SVGGraphicsElement | null)?.getScreenCTM?.();
  return m ? DOMMatrix.fromMatrix(m) : null;
}

/** The objects of a drawing. A group inside another object moves with it. */
function objects(svg: SVGSVGElement): Obj[] {
  const out: Obj[] = [];
  const seen = new Set<string>();
  for (const g of svg.querySelectorAll<SVGGElement>("g[data-id]")) {
    if (g.parentElement?.closest("g[data-id]")) continue;
    const cls = g.getAttribute("class") ?? "";
    const id = g.getAttribute("data-id") ?? "";
    let key = `${cls}\u0000${id}`;
    for (let i = 2; seen.has(key); i++) key = `${cls}\u0000${id}\u0000${i}`;
    seen.add(key);
    const edge = ` ${cls} `.includes(" pele-edge ");
    const o: Obj = {
      key,
      cls,
      id,
      g,
      edge,
      marks: [],
      texts: [],
      orig: g.getAttribute("transform"),
    };
    if (edge) {
      for (const c of g.children) {
        if (!(c instanceof SVGGraphicsElement)) continue;
        if ((c.getAttribute("class") ?? "").includes("pele-marker")) {
          o.marks.push({ el: c, end: true, orig: c.getAttribute("transform") });
        } else if (!o.main && c instanceof SVGGeometryElement) {
          o.main = c;
        }
      }
    } else {
      for (const t of g.querySelectorAll<SVGGraphicsElement>("text")) {
        o.texts.push({
          el: t,
          orig: t.getAttribute("transform"),
          c: center(t),
        });
      }
    }
    out.push(o);
  }
  return out;
}

/** The centre of an element's box in its own user space. */
function center(el: SVGGraphicsElement): Pt {
  try {
    const b = el.getBBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  } catch {
    return { x: 0, y: 0 };
  }
}

function emptyBox(): Box {
  return { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
}

function addRect(b: Box, r: DOMRect) {
  if (r.width === 0 && r.height === 0) return;
  b.x0 = Math.min(b.x0, r.left);
  b.y0 = Math.min(b.y0, r.top);
  b.x1 = Math.max(b.x1, r.right);
  b.y1 = Math.max(b.y1, r.bottom);
}

/** The screen box of an object's shapes, its text left out when it can be. */
function shapesBox(g: SVGGElement): Box {
  const b = emptyBox();
  for (const c of g.querySelectorAll<SVGGraphicsElement>(
    "rect,path,circle,ellipse,polygon,polyline,line",
  )) {
    addRect(b, c.getBoundingClientRect());
  }
  if (b.x1 < b.x0) addRect(b, g.getBoundingClientRect());
  return b;
}

/** An edge's line on screen, resampled to SAMPLES points. */
function lineOf(path: SVGGeometryElement): Pt[] | undefined {
  const m = ctm(path);
  let len = 0;
  try {
    len = path.getTotalLength();
  } catch {
    return undefined;
  }
  if (!m || !(len > 0)) return undefined;
  const out: Pt[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const p = path.getPointAtLength((len * i) / (SAMPLES - 1));
    const q = new DOMPoint(p.x, p.y).matrixTransform(m);
    out.push({ x: q.x, y: q.y });
  }
  return out;
}

/** What a drawing shows now, mid-motion or not. */
export function snapshot(svg: SVGSVGElement | null): Snapshot {
  const snap: Snapshot = new Map();
  if (!svg) return snap;
  for (const o of objects(svg)) {
    const op = Number.parseFloat(o.g.style.opacity || "1");
    const pose: Pose = { box: shapesBox(o.g), opacity: op };
    if (o.edge && o.main) pose.line = lineOf(o.main);
    snap.set(o.key, pose);
  }
  return snap;
}

/** Whether every character of a appears in b, in order. */
function subsequence(a: string, b: string) {
  if (!a) return false;
  let i = 0;
  for (let j = 0; j < b.length && i < a.length; j++) if (a[i] === b[j]) i++;
  return i === a.length;
}

/** The part f of a line, by length. */
function prefix(line: Pt[], f: number): Pt[] {
  if (f >= 1) return line;
  if (f <= 0) return [];
  let total = 0;
  for (let i = 1; i < line.length; i++) total += dist(line[i - 1], line[i]);
  let want = total * f;
  const out = [line[0]];
  for (let i = 1; i < line.length; i++) {
    const d = dist(line[i - 1], line[i]);
    if (d >= want) {
      if (d > 0) out.push(lerpPt(line[i - 1], line[i], want / d));
      return out;
    }
    want -= d;
    out.push(line[i]);
  }
  return out;
}

/** The point at one end of a line and the direction it runs there, outward. */
function lineEnd(line: Pt[], end: boolean): [Pt, Pt] {
  const n = line.length;
  const k = Math.min(3, n - 1);
  const [a, b] = end ? [line[n - 1 - k], line[n - 1]] : [line[k], line[0]];
  return [b, { x: b.x - a.x, y: b.y - a.y }];
}

/** A matrix as an SVG transform. */
function matrixAttr(m: DOMMatrix) {
  const f = (v: number) => (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(5));
  return `matrix(${f(m.a)} ${f(m.b)} ${f(m.c)} ${f(m.d)} ${f(m.e)} ${f(m.f)})`;
}

/**
 * Moves an element by the screen-space transform a. p is the screen CTM of
 * the element's parent; the element's own transform stays after it.
 */
function place(
  el: SVGGraphicsElement,
  a: DOMMatrix,
  p: DOMMatrix,
  orig: string | null,
) {
  const m = p.inverse().multiply(a).multiply(p);
  el.setAttribute(
    "transform",
    orig ? `${matrixAttr(m)} ${orig}` : matrixAttr(m),
  );
}

function restore(el: Element, orig: string | null) {
  if (orig === null) el.removeAttribute("transform");
  else el.setAttribute("transform", orig);
}

type Track = {
  o: Obj;
  from: Pose;
  to: Pose;
  parent: DOMMatrix | null;
  // An edge's line, its original d, and the screen CTM of the path.
  d?: string | null;
  pathCTM?: DOMMatrix | null;
  // The screen CTM of an edge's group, the parent of its arrowheads.
  gCTM?: DOMMatrix | null;
  reveal0: number;
};

/** A motion on screen. stop() ends it at its last frame. */
export type Motion = { stop(): void; done: Promise<void> };

/**
 * Starts the motion from what `from` recorded to the drawing in svg, which is
 * already in the page at its final place. ghosts is the old drawing, on top,
 * with its objects where they were; the motion hides the ones that matched
 * and fades the rest out, then removes it.
 */
export function morph(
  svg: SVGSVGElement,
  from: Snapshot,
  ghosts: SVGSVGElement | null,
  duration = DURATION,
): Motion {
  const objs = objects(svg);
  const oldObjs = ghosts ? objects(ghosts) : [];
  const oldByKey = new Map(oldObjs.map((o) => [o.key, o]));
  const matched = new Set<string>();
  const tracks: Track[] = [];
  const newKeys = new Set(objs.map((o) => o.key));

  // The growth of the drawing, for where a new object comes in from.
  const all = emptyBox();
  for (const p of from.values()) {
    if (p.box.x1 >= p.box.x0) {
      all.x0 = Math.min(all.x0, p.box.x0);
      all.y0 = Math.min(all.y0, p.box.y0);
      all.x1 = Math.max(all.x1, p.box.x1);
      all.y1 = Math.max(all.y1, p.box.y1);
    }
  }

  const loose: { o: Obj; to: Pose }[] = [];
  for (const o of objs) {
    const to: Pose = { box: shapesBox(o.g), opacity: 1 };
    if (o.edge && o.main) to.line = lineOf(o.main);
    const prev = from.get(o.key);
    if (prev && prev.opacity > 0.01) {
      matched.add(o.key);
      tracks.push(track(o, prev, to, 1));
    } else {
      loose.push({ o, to });
    }
  }
  // An object whose id changed while it was typed (I, Id, Ide) takes the pose
  // of an unmatched one of the same class whose id it contains, or that
  // contains it.
  for (const { o, to } of loose) {
    let best = "";
    let bestD = Infinity;
    for (const [key, p] of from) {
      if (matched.has(key) || newKeys.has(key) || p.opacity <= 0.01) continue;
      const [cls, id] = key.split("\u0000");
      if (cls !== o.cls || !(subsequence(id, o.id) || subsequence(o.id, id)))
        continue;
      const d = Math.abs(id.length - o.id.length);
      if (d < bestD) {
        best = key;
        bestD = d;
      }
    }
    const prev = best ? from.get(best) : undefined;
    if (prev) {
      matched.add(best);
      tracks.push(track(o, prev, to, 1));
      continue;
    }
    // A new object: a little smaller and transparent; a new edge draws
    // itself from its start.
    const w = to.box.x1 - to.box.x0;
    const h = to.box.y1 - to.box.y0;
    const cx = (to.box.x0 + to.box.x1) / 2;
    const cy = (to.box.y0 + to.box.y1) / 2;
    const k = 0.92;
    const enter: Pose = o.edge
      ? { box: to.box, line: to.line, opacity: 0 }
      : {
          box: {
            x0: cx - (w * k) / 2,
            y0: cy - (h * k) / 2,
            x1: cx + (w * k) / 2,
            y1: cy + (h * k) / 2,
          },
          opacity: 0,
        };
    tracks.push(track(o, enter, to, o.edge ? 0 : 1));
  }

  // Objects of the old drawing that went on are hidden there: the new
  // drawing shows them. The rest fade out with the old drawing.
  if (ghosts) {
    for (const key of matched) {
      const g = oldByKey.get(key)?.g;
      if (g) g.style.visibility = "hidden";
    }
  }

  function track(o: Obj, f: Pose, t: Pose, reveal: number): Track {
    const parent = ctm(o.g.parentNode);
    const tr: Track = { o, from: f, to: t, parent, reveal0: reveal };
    if (o.edge && o.main) {
      tr.d = o.main.getAttribute("d");
      tr.pathCTM = ctm(o.main);
      tr.gCTM = ctm(o.g);
    }
    return tr;
  }

  function frame(e: number) {
    for (const tr of tracks) {
      const { o, from: f, to: t } = tr;
      const op = lerp(f.opacity, t.opacity, e);
      o.g.style.opacity = op >= 0.999 ? "" : String(op);
      if (o.edge) {
        edgeFrame(tr, e);
        continue;
      }
      if (!tr.parent) continue;
      const tw = t.box.x1 - t.box.x0;
      const th = t.box.y1 - t.box.y0;
      const cw = lerp(f.box.x1 - f.box.x0, tw, e);
      const ch = lerp(f.box.y1 - f.box.y0, th, e);
      const sx = tw > 0.5 ? cw / tw : 1;
      const sy = th > 0.5 ? ch / th : 1;
      const tcx = (t.box.x0 + t.box.x1) / 2;
      const tcy = (t.box.y0 + t.box.y1) / 2;
      const ccx = lerp((f.box.x0 + f.box.x1) / 2, tcx, e);
      const ccy = lerp((f.box.y0 + f.box.y1) / 2, tcy, e);
      const a = new DOMMatrix()
        .translate(ccx, ccy)
        .scale(sx, sy)
        .translate(-tcx, -tcy);
      place(o.g, a, tr.parent, o.orig);
      // Text keeps its shape: it is scaled back about its own centre.
      if (Math.abs(sx - 1) > 1e-3 || Math.abs(sy - 1) > 1e-3) {
        for (const t of o.texts) {
          const m = new DOMMatrix()
            .translate(t.c.x, t.c.y)
            .scale(1 / sx, 1 / sy)
            .translate(-t.c.x, -t.c.y);
          t.el.setAttribute(
            "transform",
            t.orig ? `${matrixAttr(m)} ${t.orig}` : matrixAttr(m),
          );
        }
      } else {
        for (const t of o.texts) restore(t.el, t.orig);
      }
    }
  }

  function edgeFrame(tr: Track, e: number) {
    const { o, from: f, to: t } = tr;
    if (!o.main || !t.line || !tr.pathCTM) return;
    const reveal = lerp(tr.reveal0, 1, e);
    let line =
      f.line && f.line.length === t.line.length
        ? t.line.map((q, i) => lerpPt((f.line as Pt[])[i], q, e))
        : t.line;
    line = prefix(line, reveal);
    const inv = tr.pathCTM.inverse();
    if (line.length >= 2) {
      const pts = line.map((q) => new DOMPoint(q.x, q.y).matrixTransform(inv));
      o.main.setAttribute(
        "d",
        `M${pts.map((q) => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join("L")}`,
      );
    }
    const parent = tr.gCTM;
    for (const mk of o.marks) {
      if (line.length < 2 || !parent) {
        mk.el.style.opacity = "0";
        continue;
      }
      const toLine = t.line;
      // A mark belongs to the end of the line it is nearer to.
      const [at, dir] = lineEnd(line, mk.end);
      const [toAt, toDir] = lineEnd(toLine, mk.end);
      const rot =
        ((Math.atan2(dir.y, dir.x) - Math.atan2(toDir.y, toDir.x)) * 180) /
        Math.PI;
      const a = new DOMMatrix()
        .translate(at.x, at.y)
        .rotate(rot)
        .translate(-toAt.x, -toAt.y);
      place(mk.el, a, parent, mk.orig);
      mk.el.style.opacity =
        reveal < 1 ? String(Math.max(0, (reveal - 0.85) / 0.15)) : "";
    }
  }

  // Which end of its line each arrowhead sits at.
  for (const tr of tracks) {
    if (!tr.o.edge || !tr.to.line) continue;
    const line = tr.to.line;
    for (const mk of tr.o.marks) {
      const r = mk.el.getBoundingClientRect();
      const c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      mk.end = dist(c, line[line.length - 1]) <= dist(c, line[0]);
    }
  }

  function finish() {
    for (const tr of tracks) {
      const o = tr.o;
      o.g.style.opacity = "";
      restore(o.g, o.orig);
      for (const t of o.texts) restore(t.el, t.orig);
      if (o.main && tr.d !== undefined) {
        if (tr.d === null) o.main.removeAttribute("d");
        else o.main.setAttribute("d", tr.d);
      }
      for (const mk of o.marks) {
        restore(mk.el, mk.orig);
        mk.el.style.opacity = "";
      }
    }
    ghosts?.remove();
  }

  let raf = 0;
  let stopped = false;
  let resolveDone: () => void = () => {};
  const done = new Promise<void>((r) => {
    resolveDone = r;
  });
  const start = performance.now();
  frame(0);
  if (ghosts) ghosts.style.opacity = "1";
  const tick = (now: number) => {
    if (stopped) return;
    const p = Math.min(1, (now - start) / duration);
    const e = ease(p);
    if (p >= 1) {
      finish();
      resolveDone();
      return;
    }
    frame(e);
    if (ghosts) ghosts.style.opacity = String(1 - e);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    // Stops where it is: the next motion measures this frame and starts from
    // it. The old drawing goes at once.
    stop() {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      ghosts?.remove();
      resolveDone();
    },
    done,
  };
}
