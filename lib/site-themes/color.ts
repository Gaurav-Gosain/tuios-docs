/**
 * The colour arithmetic of the site themes: WCAG contrast, and mixing in
 * OKLab so a blend of two colours keeps an even lightness. Plain functions on
 * "#rrggbb" strings, so derive.ts and its test need no browser.
 */

export type RGB = [number, number, number];

export function parseHex(hex: string): RGB {
  const h = hex.replace(/^#/, "");
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

export function toHex([r, g, b]: RGB): string {
  const c = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function linear(v: number): number {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function gamma(v: number): number {
  const s = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
  return s * 255;
}

/** WCAG relative luminance, 0 for black and 1 for white. */
export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio of two colours, from 1 to 21. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

type Lab = [number, number, number];

function toLab(hex: string): Lab {
  const [r, g, b] = parseHex(hex).map(linear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromLab([L, a, b]: Lab): string {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return toHex([
    gamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    gamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    gamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]);
}

/** a blended toward b by t (0 is a, 1 is b), in OKLab. */
export function mix(a: string, b: string, t: number): string {
  const la = toLab(a);
  const lb = toLab(b);
  return fromLab([
    la[0] + (lb[0] - la[0]) * t,
    la[1] + (lb[1] - la[1]) * t,
    la[2] + (lb[2] - la[2]) * t,
  ]);
}

/** The lowest contrast of c against each of the grounds. */
export function minContrast(c: string, grounds: string[]): number {
  return Math.min(...grounds.map((g) => contrast(c, g)));
}

/**
 * c, moved toward white or black just far enough to reach the ratio on every
 * ground. The colour keeps its hue as long as it can. It returns c unchanged
 * when it already passes, and the better of white and black when nothing in
 * between does.
 */
export function ensureContrast(
  c: string,
  grounds: string[],
  ratio: number,
): string {
  if (minContrast(c, grounds) >= ratio) return c;
  let best = c;
  let bestScore = minContrast(c, grounds);
  // Away from the first ground first: white on a dark page, black on a light
  // one. That direction reaches the ratio in the smallest step.
  const targets =
    contrast("#ffffff", grounds[0]) >= contrast("#000000", grounds[0])
      ? ["#ffffff", "#000000"]
      : ["#000000", "#ffffff"];
  for (const target of targets) {
    if (minContrast(target, grounds) < ratio) {
      if (minContrast(target, grounds) > bestScore) {
        best = target;
        bestScore = minContrast(target, grounds);
      }
      continue;
    }
    // Binary search for the smallest step that passes.
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      if (minContrast(mix(c, target, mid), grounds) >= ratio) hi = mid;
      else lo = mid;
    }
    const out = mix(c, target, hi);
    // Rounding to whole channels can land a hair under the ratio.
    const fixed =
      minContrast(out, grounds) >= ratio
        ? out
        : mix(c, target, Math.min(1, hi + 0.01));
    if (minContrast(fixed, grounds) >= ratio) return fixed;
  }
  return best;
}
