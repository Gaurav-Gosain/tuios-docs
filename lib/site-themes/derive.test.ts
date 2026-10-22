import { describe, expect, test } from "bun:test";
import { contrast, ensureContrast, mix } from "./color";
import {
  deriveTheme,
  isDarkGround,
  passes,
  type RawTheme,
  TEXT_RATIO,
  textPairs,
  themeCss,
} from "./derive";
import data from "./themes.json";

const themes = data.themes as RawTheme[];

describe("site themes", () => {
  test("the export holds every theme tuios ships", () => {
    // tools/themes writes them. A drop means the export lost themes.
    expect(themes.length).toBeGreaterThanOrEqual(340);
    const ids = new Set(themes.map((t) => t.id));
    expect(ids.size).toBe(themes.length);
    for (const id of ["catppuccin_mocha", "charmtone", "gruvbox_dark"]) {
      expect(ids.has(id)).toBe(true);
    }
  });

  test("every text colour of every theme reaches 4.5:1", () => {
    const failures: string[] = [];
    for (const raw of themes) {
      const t = deriveTheme(raw);
      for (const [name, c, g] of textPairs(t)) {
        const r = contrast(c, g);
        if (r < TEXT_RATIO)
          failures.push(`${raw.id} ${name} ${c} on ${g}: ${r.toFixed(2)}`);
      }
      expect(passes(t)).toBe(true);
    }
    expect(failures).toEqual([]);
  });

  test("the base follows the luminance of the background", () => {
    expect(isDarkGround("#1e1e2e")).toBe(true);
    expect(isDarkGround("#eff1f5")).toBe(false);
    const latte = themes.find((t) => t.id === "catppuccin_latte");
    expect(latte && deriveTheme(latte).dark).toBe(false);
  });

  test("a colour that already reads is kept", () => {
    expect(ensureContrast("#ffffff", ["#000000"], 4.5)).toBe("#ffffff");
    const yellow = ensureContrast("#df8e1d", ["#eff1f5"], 4.5);
    expect(contrast(yellow, "#eff1f5")).toBeGreaterThanOrEqual(4.5);
    expect(yellow).not.toBe("#df8e1d");
  });

  test("mixing ends at its two colours", () => {
    expect(mix("#123456", "#abcdef", 0)).toBe("#123456");
    expect(mix("#123456", "#abcdef", 1)).toBe("#abcdef");
  });

  test("the style sheet is one rule on the root", () => {
    const css = themeCss(deriveTheme(themes[0]));
    expect(css.startsWith(":root[data-tt]{")).toBe(true);
    expect(css).not.toContain("undefined");
  });
});
