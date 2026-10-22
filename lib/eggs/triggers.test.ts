import { describe, expect, test } from "bun:test";
import { KONAMI, keySequences, quickClicks } from "./triggers";

const feedAll = (keys: string[]) => {
  const m = keySequences();
  return keys.map((k) => m.feed(k));
};

describe("Tilly triggers", () => {
  test("typing tilly brings Tilly on the last letter", () => {
    expect(feedAll([..."tilly"])).toEqual([false, false, false, false, true]);
  });

  test("tilly matches inside other typing and in capitals", () => {
    expect(feedAll([..."hey Tilly"]).at(-1)).toBe(true);
  });

  test("a near miss does not", () => {
    expect(feedAll([..."tily"]).some(Boolean)).toBe(false);
    expect(feedAll([..."tillx"]).some(Boolean)).toBe(false);
  });

  test("the Konami code still works", () => {
    expect(feedAll(KONAMI).at(-1)).toBe(true);
    expect(feedAll(KONAMI.slice(1)).some(Boolean)).toBe(false);
  });

  test("a match is forgotten, so one more key does not match again", () => {
    const m = keySequences();
    for (const k of "tilly") m.feed(k);
    expect(m.feed("y")).toBe(false);
  });

  test("three clicks within a second bring Tilly", () => {
    const c = quickClicks();
    expect([c.click(0), c.click(300), c.click(700)]).toEqual([
      false,
      false,
      true,
    ]);
  });

  test("a single click, or clicks spread out, do not", () => {
    const c = quickClicks();
    expect(c.click(0)).toBe(false);
    expect(c.click(900)).toBe(false);
    expect(c.click(1950)).toBe(false);
    expect(c.click(5000)).toBe(false);
  });

  test("after a match the count starts again", () => {
    const c = quickClicks();
    c.click(0);
    c.click(100);
    expect(c.click(200)).toBe(true);
    expect(c.click(300)).toBe(false);
  });
});
