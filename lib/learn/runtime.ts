/**
 * Loads the tuios wasm build and runs it in the page.
 *
 * The engine is fetched once per page: public/learn/engine.json names a
 * content-hashed folder with the gzipped wasm, Go's wasm_exec.js and sip's
 * WebTerm renderer. scripts/learn-engine.mjs writes it.
 *
 * Why gzip and DecompressionStream, and not a Worker that sets
 * Content-Encoding on a brotli file: the raw wasm is about 27 MB, over the
 * 25 MiB limit on one static asset, so only a compressed file can ship. Having
 * the page unpack it means it works on every host the site runs on (next dev,
 * a preview, the Worker, plain static hosting) with no special headers, and
 * the byte count the loader shows is exact because the response length is
 * the compressed size. Brotli would save about 1.5 MB, but browsers cannot
 * unpack brotli in script, so it would need the Worker for every request.
 *
 * Each lesson runs its own instance of the compiled module, so starting a
 * track always starts from an empty desktop. Compiling happens once.
 */

import {
  keyDebugEnabled,
  noteHandler,
  noteKeyDebug,
  noteTerminalSent,
  noteTuios,
  setKeyDebugSource,
  watchTextarea,
} from "./keydebug";
import { altChordBytes, detectMac } from "./keys";
import type { TuiosApi, TuiosEvent } from "./types";

export type EngineManifest = {
  base: string;
  wasm: string;
  wasmBytes: number;
  /** Everything the page downloads to run tuios. */
  totalBytes?: number;
  /** Font files under `base`, woff2 or ttf. */
  fonts?: { regular: string; bold: string };
  ref: string;
};

const DEFAULT_FONTS = {
  regular: "fonts/JetBrainsMonoNerdFontMono-Regular.ttf",
  bold: "fonts/JetBrainsMonoNerdFontMono-Bold.ttf",
};

export type EngineStatus = {
  phase: "idle" | "loading" | "ready" | "missing" | "error";
  loaded: number;
  total: number;
  error?: string;
};

type WebTermInstance = {
  open(host: HTMLElement): Promise<void>;
  write(data: Uint8Array | string): void;
  attach(transport: {
    name: string;
    start(): void;
    send(bytes: Uint8Array): void;
    close(): void;
  }): void;
  on(event: string, fn: (arg: { cols: number; rows: number }) => void): void;
  /** The renderer in use: "webgl", "canvas", "dom" or "vtgl". */
  renderer?: string;
  /** Present when the Kitty keyboard protocol is installed. */
  keyboardProtocol?: { flags?: number };
  focus(): void;
  blur(): void;
  fit?(): void;
  dispose(): void;
  cols: number;
  rows: number;
};

type GoRuntime = {
  importObject: WebAssembly.Imports;
  run(instance: WebAssembly.Instance): Promise<void>;
};

declare global {
  interface Window {
    Go?: new () => GoRuntime;
    WebTerm?: { WebTerm: new (options: unknown) => WebTermInstance };
    tuiosInitialSize?: [number, number];
    onTuiosReady?: (api: TuiosApi) => void;
  }
}

let status: EngineStatus = { phase: "idle", loaded: 0, total: 0 };
const listeners = new Set<() => void>();
let loading: Promise<{
  module: WebAssembly.Module;
  manifest: EngineManifest;
}> | null = null;

function setStatus(next: Partial<EngineStatus>) {
  status = { ...status, ...next };
  for (const fn of listeners) fn();
}

export function engineStatus() {
  return status;
}

export function subscribeEngine(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Start loading the engine. Safe to call many times. */
export function loadEngine() {
  if (!loading) {
    loading = load().catch((err: unknown) => {
      loading = null;
      if (!(err instanceof MissingEngine)) {
        setStatus({ phase: "error", error: String(err) });
      }
      throw err;
    });
  }
  return loading;
}

class MissingEngine extends Error {}

async function load() {
  setStatus({ phase: "loading", loaded: 0, error: undefined });
  const res = await fetch("/learn/engine.json", { cache: "no-cache" });
  if (!res.ok) {
    setStatus({ phase: "missing" });
    throw new MissingEngine("no engine.json");
  }
  const manifest = (await res.json()) as EngineManifest;
  setStatus({ total: manifest.wasmBytes });

  const scripts = Promise.all([
    addStylesheet(`${manifest.base}xterm.css`),
    addStylesheet(`${manifest.base}webterm.css`),
    addScript(`${manifest.base}wasm_exec.js`),
    addScript(`${manifest.base}webterm.js`),
  ]);
  const module = await fetchModule(manifest);
  await scripts;
  setStatus({ phase: "ready", loaded: status.total });
  return { module, manifest };
}

async function fetchModule(manifest: EngineManifest) {
  const res = await fetch(`${manifest.base}${manifest.wasm}`);
  if (!res.ok || !res.body) throw new Error(`wasm: HTTP ${res.status}`);
  const length = Number(res.headers.get("content-length"));
  if (length > 0 && !res.headers.get("content-encoding")) {
    setStatus({ total: length });
  }

  // Count bytes as they arrive, for the loader.
  let loaded = 0;
  let last = 0;
  const counted = res.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        loaded += chunk.byteLength;
        const now = performance.now();
        if (now - last > 50) {
          last = now;
          setStatus({ loaded: Math.min(loaded, status.total * 0.99) });
        }
        controller.enqueue(chunk);
      },
    }),
  );

  // A host may already have unpacked the gzip for us (Content-Encoding:
  // gzip). The first two bytes tell: 1f 8b is gzip, 00 61 is "\0asm".
  const { first, rest } = await peek(counted);
  let wasm: ReadableStream<Uint8Array> = rest;
  if (first[0] === 0x1f && first[1] === 0x8b) {
    wasm = rest.pipeThrough(
      new DecompressionStream("gzip") as unknown as TransformStream<
        Uint8Array,
        Uint8Array
      >,
    );
  }
  const response = new Response(wasm, {
    headers: { "content-type": "application/wasm" },
  });
  if ("compileStreaming" in WebAssembly) {
    return WebAssembly.compileStreaming(response);
  }
  return WebAssembly.compile(await response.arrayBuffer());
}

