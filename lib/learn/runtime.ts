/**
 * Loads the tuios wasm build and runs it in the page.
 *
 * The engine is fetched once per page: public/learn/engine.json names a
 * content-hashed folder with the gzipped wasm, Go's wasm_exec.js and sip's
 * WebTerm renderer. scripts/learn-engine.mjs writes it.
 *
 * How the wasm arrives: the raw file is over the 25 MiB limit on one static
 * asset, so only its compressed twins ship, tuios.wasm.br and tuios.wasm.gz.
 * The Worker answers <base>tuios.wasm with the brotli one, or the gzip one
 * for a browser without brotli, with Content-Encoding set (see
 * worker/engine.ts). The browser unpacks it and the page compiles it as it
 * arrives. A host without the Worker (next dev, a preview, plain static
 * hosting) has no tuios.wasm, and then the page fetches the gzip file and
 * unpacks it with DecompressionStream. Brotli is about 30 % smaller, and a
 * browser cannot unpack brotli in script, which is why the Worker serves it.
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
  /** The gzip file, which the page can unpack itself. */
  wasm: string;
  wasmBytes: number;
  /**
   * The name the Worker answers with the brotli or the gzip file, encoded.
   * An engine from before the brotli file has none.
   */
  wasmEncoded?: string;
  brotliBytes?: number;
  /** The size of the raw wasm. */
  wasmRawBytes?: number;
  /** Everything the page downloads to run tuios. */
  totalBytes?: number;
  /** Font files under `base`, WOFF2. */
  fonts?: { regular: string; bold: string };
  /**
   * The vtgl renderer under `base`, when the build has it as its own file.
   * Loaded only for ?renderer=vtgl. A build from an older sip has vtgl inside
   * webterm.js and leaves this out.
   */
  vtgl?: string;
  ref: string;
};

const DEFAULT_FONTS = {
  regular: "fonts/JetBrainsMonoNerdFontMono-Regular.woff2",
  bold: "fonts/JetBrainsMonoNerdFontMono-Bold.woff2",
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
  /** Writes what write is holding for the next animation frame now. */
  flush?(): Promise<void>;
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
    WebTermVtgl?: { vtgl: () => unknown };
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
  return (await fetchEncoded(manifest)) ?? fetchGzip(manifest);
}

/**
 * The wasm as the Worker serves it, brotli or gzip encoded, which the browser
 * unpacks. null when no Worker answers, so the caller fetches the gzip file.
 */
async function fetchEncoded(manifest: EngineManifest) {
  if (!manifest.wasmEncoded) return null;
  const res = await fetch(`${manifest.base}${manifest.wasmEncoded}`).catch(
    () => null,
  );
  if (!res) return null;
  if (
    !res.ok ||
    !res.body ||
    !res.headers.get("content-type")?.includes("application/wasm")
  ) {
    await res.body?.cancel();
    return null;
  }
  // The body arrives unpacked. The loader counts what crosses the network,
  // so each unpacked byte counts as its share of the packed file.
  const packed =
    res.headers.get("content-encoding") === "br"
      ? manifest.brotliBytes
      : manifest.wasmBytes;
  const raw = manifest.wasmRawBytes;
  if (packed) setStatus({ total: packed });
  const scale = packed && raw ? packed / raw : 1;
  // A body that does not compile, such as one a proxy encoded twice, falls
  // back to the gzip file rather than leaving the lesson without an engine.
  return compile(res.body.pipeThrough(countBytes(scale))).catch((err) => {
    console.warn("learn: the encoded wasm did not compile", err);
    return null;
  });
}

/** The gzip file, unpacked here unless the host already did. */
async function fetchGzip(manifest: EngineManifest) {
  const res = await fetch(`${manifest.base}${manifest.wasm}`);
  if (!res.ok || !res.body) throw new Error(`wasm: HTTP ${res.status}`);
  const length = Number(res.headers.get("content-length"));
  if (length > 0 && !res.headers.get("content-encoding")) {
    setStatus({ total: length });
  }
  const counted = res.body.pipeThrough(countBytes(1));

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
  return compile(wasm);
}

/** Counts bytes as they pass, times scale, for the loader. */
function countBytes(scale: number) {
  let loaded = 0;
  let last = 0;
  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      loaded += chunk.byteLength * scale;
      const now = performance.now();
      if (now - last > 50) {
        last = now;
        setStatus({ loaded: Math.min(loaded, status.total * 0.99) });
      }
      controller.enqueue(chunk);
    },
  });
}

/** Compiles the wasm as it arrives. */
function compile(wasm: ReadableStream<Uint8Array>) {
  const response = new Response(wasm, {
    headers: { "content-type": "application/wasm" },
  });
  if ("compileStreaming" in WebAssembly) {
    return WebAssembly.compileStreaming(response);
  }
  return response.arrayBuffer().then((b) => WebAssembly.compile(b));
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

let vtglLoading: Promise<unknown> | null = null;

/**
 * The vtgl renderer provider, or undefined when the build has none or it
 * fails to load. webterm then draws with WebGL. The file is about 900 KB, so
 * it is fetched only when a page asks for vtgl, and once per page.
 */
function loadVtgl(manifest: EngineManifest): Promise<unknown> {
  if (!manifest.vtgl) return Promise.resolve(undefined);
  if (!vtglLoading) {
    vtglLoading = addScript(`${manifest.base}${manifest.vtgl}`).then(
      () => window.WebTermVtgl?.vtgl(),
      (err) => {
        console.warn("learn: the vtgl renderer did not load", err);
        return undefined;
      },
    );
  }
  return vtglLoading;
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
  const prefer =
    new URLSearchParams(location.search).get("renderer") ?? "webgl";
  const vtgl = prefer === "vtgl" ? await loadVtgl(manifest) : undefined;
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
    renderer: { prefer, vtgl },
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
    // tuios sends one write per frame. webterm holds a write until the next
    // animation frame and xterm paints it on the frame after, so without the
    // flush every echo waits a frame more than it needs to.
    void term.flush?.();
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
  const handle = { api, term, log };
  const page = window as unknown as { tuiosLearn?: unknown };
  page.tuiosLearn = handle;
  // The hub's hero runs one too, so tests/learn/tracks.ts finds the
  // lesson's from its terminal.
  (host as HTMLElement & { tuiosLearn?: unknown }).tuiosLearn = handle;

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
      log.length = 0;
      frameListeners.length = 0;
      if (page.tuiosLearn === handle) page.tuiosLearn = undefined;
      // Learn mode turns every quit into a note, so stop is the only way to
      // end the program. Once it has ended and nothing here holds the api,
      // the browser frees its memory. An engine without stop keeps running
      // until the page closes.
      if (!hasExited) {
        try {
          api.stop?.();
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
