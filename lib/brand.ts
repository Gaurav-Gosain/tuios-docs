/**
 * What the brand page lists: the tagline, the colours, the downloads and the
 * terms for using the logo and Tilly. The page, its markdown twin and the
 * brand kit zip all read from here, so they cannot list different files.
 */
import { absoluteUrl, site } from "./site";

export const tagline =
  "A terminal window manager that knows what your agents are doing.";

/** The path of the zip that holds every file in the kit. */
export const kitPath = "/brand/tuios-brand-kit.zip";

export type Swatch = { name: string; hex: string; note?: string };
export type SwatchGroup = { title: string; blurb: string; swatches: Swatch[] };

export const palette: SwatchGroup[] = [
  {
    title: "Accent",
    blurb:
      "Mauve is the tuios colour. Use the Mocha value on dark backgrounds and the Latte value on light ones.",
    swatches: [
      { name: "Mauve (Mocha)", hex: "#cba6f7", note: "Accent on dark" },
      { name: "Mauve (Latte)", hex: "#8839ef", note: "Accent on light" },
    ],
  },
  {
    title: "Mocha, for dark backgrounds",
    blurb: "The dark logo files, the social preview and the dark banner.",
    swatches: [
      { name: "Crust", hex: "#11111b", note: "Deepest background" },
      { name: "Base", hex: "#1e1e2e", note: "Background" },
      { name: "Surface 0", hex: "#313244", note: "Cards and panes" },
      { name: "Text", hex: "#cdd6f4", note: "Wordmark on dark" },
      { name: "Subtext 0", hex: "#a6adc8", note: "Secondary text" },
      { name: "Blue", hex: "#89b4fa", note: "Second accent" },
    ],
  },
  {
    title: "Latte, for light backgrounds",
    blurb:
      "The light logo files and the light banner. The wordmark on light is Mocha Base, for more contrast than Latte Text.",
    swatches: [
      { name: "Base", hex: "#eff1f5", note: "Background" },
      { name: "Mantle", hex: "#e6e9ef", note: "Cards and panes" },
      { name: "Crust", hex: "#dce0e8", note: "Borders" },
      { name: "Text", hex: "#4c4f69", note: "Body text" },
      { name: "Wordmark", hex: "#1e1e2e", note: "Wordmark on light" },
      { name: "Blue", hex: "#1e66f5", note: "Second accent" },
    ],
  },
  {
    title: "Tilly",
    blurb:
      "Tilly keeps these colours on every background, dark or light. Only the page around Tilly changes.",
    swatches: [
      { name: "Shell", hex: "#cba6f7" },
      { name: "Shell highlight", hex: "#e5cffc" },
      { name: "Shell shade", hex: "#a987ea" },
      { name: "Feet", hex: "#8062cf" },
      { name: "Outline and screen", hex: "#11111b" },
      { name: "Pane", hex: "#262637" },
      { name: "Pane edge", hex: "#45475a" },
      { name: "Focus border", hex: "#74c7ec" },
      { name: "Eyes", hex: "#89dceb" },
      { name: "Prompt", hex: "#a6e3a1" },
      { name: "Blush", hex: "#f5c2e7" },
      { name: "Antenna ball", hex: "#f9e2af" },
    ],
  },
];

export type BrandFile = {
  /** The path on the site, under public/. */
  path: string;
  format: "SVG" | "PNG" | "ICO";
  /** Pixel size for raster files, as "512 x 512". */
  size?: string;
};

export type DownloadItem = { name: string; detail: string; files: BrandFile[] };
export type DownloadGroup = { title: string; items: DownloadItem[] };

