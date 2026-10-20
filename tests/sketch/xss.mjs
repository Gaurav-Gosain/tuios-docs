// Checks that a share link cannot run script or load anything through the
// sketch playground. It drives the page in headless Chromium.
//
//   bun tests/sketch/xss.mjs <base-url>
//
// <base-url> serves a build with the sketch engine, for example `bun run dev`
// after `bun scripts/sketch-engine.mjs <build-dir>`. CHROMIUM names the
// browser; Playwright's own is used when it is not set.
//
// Three parts:
//
// 1. Each source in hostile-sources.json goes in as a share link, through
//    the real engine. Every element of the drawing is hovered and clicked.
// 2. Each SVG in hostile-svgs.json comes back from a fake worker, as if
//    sketch had written it. This tests the page's own SVG cleaner.
// 3. A control: one hostile SVG is put into the page without the cleaner.
//    The detectors must see it, or the test above proves nothing.
//
// It fails on a dialog, a console line with a marker, a request to
// evil.example, a navigation, or an element or attribute in the drawing that
// could run or load something. It exits 1 on any failure.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { deflateRawSync } from "node:zlib";
import { chromium } from "playwright-core";

const base = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const page = `${base}/docs/libraries/sketch/playground`;
const here = path.dirname(new URL(import.meta.url).pathname);
const sources = JSON.parse(
  await readFile(path.join(here, "hostile-sources.json"), "utf8"),
);
const svgs = JSON.parse(
  await readFile(path.join(here, "hostile-svgs.json"), "utf8"),
);

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
});
let failures = 0;

function hash(code) {
  const packed = deflateRawSync(Buffer.from(code, "utf8"));
  return `#code=${packed.toString("base64url")}`;
}

/** The drawing's problems: anything that could run or load. */
function audit() {
  const bad = [];
  const stage = document.querySelector(".sp-stage");
  if (!stage) return ["no stage"];
  for (const el of stage.querySelectorAll("*")) {
    const name = el.localName;
    if (
      [
        "script",
        "style",
        "foreignObject",
        "foreignobject",
        "iframe",
        "use",
        "image",
        "a",
        "animate",
        "set",
        "img",
        "object",
        "embed",
      ].includes(name)
    ) {
      bad.push(`element <${name}>`);
    }
    for (const attr of el.attributes) {
      const n = attr.name.toLowerCase();
      const v = attr.value;
      if (n.startsWith("on")) bad.push(`<${name} ${n}>`);
      if (n.includes("href")) bad.push(`<${name} ${n}="${v.slice(0, 40)}">`);
      if (/url\s*\(\s*['"]?\s*(?!#)|javascript:|data:/i.test(v)) {
        bad.push(`<${name} ${n}="${v.slice(0, 60)}">`);
      }
    }
  }
  return bad;
}

/** Opens a page with the detectors on. */
async function open(fakeWorker) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const tab = await ctx.newPage();
  const seen = [];
  tab.on("dialog", (d) => {
    seen.push(`dialog: ${d.message()}`);
    d.dismiss().catch(() => {});
  });
  tab.on("console", (m) => {
    if (/xss|svg-\d|marker/i.test(m.text())) seen.push(`console: ${m.text()}`);
  });
  tab.on("pageerror", (e) => seen.push(`pageerror: ${e.message}`));
  await ctx.route(/evil\.example/, (route) => {
    seen.push(`request: ${route.request().url()}`);
    route.abort();
  });
  if (fakeWorker) {
    await ctx.route(
      /\/sketch-playground\/engine\/[^/]+\/worker\.js$/,
      (route) =>
        route.fulfill({
          contentType: "text/javascript",
          body: fakeWorker,
        }),
    );
  }
  return { ctx, tab, seen };
}

/** Hovers and clicks every element of the drawing, then audits it. */
async function poke(tab, seen, label, expectDrawing) {
  const start = tab.url();
  await tab
    .waitForFunction(
      () =>
        document.querySelector(".sp-stage svg[data-current]") ||
        document.querySelector(".sp-status[data-error]"),
      null,
      { timeout: 20000 },
    )
    .catch(() => seen.push("nothing drawn and no error shown"));
  await tab.waitForTimeout(600);
  const drawn = await tab.$(".sp-stage svg[data-current]");
  if (expectDrawing && !drawn) seen.push("no drawing");
  if (drawn) {
    const cls = (await drawn.getAttribute("class")) ?? "";
    if (/(^|\s)(?!pele)\S/.test(cls)) seen.push(`root class "${cls}"`);
  }
  // The cleaner must keep what a drawing needs, too.
  if (drawn && !(await drawn.getAttribute("viewBox"))) {
    seen.push("drawing lost its viewBox");
  }
  const targets = await tab.$$(".sp-stage svg[data-current] *");
  for (const el of targets.slice(0, 80)) {
    await el.hover({ force: true, timeout: 500 }).catch(() => {});
    await el
      .click({ force: true, timeout: 500, noWaitAfter: true })
      .catch(() => {});
  }
  await tab.waitForTimeout(300);
  for (const p of await tab.evaluate(audit)) seen.push(`drawing has ${p}`);
  const end = tab.url();
  if (end.split("#")[0] !== start.split("#")[0]) {
    seen.push(`navigated to ${end}`);
  }
  if (tab.isClosed()) seen.push("page closed");
  const ok = seen.length === 0;
  if (!ok) failures++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${label}${ok ? "" : `\n     ${seen.join("\n     ")}`}`,
  );
}

// 1. The real engine.
for (const [i, src] of sources.entries()) {
  const { ctx, tab, seen } = await open(null);
  await tab.goto(`${page}${hash(src)}`, { waitUntil: "load" });
  const first = src.split("\n").find((l) => l.trim() && !l.startsWith("%%"));
  await poke(tab, seen, `source ${i}: ${first?.slice(0, 50)}`, false);
  await ctx.close();
}

// 2. A fake worker that answers with a hostile SVG.
const fake = (svg) => `
self.onmessage = (e) => {
  const m = e.data;
  if (m.type === "init") self.postMessage({ type: "ready", themes: [] });
  if (m.type === "render") self.postMessage({ type: "result", id: m.id, ms: 0,
    out: { svg: ${JSON.stringify(svg)}, width: 100, height: 40, type: "flowchart" } });
};`;
for (const [i, svg] of svgs.entries()) {
  const { ctx, tab, seen } = await open(fake(svg));
  await tab.goto(`${page}${hash("flowchart TD\n  A --> B\n")}`, {
    waitUntil: "load",
  });
  await poke(tab, seen, `svg ${i}`, true);
  await ctx.close();
}

// 3. The control: the same kind of SVG without the cleaner must be caught.
{
  const { ctx, tab, seen } = await open(null);
  await tab.goto(page, { waitUntil: "load" });
  await tab.waitForSelector(".sp-stage svg[data-current]", { timeout: 20000 });
  await tab.evaluate(() => {
    const stage = document.querySelector(".sp-stage");
    const div = document.createElement("div");
    div.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg"><image href="x" onerror="alert(\'control\')"/></svg>';
    stage.appendChild(div);
  });
  await tab.waitForTimeout(800);
  const problems = await tab.evaluate(audit);
  const caught = seen.some((s) => s.includes("control")) && problems.length > 0;
  if (!caught) failures++;
  console.log(
    `${caught ? "ok  " : "FAIL"} control: the detectors see unclean SVG (${seen.length} events, ${problems.length} problems)`,
  );
  await ctx.close();
}

await browser.close();
console.log(failures ? `${failures} failed` : "all passed");
process.exit(failures ? 1 : 0);
