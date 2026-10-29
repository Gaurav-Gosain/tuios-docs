// Drives every /learn track in headless Chromium, with the keys a reader
// presses, and checks that the engine marks each step done.
//
//   bun tests/learn/tracks.ts <base-url> [track-id...] [--out DIR] [--size WxH]
//   bun tests/learn/tracks.ts <base-url> --phone [--out DIR]
//
// <base-url> serves the site with an engine in public/learn, for example
// `bun run dev` after `bun scripts/learn-engine.mjs <build-dir>`. CHROMIUM
// names the browser; Playwright's own is used when it is not set.
//
// Each step's keys go in as real key presses on the lesson's terminal, the
// way a reader types them, never through tuios.command. A step that the keys
// do not finish in time fails: the run saves the screen as text, the last
// events from tuios and a frame under --out, then presses Skip so the rest
// of the track still runs. An explainer step is finished with its button.
// Each finished track leaves a frame, and every step leaves one under
// --out/steps when --frames is given.
//
// --size WxH sets the window, 1440x900 unless given.
//
// --phone loads /learn at a phone's size and saves a frame of the page.
//
// It exits 1 when any step failed.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "playwright-core";
import { chordParts } from "../../lib/learn/keys";
import { findTrack, tracks } from "../../lib/learn/tracks";
import type { KeyItem, Step, Track } from "../../lib/learn/types";

