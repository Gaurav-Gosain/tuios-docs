import { describe, expect, test } from "bun:test";
import {
  altChordBytes,
  detectMac,
  isAltChord,
  type KeyLike,
  optionAsAlt,
  pressedNames,
  sameChord,
} from "./keys";
import { optionBytes } from "./runtime";
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
    expect(optionBytes(option(key, code), true)).toBe(bytes);
    // The same whether or not the page knows it is on a Mac.
    expect(optionBytes(option(key, code), false)).toBe(bytes);
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

  test("a Mac with its platform hidden or spoofed", () => {
    // Firefox with resistFingerprinting, or a hardened Chromium, can report
    // navigator.platform as "" or "Win32". The composed glyph still says
    // Option was held.
    expect(altChordBytes(option("∆", "KeyJ"), false)).toBe("\x1bj");
    expect(altChordBytes(option("Dead", "KeyN"), false)).toBe("\x1bn");
    expect(altChordBytes(option("Unidentified", "KeyJ"), false)).toBe("\x1bj");
    expect(altChordBytes(option("Ô", "KeyJ", { shiftKey: true }), false)).toBe(
      "\x1bJ",
    );
    // Firefox may report Option as AltGraph too. A US Option glyph still
    // counts.
    expect(
      altChordBytes(
        option("∆", "KeyJ", { getModifierState: (k) => k === "AltGraph" }),
        false,
      ),
    ).toBe("\x1bj");
  });

  test("a browser that leaves code empty", () => {
    // Firefox's remote agent, and possibly a spoofing setting, report
    // code "" for Option+j. The glyph, or keyCode, still names the key.
    expect(altChordBytes(option("∆", ""), false)).toBe("\x1bj");
    expect(altChordBytes(option("∆", "", { keyCode: 0 }), true)).toBe("\x1bj");
    expect(altChordBytes(option("Dead", "", { keyCode: 78 }), true)).toBe(
      "\x1bn",
    );
    expect(altChordBytes(option("x", "", { keyCode: 0 }), true)).toBeNull();
    // A named key with an empty code stays with the terminal.
    expect(altChordBytes(option("ArrowLeft", ""), true)).toBeNull();
  });

  test("alt and a plain letter off a Mac is left to the terminal", () => {
    // Linux and Windows report the letter, and the terminal sends ESC j.
    expect(altChordBytes(option("j", "KeyJ"), false)).toBeNull();
    expect(
      altChordBytes(option("J", "KeyJ", { shiftKey: true }), false),
    ).toBeNull();
    // A German layout: the key labelled Z sits on KeyY. Its letter wins.
    expect(altChordBytes(option("z", "KeyY"), false)).toBeNull();
  });

  test("AltGr keeps typing characters", () => {
    // Windows reports AltGr as ctrl and alt.
    expect(
      altChordBytes(option("€", "KeyE", { ctrlKey: true }), false),
    ).toBeNull();
    expect(
      altChordBytes(option("@", "KeyQ", { ctrlKey: true }), true),
    ).toBeNull();
    // Linux: the AltGraph key itself, and characters typed with it held.
    expect(altChordBytes(option("AltGraph", "AltRight"), false)).toBeNull();
    expect(
      altChordBytes(option("€", "KeyE", { altKey: false }), false),
    ).toBeNull();
    expect(
      altChordBytes(
        option("€", "KeyE", { getModifierState: (k) => k === "AltGraph" }),
        false,
      ),
    ).toBeNull();
  });

  test("detecting a Mac", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0";
    const winUa =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0";
    expect(detectMac({ platform: "MacIntel", userAgent: ua })).toBe(true);
    expect(detectMac({ platform: "", userAgent: ua })).toBe(true);
    expect(detectMac({ platform: "Win32", userAgent: ua })).toBe(true);
    expect(
      detectMac({
        platform: "",
        userAgent: "",
        userAgentData: { platform: "macOS" },
      }),
    ).toBe(true);
    expect(detectMac({ platform: "Win32", userAgent: winUa })).toBe(false);
    expect(
      detectMac({ platform: "Linux x86_64", userAgent: "X11; Linux x86_64" }),
    ).toBe(false);
    expect(detectMac(undefined)).toBe(false);
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

test("isAltChord", () => {
  expect(isAltChord("alt+j")).toBe(true);
  expect(isAltChord("ctrl+alt+x")).toBe(true);
  expect(isAltChord("∆")).toBe(true);
  expect(isAltChord("j")).toBe(false);
  expect(isAltChord("ctrl+b")).toBe(false);
  expect(isAltChord("+")).toBe(false);
});
