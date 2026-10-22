/**
 * Turns a tuios theme (its background, foreground and sixteen ANSI colours,
 * as tools/themes writes them) into the colours of the site: the Fumadocs
 * tokens, the logo, the code highlighting and the sketch text drawings.
 *
 * Every colour that carries text is held to 4.5:1 on each ground it is drawn
 * on. A colour that falls short is moved toward white or black just far enough
 * (see ensureContrast), so a theme keeps its hues where they already read.
 * derive.test.ts runs every theme through this and checks the result.
 */
import { contrast, ensureContrast, mix } from "./color";

/** One theme as lib/site-themes/themes.json holds it. Hex without '#'. */
export type RawTheme = {
  id: string;
  name: string;
  dark: boolean;
  bg: string;
  fg: string;
  cursor?: string;
  selection?: string;
  ansi: string[];
};

export type SiteTheme = {
  id: string;
  name: string;
  /** From the luminance of the background, not from the theme's own flag. */
  dark: boolean;
  /** CSS custom properties, name to value. */
  vars: Record<string, string>;
};

/** The ratio body text, muted text, links and code must reach. */
export const TEXT_RATIO = 4.5;
/** The ratio of the logo colours, which are graphics rather than text. */
export const MARK_RATIO = 3;

const ANSI = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  purple: 5,
  cyan: 6,
  white: 7,
} as const;

/**
 * The colours shiki's github-light theme writes into the code blocks, and the
 * ANSI hue each one takes in a tuios theme. global.css matches the spans by
 * their --shiki-light value and paints them with --tt-code-<name>.
 */
export const CODE_ROLES = {
  keyword: { shiki: ["D73A49"], ansi: ANSI.purple },
  function: { shiki: ["6F42C1"], ansi: ANSI.blue },
  string: { shiki: ["032F62"], ansi: ANSI.green },
  constant: { shiki: ["005CC5"], ansi: ANSI.yellow },
  variable: { shiki: ["E36209"], ansi: ANSI.red },
  tag: { shiki: ["22863A"], ansi: ANSI.cyan },
  invalid: { shiki: ["B31D28"], ansi: ANSI.red },
} as const;

const hash = (h: string) => (h.startsWith("#") ? h : `#${h}`);

/** Whether a background reads as dark: white text beats black text on it. */
export function isDarkGround(bg: string): boolean {
  return contrast("#ffffff", bg) >= contrast("#000000", bg);
}

/**
 * The site colours of a theme. A background in the middle of the range (Grass
 * is a mid green) leaves little room: a card lightened toward a white
 * foreground can drop the text under 4.5:1. Then the grounds are drawn closer
 * to the background until everything reads.
 */
export function deriveTheme(raw: RawTheme): SiteTheme {
  let theme = derive(raw, 1);
  for (const spread of [0.7, 0.5, 0.3, 0.15]) {
    if (passes(theme)) break;
    theme = derive(raw, spread);
  }
  return theme;
}

