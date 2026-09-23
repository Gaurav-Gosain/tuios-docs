import { describe, expect, test } from "bun:test";
import { type KeyLike, optionAsAlt, pressedNames, sameChord } from "./keys";
import { macOptionBytes } from "./runtime";
import { tracks } from "./tracks";

// A key event the way Chrome on macOS sends Option and a key: key is what
// Option types on a US layout, code is the physical key.
const option = (key: string, code: string, over: Partial<KeyLike> = {}) =>
  ({
    type: "keydown",
    key,
    code,
    altKey: true,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    ...over,
  }) as unknown as KeyboardEvent;

describe("Option on a Mac is Alt", () => {
  test.each([
    ["∆", "KeyJ", "\x1bj"],
    ["˙", "KeyH", "\x1bh"],
    ["Dead", "KeyN", "\x1bn"],
    ["Dead", "KeyE", "\x1be"],
    ["¡", "Digit1", "\x1b1"],
    [" ", "Space", "\x1b "],
    ["≤", "Comma", "\x1b,"],
  ])("key %p on %s sends %p", (key, code, bytes) => {
    expect(optionAsAlt(option(key, code))).toBe(bytes);
    expect(macOptionBytes(option(key, code), true)).toBe(bytes);
  });

  test("shift is kept for a letter", () => {
    expect(optionAsAlt(option("Ô", "KeyJ", { shiftKey: true }))).toBe("\x1bJ");
  });

  test("keys it leaves to the terminal", () => {
    // Named keys already reach tuios with the Alt bit.
    expect(optionAsAlt(option("ArrowLeft", "ArrowLeft"))).toBeNull();
    expect(optionAsAlt(option("Escape", "Escape"))).toBeNull();
    // A shifted digit's character depends on the layout.
    expect(optionAsAlt(option("⁄", "Digit1", { shiftKey: true }))).toBeNull();
    // Not a plain Option chord.
    expect(optionAsAlt(option("j", "KeyJ", { ctrlKey: true }))).toBeNull();
    expect(optionAsAlt(option("j", "KeyJ", { metaKey: true }))).toBeNull();
    expect(optionAsAlt(option("j", "KeyJ", { altKey: false }))).toBeNull();
  });

  test("only on a Mac", () => {
    // AltGr and Alt on other systems type what the reader means.
    expect(macOptionBytes(option("∆", "KeyJ"), false)).toBeNull();
  });

  test("the keycap for the letter lights", () => {
    expect(pressedNames(option("∆", "KeyJ"))).toEqual(
      expect.arrayContaining(["alt", "j"]),
    );
    expect(pressedNames(option("Dead", "KeyN"))).toEqual(
      expect.arrayContaining(["alt", "n"]),
    );
    expect(pressedNames(option("¡", "Digit1"))).toEqual(
      expect.arrayContaining(["alt", "1"]),
    );
    expect(pressedNames(option(" ", "Space"))).toEqual(
      expect.arrayContaining(["alt", "space"]),
    );
    expect(pressedNames(option("Dead", "KeyN"))).not.toContain("dead");
  });

  test("a composed glyph from tuios counts as the alt chord", () => {
    expect(sameChord("alt+∆", "alt+j")).toBe(true);
    expect(sameChord("∆", "alt+j")).toBe(true);
    expect(sameChord("alt+¡", "alt+1")).toBe(true);
    expect(sameChord("alt+∆", "alt+k")).toBe(false);
    expect(sameChord("j", "alt+j")).toBe(false);
  });

  // Every alt chord a track asks for can be pressed with Option: either this
  // file sends it, or it is a named key that already carries the Alt bit.
  test("every alt chord in the tracks", () => {
    const named = new Set([
      "left",
      "right",
      "up",
      "down",
      "esc",
      "enter",
      "tab",
    ]);
    const chords = tracks.flatMap((t) =>
      t.steps.flatMap((s) =>
        (s.keys ?? []).filter(
          (k): k is string => typeof k === "string" && k.startsWith("alt+"),
        ),
      ),
    );
    expect(chords.length).toBeGreaterThan(0);
    for (const chord of chords) {
      const base = chord.slice(4);
      if (named.has(base)) continue;
      const code = /^[a-z]$/.test(base)
        ? `Key${base.toUpperCase()}`
        : /^[0-9]$/.test(base)
          ? `Digit${base}`
          : base === "space"
            ? "Space"
            : "";
      expect(code).not.toBe("");
      expect(optionAsAlt(option("x", code))).toBe(
        `\x1b${base === "space" ? " " : base}`,
      );
    }
  });
});