const args = process.argv.slice(2);
function option(name: string) {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const [, value] = args.splice(i, 2);
  return value;
}
function flag(name: string) {
  const i = args.indexOf(name);
  if (i >= 0) args.splice(i, 1);
  return i >= 0;
}
const out = path.resolve(option("--out") ?? "learn-run");
const phone = flag("--phone");
const frames = flag("--frames");
const [width, height] = (option("--size") ?? "1440x900").split("x").map(Number);
const base = (args.shift() ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const picked = args.length
  ? args.map((id) => {
      const t = findTrack(id);
      if (!t) throw new Error(`no track ${id}`);
      return t;
    })
  : tracks;

/** How long a step may take after its last key, in ms. */
const STEP_MS = 9000;

/** Steps that take longer than STEP_MS by design, such as a tape. */
const SLOW: Record<string, number> = {
  "automation/play": 30_000,
  "automation/party": 45_000,
};

/**
 * Steps whose keys mean something only once the scene is ready, such as an
 * agent that asks after a few seconds. Each is a check on the lesson's
 * tuios state, run in the page, and the run waits for it before the keys.
 */
const READY: Record<string, string> = {
  "agents/jump": "s.windowList.some((w) => w.agent === 'needs_input')",
  // Both agents ask and codex is done, so the view opens on the edit.
  "cockpit/open":
    "s.windowList.some((w) => w.harness === 'claude-code' && w.agent === 'needs_input') && s.windowList.some((w) => w.harness === 'gemini-cli' && w.agent === 'needs_input') && s.windowList.some((w) => w.harness === 'codex' && w.agent === 'done')",
  // Nothing asks, so g lands on codex, the first agent that is done.
  "cockpit/reply": "!s.windowList.some((w) => w.agent === 'needs_input')",
  // The attempts are done, so G lands on the last of them.
  "cockpit/compare": "!s.windowList.some((w) => w.agent === 'working')",
};

// In the page: the lesson's terminal host, which lib/learn/runtime.ts gives
// the tuios API and the renderer. The hub's live hero has its own, so the
// lookup starts from the lesson.
const HELPERS = `
window.__lesson = () => {
  let el = document.querySelector("[data-learn-phase] .xterm");
  while (el && !el.tuiosLearn) el = el.parentElement;
  return el ? el.tuiosLearn : null;
};
window.__screen = () => {
  const l = window.__lesson();
  if (!l) return "(no terminal)";
  const t = l.term.terminal, b = t.buffer.active, rows = [];
  for (let i = 0; i < t.rows; i++) rows.push(b.getLine(b.viewportY + i)?.translateToString(true) ?? "");
  return rows.join("\\n");
};
window.__events = () => (window.__lesson()?.log ?? [])
  .filter((e) => e.type !== "key")
  .slice(-60)
  .map((e) => e.type + " " + JSON.stringify(e.data ?? {}));
`;

/** tuios's key notation to Playwright's. */
function pwKey(k: string): string {
  const names: Record<string, string> = {
    ctrl: "Control",
    alt: "Alt",
    shift: "Shift",
    super: "Meta",
    enter: "Enter",
    esc: "Escape",
    tab: "Tab",
    space: " ",
    left: "ArrowLeft",
    right: "ArrowRight",
    up: "ArrowUp",
    down: "ArrowDown",
    backspace: "Backspace",
    pgup: "PageUp",
    pgdown: "PageDown",
    home: "Home",
    end: "End",
    delete: "Delete",
  };
  if (k === "+") return "+";
  return k
    .split("+")
    .map((p) => names[p] ?? p)
    .join("+");
}

async function press(page: Page, item: KeyItem) {
  if (typeof item === "string") await page.keyboard.press(pwKey(item));
  else await page.keyboard.type(item.text, { delay: 25 });
}

/** Whether a step names the same key twice, such as "ctrl+b z ctrl+b z". */
function repeatsKey(step: Step) {
  const parts = step.keys.flatMap((k) =>
    typeof k === "string" ? chordParts(k) : [],
  );
  return new Set(parts).size < parts.length;
}

/**
 * The lesson's caps, as the item each belongs to and whether it is held or
 * done. The caps come in the order of the step's keys: one per key of a
 * chord, one for typed text.
 */
async function caps(page: Page, keys: KeyItem[]) {
  const owner = keys.flatMap((k, i) =>
    typeof k === "string" ? chordParts(k).map(() => i) : [i],
  );
  const marks = await page.$$eval(
    '[data-learn-phase] .lk[data-size="xl"]',
    (els) =>
      els.map((el) => ({
        held: el.hasAttribute("data-held"),
        done: el.hasAttribute("data-done"),
      })),
  );
  if (marks.length !== owner.length) return null;
  const held = new Set<number>();
  const done = new Set<number>();
  marks.forEach((m, c) => {
    if (m.held) held.add(owner[c] as number);
    if (m.done) done.add(owner[c] as number);
  });
  return { held: [...held], done: [...done] };
}

/**
 * Presses item j of a step that repeats a key, holding it while it reads
 * the caps. The held caps must be item j's alone, and once it is let go
 * every item up to j must be done. Returns what went wrong, or "".
 */
async function pressAndCheck(page: Page, keys: KeyItem[], j: number) {
  const item = keys[j] as string;
  const parts = item === "+" ? ["+"] : pwKey(item).split("+");
  for (const p of parts) await page.keyboard.down(p);
  await page.waitForTimeout(250);
  const during = await caps(page, keys);
  for (const p of [...parts].reverse()) await page.keyboard.up(p);
  await page.waitForTimeout(260);
  const after = await caps(page, keys);
  const want = keys.slice(0, j + 1).map((_, i) => i);
  const problems: string[] = [];
  if (during && (during.held.length !== 1 || during.held[0] !== j)) {
    problems.push(`held [${during.held}] while pressing ${j}`);
  }
  if (after && after.done.join() !== want.join()) {
    problems.push(`done [${after.done}] after ${j}, want [${want}]`);
  }
  return problems.join("; ");
}

/**
 * The caps in the step card and the keys learned list whose text does not
 * fit, in the cap or in its box, by their text. Empty when all fit.
 */
function capsPastEdge(page: Page) {
  return page.$$eval("[data-learn-phase] aside .lk", (els) =>
    els
      .filter((el) => {
        const box = el.closest(".rounded-xl");
        if (!box) return false;
        const pad = Number.parseFloat(getComputedStyle(box).paddingRight);
        // A cap squeezed by its row keeps its box and spills its text.
        return (
          el.scrollWidth > el.clientWidth + 1 ||
          el.getBoundingClientRect().right >
            box.getBoundingClientRect().right - pad + 1
        );
      })
      .map((el) => el.textContent ?? ""),
  );
}

const attr = (page: Page, name: string) =>
  page.evaluate(
    (n) =>
      document.querySelector("[data-learn-phase]")?.getAttribute(n) ?? null,
    name,
  );

async function waitFor(page: Page, fn: () => Promise<boolean>, ms: number) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    if (await fn()) return true;
    await page.waitForTimeout(100);
  }
  return false;
}

/** The step the lesson is on, or -1 once it finished. */
async function stepIndex(page: Page) {
  if ((await attr(page, "data-learn-phase")) === "finished") return -1;
  return Number(await attr(page, "data-learn-step"));
}

/** Saves the frame of step i under --out/steps. */
async function stepFrame(page: Page, track: Track, i: number, step: Step) {
  const dir = path.join(out, "steps");
  await mkdir(dir, { recursive: true });
  await page.screenshot({
    path: path.join(
      dir,
      `${track.id}--${String(i + 1).padStart(2, "0")}-${step.id}.png`,
    ),
  });
}

type Result = { track: string; step: string; ok: boolean; ms: number };
const results: Result[] = [];

