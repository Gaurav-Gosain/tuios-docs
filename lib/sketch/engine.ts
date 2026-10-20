/**
 * Runs tuios.dev/sketch in a Web Worker for the playground.
 *
 * public/sketch-playground/engine.json names a content-hashed folder with the
 * wasm, Go's wasm_exec.js and lib/sketch/worker.js (scripts/sketch-engine.mjs
 * writes it). The worker compiles the wasm once and answers render requests.
 * A Go panic ends the program in the worker; the next render then starts a
 * new worker.
 */

export type EngineManifest = {
  base: string;
  worker: string;
  wasm: string;
  gz: string;
  gzipBytes: number;
  brotliBytes: number;
  rawBytes: number;
  commit: string;
};

export type NamedTheme = {
  name: string;
  title: string;
  dark: boolean;
  vars: Record<string, string>;
};

export type RenderError = {
  message: string;
  code: string;
  line?: number;
  column?: number;
};

export type RenderResult =
  | {
      ok: true;
      svg: string;
      width: number;
      height: number;
      type: string;
      ms: number;
    }
  | { ok: false; error: RenderError; ms: number };

type Pending = (r: RenderResult) => void;

const MANIFEST = "/sketch-playground/engine.json";

export class SketchEngine {
  private worker: Worker | null = null;
  private ready: Promise<NamedTheme[]> | null = null;
  private pending = new Map<number, Pending>();
  private next = 1;

  constructor(private manifest: EngineManifest) {}

  /** Loads the manifest; null when the site was built without the engine. */
  static async load(): Promise<SketchEngine | null> {
    const res = await fetch(MANIFEST, { cache: "no-cache" });
    if (!res.ok) return null;
    return new SketchEngine((await res.json()) as EngineManifest);
  }

  get bytes() {
    return this.manifest.brotliBytes || this.manifest.gzipBytes;
  }

  /** Starts the worker. Resolves with the named themes. */
  start(): Promise<NamedTheme[]> {
    if (this.ready) return this.ready;
    const m = this.manifest;
    const w = new Worker(`${m.base}${m.worker}`);
    this.worker = w;
    this.ready = new Promise<NamedTheme[]>((resolve, reject) => {
      w.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        if (msg.type === "ready") resolve(msg.themes as NamedTheme[]);
        else if (msg.type === "fail") reject(new Error(msg.error));
        else if (msg.type === "result")
          this.answer({ id: msg.id, ms: msg.ms, ...msg.out });
      };
      w.onerror = (e) => reject(new Error(e.message || "the worker failed"));
    });
    w.postMessage({ type: "init", base: m.base, wasm: m.wasm, gz: m.gz });
    return this.ready;
  }

  private answer(msg: {
    id: number;
    ms: number;
    svg?: string;
    width?: number;
    height?: number;
    type?: string;
    error?: RenderError;
  }) {
    const done = this.pending.get(msg.id);
    this.pending.delete(msg.id);
    if (msg.error?.code === "crash") this.restart();
    if (!done) return;
    if (msg.error) done({ ok: false, error: msg.error, ms: msg.ms });
    else
      done({
        ok: true,
        svg: msg.svg ?? "",
        width: msg.width ?? 0,
        height: msg.height ?? 0,
        type: msg.type ?? "",
        ms: msg.ms,
      });
  }

  private restart() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
    for (const done of this.pending.values()) {
      done({
        ok: false,
        error: { message: "The renderer stopped.", code: "crash" },
        ms: 0,
      });
    }
    this.pending.clear();
  }

  /** Draws a diagram. */
  async render(
    source: string,
    options: { maxWidth?: number; theme?: string } = {},
  ): Promise<RenderResult> {
    await this.start();
    const id = this.next++;
    return new Promise<RenderResult>((resolve) => {
      this.pending.set(id, resolve);
      this.worker?.postMessage({ type: "render", id, source, options });
    });
  }

  stop() {
    this.restart();
  }
}