export const downloads: DownloadGroup[] = [
  {
    title: "Mark",
    items: [
      {
        name: "Tilly, full body",
        detail: "The main mark. Use it at 48 px and larger.",
        files: [
          { path: "/brand/mark.svg", format: "SVG" },
          { path: "/brand/mark-512.png", format: "PNG", size: "512 x 512" },
          { path: "/brand/mark-128.png", format: "PNG", size: "128 x 128" },
        ],
      },
      {
        name: "Small mark, 32 px",
        detail: "Tilly's head with the three panes, drawn for 24 to 47 px.",
        files: [
          { path: "/brand/mark-32.svg", format: "SVG" },
          { path: "/brand/mark-32.png", format: "PNG", size: "32 x 32" },
        ],
      },
      {
        name: "Small mark, 16 px",
        detail: "The head redrawn on whole pixels, for 16 to 23 px.",
        files: [
          { path: "/brand/mark-16.svg", format: "SVG" },
          { path: "/brand/mark-16.png", format: "PNG", size: "16 x 16" },
        ],
      },
    ],
  },
  {
    title: "Wordmark and lockups",
    items: [
      {
        name: "Wordmark, for dark backgrounds",
        detail: "Mocha Text on transparent.",
        files: [
          { path: "/brand/wordmark-dark.svg", format: "SVG" },
          {
            path: "/brand/wordmark-dark.png",
            format: "PNG",
            size: "509 x 227",
          },
        ],
      },
      {
        name: "Wordmark, for light backgrounds",
        detail: "Mocha Base on transparent.",
        files: [
          { path: "/brand/wordmark-light.svg", format: "SVG" },
          {
            path: "/brand/wordmark-light.png",
            format: "PNG",
            size: "509 x 227",
          },
        ],
      },
      {
        name: "Horizontal lockup, for dark backgrounds",
        detail: "Mark and wordmark side by side, with clear space included.",
        files: [
          { path: "/brand/lockup-horizontal-dark.svg", format: "SVG" },
          {
            path: "/brand/lockup-horizontal-dark.png",
            format: "PNG",
            size: "678 x 360",
          },
        ],
      },
      {
        name: "Horizontal lockup, for light backgrounds",
        detail: "Mark and wordmark side by side, with clear space included.",
        files: [
          { path: "/brand/lockup-horizontal-light.svg", format: "SVG" },
          {
            path: "/brand/lockup-horizontal-light.png",
            format: "PNG",
            size: "678 x 360",
          },
        ],
      },
      {
        name: "Stacked lockup, for dark backgrounds",
        detail: "Mark above wordmark, for square and tall spaces.",
        files: [
          { path: "/brand/lockup-stacked-dark.svg", format: "SVG" },
          {
            path: "/brand/lockup-stacked-dark.png",
            format: "PNG",
            size: "413 x 570",
          },
        ],
      },
      {
        name: "Stacked lockup, for light backgrounds",
        detail: "Mark above wordmark, for square and tall spaces.",
        files: [
          { path: "/brand/lockup-stacked-light.svg", format: "SVG" },
          {
            path: "/brand/lockup-stacked-light.png",
            format: "PNG",
            size: "413 x 570",
          },
        ],
      },
    ],
  },
  {
    title: "App icons",
    items: [
      {
        name: "App icon",
        detail: "Tilly on a dark rounded square, on the macOS icon grid.",
        files: [
          { path: "/brand/app-icon.svg", format: "SVG" },
          {
            path: "/brand/app-icon-1024.png",
            format: "PNG",
            size: "1024 x 1024",
          },
          { path: "/brand/app-icon-512.png", format: "PNG", size: "512 x 512" },
        ],
      },
      {
        name: "Web and touch icons",
        detail:
          "Full bleed squares for platforms that apply their own mask: the Apple touch icon and the maskable web manifest icons.",
        files: [
          {
            path: "/apple-touch-icon.png",
            format: "PNG",
            size: "180 x 180",
          },
          { path: "/icon-192.png", format: "PNG", size: "192 x 192" },
          { path: "/icon-512.png", format: "PNG", size: "512 x 512" },
        ],
      },
      {
        name: "Favicon",
        detail: "The small marks as a browser icon.",
        files: [
          { path: "/favicon.svg", format: "SVG" },
          { path: "/favicon.ico", format: "ICO", size: "16, 32, 48" },
        ],
      },
    ],
  },
  {
    title: "Social and README",
    items: [
      {
        name: "Social preview",
        detail:
          "For the GitHub repository settings and link previews. Keep text inside a 40 px border.",
        files: [
          {
            path: "/brand/social-preview.png",
            format: "PNG",
            size: "1280 x 640",
          },
        ],
      },
      {
        name: "README banner, dark",
        detail: "For a README shown in dark mode.",
        files: [
          { path: "/brand/banner-dark.svg", format: "SVG" },
          { path: "/brand/banner-dark.png", format: "PNG", size: "1600 x 400" },
        ],
      },
      {
        name: "README banner, light",
        detail: "For a README shown in light mode.",
        files: [
          { path: "/brand/banner-light.svg", format: "SVG" },
          {
            path: "/brand/banner-light.png",
            format: "PNG",
            size: "1600 x 400",
          },
        ],
      },
    ],
  },
];