async function runTrack(page: Page, track: Track) {
  await page.goto(`${base}/learn?t=${track.id}`);
  await page.waitForSelector('[data-learn-phase="running"]', {
    timeout: 90_000,
  });
  await page.waitForFunction(() => {
    const w = window as unknown as { __lesson(): unknown };
    return Boolean(w.__lesson());
  });
  for (let i = 0; i < track.steps.length; i++) {
    const step = track.steps[i] as Step;
    const name = `${track.id}/${step.id}`;
    // The card shows once the step's setup has run.
    await waitFor(
      page,
      async () =>
        (await stepIndex(page)) === i &&
        (await attr(page, "data-learn-holding")) === null,
      20_000,
    );
    await page.waitForTimeout(700);
    const started = Date.now();
    const past = await capsPastEdge(page);
    if (past.length) {
      results.push({
        track: track.id,
        step: `${step.id} fit`,
        ok: false,
        ms: 0,
      });
      console.log(`FAIL ${name} fit: ${past.join(", ")} does not fit`);
    }
    if (step.explainer) {
      // The sample the setup typed is the screen to check, so the frame is
      // taken before the button.
      if (frames) await stepFrame(page, track, i, step);
      await page.click("[data-learn-phase] [data-primary]");
      const ok = await waitFor(
        page,
        async () => (await stepIndex(page)) !== i,
        5000,
      );
      results.push({ track: track.id, step: step.id, ok, ms: 0 });
      console.log(`${ok ? "ok  " : "FAIL"} ${name} (explainer)`);
      continue;
    }
    if (READY[name]) {
      await page.waitForFunction(
        `(() => { const s = window.__lesson().api.state(); return ${READY[name]}; })()`,
        null,
        { timeout: 30_000 },
      );
    }
    // Into the terminal, the way a reader clicks it.
    await page.evaluate(() =>
      (
        document.querySelector(
          "[data-learn-phase] .xterm-helper-textarea",
        ) as HTMLElement | null
      )?.focus(),
    );
    // A step that names a key twice also checks that the caps follow the
    // reader's place: the first ctrl+b marks the first ctrl+b cap.
    const check = repeatsKey(step);
    const marks: string[] = [];
    for (const [j, item] of step.keys.entries()) {
      if (check && typeof item === "string") {
        const problem = await pressAndCheck(page, step.keys, j);
        if ((await stepIndex(page)) !== i) break;
        if (problem) marks.push(problem);
        continue;
      }
      await press(page, item);
      await page.waitForTimeout(typeof item === "string" ? 260 : 120);
      if ((await stepIndex(page)) !== i) break;
    }
    if (check) {
      const ok = marks.length === 0;
      results.push({ track: track.id, step: `${step.id} caps`, ok, ms: 0 });
      console.log(
        `${ok ? "ok  " : "FAIL"} ${name} caps${ok ? "" : `: ${marks.join("; ")}`}`,
      );
    }
    const ok = await waitFor(
      page,
      async () => (await stepIndex(page)) !== i,
      SLOW[name] ?? STEP_MS,
    );
    const ms = Date.now() - started;
    results.push({ track: track.id, step: step.id, ok, ms });
    console.log(`${ok ? "ok  " : "FAIL"} ${name} (${ms} ms)`);
    if (frames) await stepFrame(page, track, i, step);
    if (!ok) {
      const dir = path.join(out, "fail");
      await mkdir(dir, { recursive: true });
      const file = path.join(dir, `${track.id}--${step.id}`);
      const report = await page.evaluate(() => {
        const w = window as unknown as {
          __events(): string[];
          __screen(): string;
          __lesson(): { api: { state(): unknown } };
        };
        return {
          events: w.__events().join("\n"),
          state: JSON.stringify(w.__lesson().api.state()),
          screen: w.__screen(),
        };
      });
      await writeFile(
        `${file}.txt`,
        `${name}\nkeys: ${JSON.stringify(step.keys)}\nstate: ${report.state}\n\nevents:\n${report.events}\n\nscreen:\n${report.screen}\n`,
      );
      await page.screenshot({ path: `${file}.png` });
      await page
        .locator("[data-learn-phase]")
        .getByRole("button", { name: "Skip" })
        .click()
        .catch(() => {});
      await waitFor(page, async () => (await stepIndex(page)) !== i, 6000);
    }
  }
  await page.waitForTimeout(800);
  await mkdir(out, { recursive: true });
  await page.screenshot({ path: path.join(out, `${track.id}.png`) });
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
});
try {
  if (phone) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await page.goto(`${base}/learn`);
    await page.waitForTimeout(3000);
    await mkdir(out, { recursive: true });
    await page.screenshot({
      path: path.join(out, "phone.png"),
      fullPage: true,
    });
    console.log(`phone frame in ${out}`);
  } else {
    for (const track of picked) {
      // A new context per track: no saved progress, so no resume.
      const ctx = await browser.newContext({
        viewport: { width: width as number, height: height as number },
      });
      await ctx.addInitScript(HELPERS);
      const page = await ctx.newPage();
      try {
        await runTrack(page, track);
      } catch (err) {
        console.log(`FAIL ${track.id}: ${(err as Error).message}`);
        results.push({ track: track.id, step: "(track)", ok: false, ms: 0 });
      }
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}
const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} steps done by their keys`,
);
for (const r of failed) console.log(`  failed: ${r.track}/${r.step}`);
process.exit(failed.length ? 1 : 0);
