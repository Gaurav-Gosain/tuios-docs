import { describe, expect, test } from "bun:test";
import {
  blinkDelay,
  blinkOpen,
  choose3D,
  damp,
  hopCurve,
  lookAt,
  stepSpring,
} from "./motion";

describe("damp", () => {
  test("moves toward the target and never past it", () => {
    const v = damp(0, 1, 10, 0.016);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(1);
    expect(damp(0, 1, 10, 10)).toBeCloseTo(1, 5);
  });

  test("two half steps equal one full step", () => {
    const one = damp(0, 1, 6, 0.1);
    const two = damp(damp(0, 1, 6, 0.05), 1, 6, 0.05);
    expect(two).toBeCloseTo(one, 10);
  });
});

describe("stepSpring", () => {
  test("settles at the target", () => {
    let s = { x: 1, v: 0 };
    for (let i = 0; i < 600; i++) s = stepSpring(s, 0, 80, 9, 0, 1 / 60);
    expect(Math.abs(s.x)).toBeLessThan(1e-3);
  });

  test("stays stable on a very long frame", () => {
    const s = stepSpring({ x: 1, v: 0 }, 0, 200, 10, 0, 0.5);
    expect(Number.isFinite(s.x)).toBe(true);
    expect(Math.abs(s.x)).toBeLessThan(2);
  });
});

describe("hopCurve", () => {
  test("starts and ends on the ground at rest", () => {
    expect(hopCurve(0)).toEqual({ lift: 0, squash: 1 });
    expect(hopCurve(1)).toEqual({ lift: 0, squash: 1 });
  });

  test("peaks near the middle of the jump", () => {
    const peak = hopCurve(0.49);
    expect(peak.lift).toBeGreaterThan(0.99);
    for (let t = 0; t <= 1; t += 0.01) {
      const h = hopCurve(t);
      expect(h.lift).toBeGreaterThanOrEqual(0);
      expect(h.lift).toBeLessThanOrEqual(1);
      expect(h.squash).toBeGreaterThan(0.85);
      expect(h.squash).toBeLessThan(1.1);
    }
  });

  test("crouches before it jumps", () => {
    expect(hopCurve(0.08).squash).toBeLessThan(0.9);
    expect(hopCurve(0.08).lift).toBe(0);
  });
});

describe("blinks", () => {
  test("wait two to six seconds", () => {
    expect(blinkDelay(0)).toBe(2);
    expect(blinkDelay(1)).toBe(6);
  });

  test("shut and open again", () => {
    expect(blinkOpen(0)).toBe(1);
    expect(blinkOpen(0.072)).toBeCloseTo(0, 5);
    expect(blinkOpen(0.2)).toBe(1);
  });
});

describe("lookAt", () => {
  test("is centred when the pointer is on Tilly", () => {
    expect(lookAt(100, 100, 100, 100, 400)).toEqual({ x: 0, y: 0 });
  });

  test("stays within -1..1 however far the pointer goes", () => {
    const far = lookAt(1e6, -1e6, 0, 0, 400);
    expect(far.x).toBeLessThanOrEqual(1);
    expect(far.y).toBeGreaterThanOrEqual(-1);
    expect(lookAt(200, 0, 0, 0, 400).x).toBeGreaterThan(0.4);
  });
});

describe("choose3D", () => {
  test("needs WebGL", () => {
    expect(choose3D({ webgl: false })).toBe(false);
    expect(choose3D({ webgl: true })).toBe(true);
  });

  test("keeps the drawing on weak devices and with a data saver", () => {
    expect(choose3D({ webgl: true, cores: 2 })).toBe(false);
    expect(choose3D({ webgl: true, memoryGB: 1 })).toBe(false);
    expect(choose3D({ webgl: true, saveData: true })).toBe(false);
    expect(choose3D({ webgl: true, cores: 8, memoryGB: 8 })).toBe(true);
  });
});