/** Every file in the downloads, in the order they are listed. */
export function allBrandFiles(): BrandFile[] {
  return downloads.flatMap((group) =>
    group.items.flatMap((item) => item.files),
  );
}

/** The terms for using the logo and Tilly, one rule per line. */
export const terms = {
  intro:
    "The tuios source code is MIT licensed. The name, the logo and Tilly are how people recognise the project, so they come with a few plain rules of their own.",
  allowed: [
    "Use the logo, the wordmark and Tilly to link to tuios, or to write, talk or teach about it: in articles, videos, slides, package listings, and pages for tools that work with tuios.",
    "Use the files as they are, no smaller than the minimum sizes on the brand page.",
  ],
  notAllowed: [
    "Do not alter the mark: no new colours, stretching, redrawing, outlines, effects or added parts.",
    "Do not imply that tuios or its maintainer endorses, sponsors or made your product.",
    "Do not use the logo or Tilly as part of your own product's name, logo or icon.",
  ],
  ask: "Ask before any commercial use of Tilly, such as stickers or merchandise for sale, or Tilly in the marketing of a paid product.",
  fonts:
    "The wordmark is set in Fredoka and converted to outlines, so the files need no font. Fredoka is under the SIL Open Font License 1.1.",
};

/** The terms as plain text, for the kit zip. */
export function termsText() {
  const lines = [
    "tuios brand kit",
    "",
    tagline,
    `${absoluteUrl("/brand")}`,
    "",
    terms.intro,
    "",
    "You may:",
    ...terms.allowed.map((line) => `- ${line}`),
    "",
    "Not allowed:",
    ...terms.notAllowed.map((line) => `- ${line}`),
    "",
    terms.ask,
    `Open an issue on GitHub to ask: ${site.repository}/issues`,
    "",
    terms.fonts,
    "",
  ];
  return lines.join("\n");
}

/** The brand page as markdown, for its twin at /brand.md. */
export function brandMarkdown() {
  const lines = [
    "# Brand",
    "",
    `URL: ${absoluteUrl("/brand")}`,
    "",
    `> ${tagline}`,
    "",
    "tuios is a terminal window manager: panes, tiling and nine workspaces inside the terminal you already use, with sessions that keep running when you detach and a view of what the coding agents in your panes are doing.",
    "",
    "## Tilly",
    "",
    "Tilly is the tuios mascot: a small CRT monitor whose screen face is a tiled window layout. The two top panes are the eyes, the wide pane below is a `>_` prompt for a mouth, and the focused pane has a sapphire border.",
    "",
    "## Colours",
    "",
  ];
  for (const group of palette) {
    lines.push(`### ${group.title}`, "", group.blurb, "");
    for (const swatch of group.swatches) {
      lines.push(
        `- ${swatch.name}: \`${swatch.hex}\`${swatch.note ? ` (${swatch.note})` : ""}`,
      );
    }
    lines.push("");
  }
  lines.push(
    "## Type",
    "",
    "- Wordmark: Fredoka SemiBold, as outlines. SIL Open Font License 1.1.",
    "- Headings, navigation and code on this site: Monaspace Neon. SIL Open Font License 1.1.",
    "- Running text on this site: the system sans-serif face of the reader's device.",
    "",
    "## Downloads",
    "",
    `- [The whole kit as a zip](${absoluteUrl(kitPath)})`,
  );
  for (const group of downloads) {
    lines.push("", `### ${group.title}`, "");
    for (const item of group.items) {
      const files = item.files
        .map(
          (file) =>
            `[${file.format}${file.size ? ` ${file.size}` : ""}](${absoluteUrl(file.path)})`,
        )
        .join(", ");
      lines.push(`- ${item.name}: ${files}`);
    }
  }
  lines.push(
    "",
    "## Using the logo and Tilly",
    "",
    terms.intro,
    "",
    ...terms.allowed.map((line) => `- ${line}`),
    ...terms.notAllowed.map((line) => `- ${line}`),
    "",
    `${terms.ask} Open an issue on GitHub to ask: ${site.repository}/issues`,
    "",
  );
  return lines.join("\n");
}
