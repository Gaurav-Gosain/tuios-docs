/**
 * The small pieces of math behind Tilly's 3D motion, kept apart from three.js
 * so they can be tested: smoothing, a spring, the hop curve, blink timing,
 * the pointer mapped to where Tilly looks, and the choice between the 3D
 * Tilly and the 2D drawing.
 */

/** Frame-rate independent exponential smoothing toward a target. */
export function damp(
  current: number,
  target: number,
  rate: number,
  dt: number,
): number {
  return target + (current - target) * Math.exp(-rate * dt);
}

export const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export type Spring = { x: number; v: number };

/** One step of a damped spring pulled toward `target`, plus a push `force`. */
export function stepSpring(
  s: Spring,
  target: number,
  stiffness: number,
  damping: number,
  force: number,
  dt: number,
): Spring {
  // Small fixed steps keep a stiff spring stable on a slow frame.
  let { x, v } = s;
  const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    const a = -stiffness * (x - target) - damping * v + force;
    v += a * h;
    x += v * h;
  }
  return { x, v };
}

const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * One hop over t = 0..1: a crouch, the jump, the fall and a squash on
 * landing. `lift` is the height as a fraction of the hop, `squash` scales the
 * body's height (below 1 is squashed) and is matched by a wider body.
 */
export function hopCurve(t: number): { lift: number; squash: number } {
  if (t <= 0 || t >= 1) return { lift: 0, squash: 1 };
  if (t < 0.16) {
    return { lift: 0, squash: 1 - 0.12 * Math.sin((t / 0.16) * Math.PI) };
  }
  if (t < 0.82) {
    const u = (t - 0.16) / 0.66;
    const lift = 4 * u * (1 - u);
    // Stretched on the way up and down, round at the top.
    return { lift, squash: 1 + 0.08 * (1 - lift) };
  }
  const u = (t - 0.82) / 0.18;
  return { lift: 0, squash: 1 - 0.1 * Math.sin(u * Math.PI) * (1 - ease(u)) };
}

/** Seconds until the next blink, 2 to 6, from a 0..1 random number. */
export function blinkDelay(r: number): number {
  return 2 + 4 * r;
}

/** Eye openness over a blink of `duration` seconds, `t` seconds in. */
export function blinkOpen(t: number, duration = 0.16): number {
  if (t <= 0 || t >= duration) return 1;
  const u = t / duration;
  return u < 0.45 ? 1 - u / 0.45 : (u - 0.45) / 0.55;
}

/**
 * Where Tilly looks, each in -1..1, for a pointer at (px, py) and Tilly's
 * screen at (cx, cy), in CSS pixels. `reach` is the distance that counts as
 * fully to one side, so a pointer far away does not wrench the head.
 */
export function lookAt(
  px: number,
  py: number,
  cx: number,
  cy: number,
  reach: number,
): { x: number; y: number } {
  const dx = (px - cx) / reach;
  const dy = (py - cy) / reach;
  // Soft limit: tanh keeps the motion smooth as it nears the edge.
  return { x: Math.tanh(dx), y: Math.tanh(dy) };
}

export type DeviceHints = {
  webgl: boolean;
  cores?: number;
  memoryGB?: number;
  saveData?: boolean;
};

/**
 * Whether to show the 3D Tilly. The 2D drawing stays for no WebGL, a data
 * saver, and devices with few cores or little memory, where three.js would
 * cost more than it gives.
 */
export function choose3D(h: DeviceHints): boolean {
  if (!h.webgl || h.saveData) return false;
  if (h.cores !== undefined && h.cores > 0 && h.cores < 4) return false;
  if (h.memoryGB !== undefined && h.memoryGB > 0 && h.memoryGB < 2) {
    return false;
  }
  return true;
}