/** Read the first chunk, and return a stream that still starts with it. */
async function peek(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const { value } = await reader.read();
  const first = value ?? new Uint8Array();
  const rest = new ReadableStream<Uint8Array>({
    start(controller) {
      if (first.byteLength) controller.enqueue(first);
    },
    async pull(controller) {
      const { value: chunk, done } = await reader.read();
      if (done) controller.close();
      else controller.enqueue(chunk);
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
  return { first, rest };
}

function addScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(el);
  });
}

function addStylesheet(href: string) {
  return new Promise<void>((resolve) => {
    if (document.querySelector(`link[href="${href}"]`)) return resolve();
    const el = document.createElement("link");
    el.rel = "stylesheet";
    el.href = href;
    el.onload = () => resolve();
    el.onerror = () => resolve();
    document.head.appendChild(el);
  });
}

/**
 * Whether the page runs on a Mac, from navigator.platform, userAgentData or
 * the user agent, since a hardened browser can blank or spoof any one.
 */
export const IS_MAC = typeof navigator !== "undefined" && detectMac(navigator);

/**
 * The bytes for an Alt chord the page sends itself (Option+j is ESC j), or
 * null to leave the key to the terminal. See altChordBytes: on a Mac every
 * plain Option chord, and elsewhere only a key that Alt plainly composed, so
 * AltGr keeps typing what the reader means.
 */
export function optionBytes(e: KeyboardEvent, mac = IS_MAC) {
  return altChordBytes(e, mac);
}

/** F5, ctrl+r and cmd+r always reload the page, whatever tuios is doing. */
export function isReloadKey(e: KeyboardEvent) {
  if (e.key === "F5") return true;
  return (
    (e.ctrlKey || e.metaKey) &&
    !e.altKey &&
    (e.code === "KeyR" || e.key === "r" || e.key === "R")
  );
}

export type TuiosInstance = {
  api: TuiosApi;
  term: WebTermInstance;
  /** Listen to events. Returns the unsubscribe function. */
  onEvent(fn: (event: TuiosEvent) => void): () => void;
  /** Called once, with the first frame. */
  onFirstFrame(fn: () => void): void;
  exited(): boolean;
  dispose(): void;
};

// Instances start one at a time: the program finds its initial size and its
// ready callback on window, which two starting at once would share.
let bootQueue: Promise<unknown> = Promise.resolve();
// Numbers each terminal for the key log.
let terminals = 0;

/** Start a fresh tuios in `host`. */
export function bootTuios(
  host: HTMLElement,
  options: { fontSize?: number } = {},
): Promise<TuiosInstance> {
  const run = bootQueue.then(() => boot(host, options));
  bootQueue = run.catch(() => undefined);
  return run;
}

