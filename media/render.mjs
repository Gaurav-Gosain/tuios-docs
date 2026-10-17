// render.mjs: turn a take's session.cast into 60 fps video frames.
//
// Usage: node render.mjs BUILD_DIR OUT.mkv [--pre 0.6] [--font 15] [--max 12]
//
// The cast is the real output of a tuios client, with the time each byte
// arrived. This feeds it to xterm.js (WebGL, the renderer tuios-web and the
// /learn page draw with) in headless Chromium, and photographs the terminal
// at every 1/60 s of the recorded time. Frames come from the recorded times,
// so a busy machine during the render cannot drop or stretch one. A stall in
// tuios itself shows as it happened, and gaps.json reports the longest one.
//
// The clip runs from marks.start - pre to marks.stop, at most --max seconds.
// Frames go to ffmpeg as PNG and come out as a lossless FFV1 master that
// encode.sh compresses.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const here = path.dirname(new URL(import.meta.url).pathname);
const [buildArg, outArg, ...rest] = process.argv.slice(2);
const build = path.resolve(buildArg);
const outPath = path.resolve(outArg);
const opt = (name, def) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? Number(rest[i + 1]) : def;
};
const pre = opt("pre", 0.6);
const fontSize = opt("font", 15);
// The font files, from scripts/docs-media.sh (DOCS_MEDIA_FONT and
// DOCS_MEDIA_FONT_BOLD). They load by path, so the frames use exactly these
// files and never a font the system substitutes.
const fontRegular = process.env.DOCS_MEDIA_FONT;
const fontBold = process.env.DOCS_MEDIA_FONT_BOLD || fontRegular;
if (!fontRegular) throw new Error("render: set DOCS_MEDIA_FONT to a font file");
const maxSecs = opt("max", 12);
const FPS = 60;

const marks = JSON.parse(
  fs.readFileSync(path.join(build, "marks.json"), "utf8"),
);
const palette = JSON.parse(
  fs.readFileSync(path.join(here, "palettes.json"), "utf8"),
)[marks.palette];
const lines = fs
  .readFileSync(path.join(build, "session.cast"), "utf8")
  .trim()
  .split("\n");
const header = JSON.parse(lines[0]);
const events = lines
  .slice(1)
  .map((l) => JSON.parse(l))
  .filter((e) => e[1] === "o");

const t0 = Math.max(0, marks.start - pre);
const t1 = Math.min(marks.stop, t0 + maxSecs);
const frames = Math.round((t1 - t0) * FPS);

// The longest wait between two outputs inside the clip. While something
// moves on screen tuios writes every frame, so a long gap there is a stall.
let gap = 0;
let gapAt = 0;
let last = null;
for (const [t] of events) {
  if (t < t0 || t > t1) continue;
  if (last !== null && t - last > gap) {
    gap = t - last;
    gapAt = t - t0;
  }
  last = t;
}

const xtermJs = path.join(here, "node_modules/@xterm/xterm/lib/xterm.js");
const xtermCss = path.join(here, "node_modules/@xterm/xterm/css/xterm.css");
const webglJs = path.join(
  here,
  "node_modules/@xterm/addon-webgl/lib/addon-webgl.js",
);
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${xtermCss}">
<style>@font-face{font-family:DocsMono;src:url("file://${fontRegular}");font-weight:400}
@font-face{font-family:DocsMono;src:url("file://${fontBold}");font-weight:700}
html,body{margin:0;padding:0;background:${palette.background}}#t{display:inline-block;padding:0}</style>
<script src="file://${xtermJs}"></script><script src="file://${webglJs}"></script>
</head><body><div id="t"></div></body></html>`;
const pagePath = path.join(build, "render.html");
fs.writeFileSync(pagePath, html);

const browser = await puppeteer.launch({
  executablePath: process.env.CHROMIUM || "/usr/bin/chromium",
  headless: true,
  args: [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--force-color-profile=srgb",
    "--hide-scrollbars",
  ],
});
const page = await browser.newPage();
await page.setViewport({ width: 2400, height: 1600, deviceScaleFactor: 1 });
await page.goto(`file://${pagePath}`);
const box = await page.evaluate(
  async ({ cols, rows, fontSize, palette }) => {
    await document.fonts.load(`${fontSize}px DocsMono`);
    await document.fonts.load(`bold ${fontSize}px DocsMono`);
    if (!document.fonts.check(`${fontSize}px DocsMono`))
      throw new Error("the font file did not load");
    const [black, red, green, yellow, blue, magenta, cyan, white, ...bright] =
      palette.ansi;
    const term = new window.Terminal({
      cols,
      rows,
      fontSize,
      fontFamily: "DocsMono",
      lineHeight: 1.0,
      scrollback: 0,
      allowProposedApi: true,
      cursorBlink: false,
      theme: {
        foreground: palette.foreground,
        background: palette.background,
        cursor: palette.cursor,
        black,
        red,
        green,
        yellow,
        blue,
        magenta,
        cyan,
        white,
        brightBlack: bright[0],
        brightRed: bright[1],
        brightGreen: bright[2],
        brightYellow: bright[3],
        brightBlue: bright[4],
        brightMagenta: bright[5],
        brightCyan: bright[6],
        brightWhite: bright[7],
      },
    });
    term.open(document.getElementById("t"));
    term.loadAddon(new window.WebglAddon.WebglAddon());
    window.term = term;
    window.feed = (s) => new Promise((res) => term.write(s, res));
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
    const r = document
      .querySelector("#t .xterm-screen")
      .getBoundingClientRect();
    return {
      x: r.x,
      y: r.y,
      width: Math.floor(r.width / 2) * 2,
      height: Math.floor(r.height / 2) * 2,
    };
  },
  { cols: header.width, rows: header.height, fontSize, palette },
);

const ff = spawn(
  "nice",
  [
    "-n",
    "19",
    "taskset",
    "-c",
    "0-3",
    "ffmpeg",
    "-v",
    "error",
    "-y",
    "-f",
    "image2pipe",
    "-framerate",
    String(FPS),
    "-i",
    "-",
    "-c:v",
    "ffv1",
    "-pix_fmt",
    "yuv444p",
    outPath,
  ],
  { stdio: ["pipe", "inherit", "inherit"] },
);
const write = (buf) =>
  new Promise((res) =>
    ff.stdin.write(buf) ? res() : ff.stdin.once("drain", res),
  );

let next = 0;
let shot = null;
for (let i = 0; i < frames; i++) {
  const t = t0 + i / FPS;
  let chunk = "";
  while (next < events.length && events[next][0] <= t)
    chunk += events[next++][2];
  if (chunk || !shot) {
    if (chunk) await page.evaluate((s) => window.feed(s), chunk);
    await page.evaluate(
      () =>
        new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        ),
    );
    shot = await page.screenshot({
      type: "png",
      clip: box,
      optimizeForSpeed: true,
    });
  }
  await write(shot);
}
ff.stdin.end();
await new Promise((res) => ff.on("close", res));
await browser.close();

fs.writeFileSync(
  path.join(
    path.dirname(outPath),
    `${path.basename(outPath, ".mkv")}.gaps.json`,
  ),
  JSON.stringify({
    seconds: +(t1 - t0).toFixed(3),
    frames,
    longestOutputGap: +gap.toFixed(3),
    at: +gapAt.toFixed(3),
    width: box.width,
    height: box.height,
  }),
);
console.log(
  `render: ${frames} frames, ${box.width}x${box.height}, longest output gap ${(gap * 1000).toFixed(0)} ms at ${gapAt.toFixed(2)} s`,
);