function derive(raw: RawTheme, spread: number): SiteTheme {
  const bg = hash(raw.bg);
  const fgRaw = hash(raw.fg);
  const ansi = raw.ansi.map(hash);
  const dark = isDarkGround(bg);

  // The grounds. Each is the background with a little of the foreground in
  // it, so a theme with a pure black page still gets cards that stand out.
  const card = mix(bg, fgRaw, 0.05 * spread);
  const popover = mix(bg, fgRaw, 0.07 * spread);
  const side = mix(bg, fgRaw, 0.12 * spread);
  const accent = mix(bg, fgRaw, 0.13 * spread);
  const border = mix(bg, fgRaw, 0.17);
  const grounds = [bg, card, popover, side, accent];

  // Of a hue's normal and bright entries, the one that stands out more.
  const hue = (i: number) =>
    contrast(ansi[i], bg) >= contrast(ansi[i + 8], bg) ? ansi[i] : ansi[i + 8];
  const text = (c: string, on = grounds) => ensureContrast(c, on, TEXT_RATIO);

  const fg = text(fgRaw);
  const muted = text(mix(fg, bg, 0.32), [bg, card, popover, side]);
  const primary = text(hue(ANSI.purple), [bg, card, side]);
  const primaryFg = [bg, "#000000", "#ffffff"].reduce((a, b) =>
    contrast(a, primary) >= contrast(b, primary) ? a : b,
  );

  const vars: Record<string, string> = {
    "color-scheme": dark ? "dark" : "light",
    "--color-fd-background": bg,
    "--color-fd-foreground": fg,
    "--color-fd-card": card,
    "--color-fd-card-foreground": fg,
    "--color-fd-muted": card,
    "--color-fd-muted-foreground": muted,
    "--color-fd-secondary": card,
    "--color-fd-secondary-foreground": fg,
    "--color-fd-popover": popover,
    "--color-fd-popover-foreground": fg,
    "--color-fd-accent": accent,
    "--color-fd-accent-foreground": fg,
    "--color-fd-border": border,
    "--color-fd-primary": primary,
    "--color-fd-primary-foreground": primaryFg,
    "--color-fd-ring": primary,
    "--tt-side": side,
    "--brand-a": ensureContrast(hue(ANSI.purple), [bg], MARK_RATIO),
    "--brand-b": ensureContrast(hue(ANSI.blue), [bg], MARK_RATIO),
    "--brand-ink": fg,
  };

  // Code blocks sit on the card, and on the background in a few widgets.
  const code = [card, bg];
  for (const [name, role] of Object.entries(CODE_ROLES)) {
    vars[`--tt-code-${name}`] = text(hue(role.ansi), code);
  }
  vars["--tt-code-comment"] = text(ansi[8], code);
  vars["--tt-code-plain"] = text(fg, code);

  // The sketch text drawings: the sixteen as they are, each made legible on
  // the page.
  ansi.forEach((c, i) => {
    vars[`--tt-${i}`] = text(c, [bg]);
  });

  return { id: raw.id, name: raw.name, dark, vars };
}

/** The style sheet that applies a theme. global.css reads the --tt-* names. */
export function themeCss(theme: SiteTheme): string {
  const body = Object.entries(theme.vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  return `:root[data-tt]{${body}}`;
}

/** Eight colours that stand for a theme in the picker. */
export function swatch(raw: RawTheme): string[] {
  return [raw.bg, raw.fg, ...raw.ansi.slice(1, 7)].map(hash);
}

/**
 * Each text colour of a derived theme with the grounds it is drawn on, for
 * the test and for the picker's own check.
 */
export function textPairs(theme: SiteTheme): [string, string, string][] {
  const v = theme.vars;
  const g = [
    v["--color-fd-background"],
    v["--color-fd-card"],
    v["--color-fd-popover"],
    v["--tt-side"],
  ];
  const pairs: [string, string, string][] = [];
  for (const ground of [...g, v["--color-fd-accent"]]) {
    pairs.push(["--color-fd-foreground", v["--color-fd-foreground"], ground]);
  }
  for (const ground of g) {
    pairs.push([
      "--color-fd-muted-foreground",
      v["--color-fd-muted-foreground"],
      ground,
    ]);
  }
  for (const ground of [g[0], g[1], g[3]]) {
    pairs.push(["--color-fd-primary", v["--color-fd-primary"], ground]);
  }
  pairs.push([
    "--color-fd-primary-foreground",
    v["--color-fd-primary-foreground"],
    v["--color-fd-primary"],
  ]);
  for (const name of Object.keys(v).filter((k) => k.startsWith("--tt-code"))) {
    pairs.push([name, v[name], g[0]], [name, v[name], g[1]]);
  }
  for (let i = 0; i < 16; i++) {
    pairs.push([`--tt-${i}`, v[`--tt-${i}`], g[0]]);
  }
  return pairs;
}

/** Whether every text colour of the theme reaches TEXT_RATIO. */
export function passes(theme: SiteTheme): boolean {
  return textPairs(theme).every(([, c, g]) => contrast(c, g) >= TEXT_RATIO);
}