async function boot(
  host: HTMLElement,
  { fontSize = 14 }: { fontSize?: number },
): Promise<TuiosInstance> {
  const { module, manifest } = await loadEngine();
  const WebTermClass = window.WebTerm?.WebTerm;
  const GoClass = window.Go;
  if (!WebTermClass || !GoClass) throw new Error("engine scripts missing");

  const fonts = manifest.fonts ?? DEFAULT_FONTS;
  // Keys the page sends itself, in place of the terminal. Set once tuios runs.
  let sendKeys: (bytes: string) => void = () => {};
  const term = new WebTermClass({
    fontFamily: "JetBrainsMono Nerd Font Mono",
    fontSize,
    fonts: [
      {
        source: `url(${manifest.base}${fonts.regular})`,
        weight: "400",
        style: "normal",
      },
      {
        source: `url(${manifest.base}${fonts.bold})`,
        weight: "700",
        style: "normal",
      },
    ],
    renderer: {
      prefer: new URLSearchParams(location.search).get("renderer") ?? "webgl",
    },
    theme: { background: "#11111b" },
    mouse: { suppressContextMenu: true },
    keyboard: {
      // Returning false keeps the key from the terminal: a reload key goes
      // to the browser, and an Option chord is sent from here.
      onKeyEvent: (e: KeyboardEvent) => {
        if (isReloadKey(e)) {
          noteHandler(e, "reload key, left to the browser");
          return false;
        }
        const alt = optionBytes(e);
        if (alt === null) {
          noteHandler(e, "left to the terminal");
          return true;
        }
        if (e.type === "keydown") {
          // The default would type the composed glyph or start a dead key.
          e.preventDefault();
          sendKeys(alt);
          noteHandler(e, "alt chord, sent by the page", alt);
        } else {
          noteHandler(e, "alt chord, kept from the terminal");
        }
        return false;
      },
    },
    // Option is Alt on a Mac. optionBytes does the work for letters and
    // digits; this covers what is left, such as Option and an arrow.
    xterm: { macOptionIsMeta: true },
  });
  await term.open(host);
  let stopDebug = () => {};
  const tag = `t${++terminals}`;
  if (keyDebugEnabled()) {
    stopDebug = watchTextarea(host.querySelector("textarea"));
    setKeyDebugSource({
      renderer: () => term.renderer,
      kittyFlags: () => term.keyboardProtocol?.flags,
      engine: manifest.ref,
    });
    noteKeyDebug(
      `terminal ${tag} started, renderer ${term.renderer ?? "unknown"}`,
    );
  }

  window.tuiosInitialSize = [term.cols, term.rows];
  const ready = new Promise<TuiosApi>((resolve) => {
    window.onTuiosReady = resolve;
  });
  const go = new GoClass();
  const instance = await WebAssembly.instantiate(module, go.importObject);
  let hasExited = false;
  const onExit = () => {
    hasExited = true;
    // Timers the Go runtime set before it quit would try to resume it, and
    // wasm_exec throws when they do.
    const timers = (
      go as unknown as { _scheduledTimeouts?: Map<number, number> }
    )._scheduledTimeouts;
    for (const id of timers?.values() ?? []) clearTimeout(id);
    timers?.clear();
  };
  go.run(instance).then(onExit, onExit);
  const api = await ready;
  window.onTuiosReady = undefined;

  const listeners = new Set<(event: TuiosEvent) => void>();
  const frameListeners: (() => void)[] = [];
  let disposed = false;
  let sawOutput = false;

  api.onOutput((bytes) => {
    if (disposed) return;
    term.write(bytes);
    if (!sawOutput) {
      sawOutput = true;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          for (const fn of frameListeners.splice(0)) fn();
        }),
      );
    }
  });
  // The last events, for poking at from the console and for the Playwright
  // checks.
  const log: TuiosEvent[] = [];
  api.onEvent((event) => {
    if (disposed) return;
    log.push(event);
    if (event.type === "key" || event.type === "action") {
      noteTuios(tag, event.type, event.data ?? {});
    }
    if (log.length > 400) log.splice(0, log.length - 400);
    for (const fn of listeners) fn(event);
  });
  term.attach({
    name: "wasm",
    start() {},
    send(bytes) {
      noteTerminalSent(tag, bytes);
      if (!disposed && !hasExited) api.input(bytes);
    },
    close() {},
  });
  sendKeys = (bytes) => {
    if (!disposed && !hasExited) api.input(bytes);
  };
  term.on("resize", ({ cols, rows }) => {
    if (!disposed && !hasExited) api.resize(cols, rows);
  });
  api.resize(term.cols, term.rows);

  // The newest instance, for poking at from the console and for the
  // Playwright checks.
  (window as unknown as { tuiosLearn?: unknown }).tuiosLearn = {
    api,
    term,
    log,
  };

  return {
    api,
    term,
    onEvent(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    onFirstFrame(fn) {
      if (sawOutput) fn();
      else frameListeners.push(fn);
    },
    exited: () => hasExited,
    dispose() {
      if (disposed) return;
      disposed = true;
      listeners.clear();
      stopDebug();
      // q in window mode quits tuios, which ends the Go program and frees
      // its memory.
      if (!hasExited) {
        try {
          api.command("mode", "window");
          setTimeout(() => {
            if (!hasExited) api.input("q");
          }, 60);
        } catch {
          // The program already stopped.
        }
      }
      try {
        term.dispose();
      } catch {
        // Nothing left to clean up.
      }
    },
  };
}

/** Run setup commands in order, waiting where a command asks to. */
export async function runSetup(
  tuios: TuiosInstance,
  commands: import("./types").SetupCommand[] | undefined,
  cancelled: () => boolean = () => false,
) {
  for (const cmd of commands ?? []) {
    if (cancelled() || tuios.exited()) return;
    if ("command" in cmd) tuios.api.command(cmd.command, ...(cmd.args ?? []));
    else tuios.api.input(cmd.input);
    await sleep(cmd.wait ?? 120);
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
