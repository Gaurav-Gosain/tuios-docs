"use client";

/**
 * Runs hearsay, the mentions viewer, in the page, on the featured mentions.
 *
 * public/in-the-wild/engine.json names a content-hashed folder with the
 * wasm, Go's wasm_exec.js and sip's WebTerm renderer
 * (scripts/in-the-wild-engine.mjs writes it). The feed comes from
 * /in-the-wild/feed, which the Worker serves from the MEDIA bucket
 * (worker/wild.ts). The wasm arrives the way /learn's does: the Worker
 * answers <base>hearsay.wasm encoded, and a host without the Worker gets the
 * gzip file, unpacked here with DecompressionStream.
 *
 * With no feed or an empty one the page says so and starts nothing: the
 * viewer would otherwise show its own demo data. Triage in the viewer stays
 * in the visitor's localStorage.
 */

import { useEffect, useRef, useState } from "react";

type Manifest = {
  base: string;
  wasm: string;
  wasmEncoded?: string;
  fonts: { regular: string; bold: string };
};

type FeedItem = {
  id: string;
  source: string;
  kind: string;
  url: string;
  title: string;
  author?: string;
  published?: string;
};

type HearsayApi = {
  onOutput(fn: (bytes: Uint8Array) => void): void;
  input(data: Uint8Array | string): void;
  resize(cols: number, rows: number): void;
  stop?(): void;
};

type Term = {
  open(host: HTMLElement): Promise<void>;
  write(data: Uint8Array): void;
  flush?(): void;
  attach(t: {
    name: string;
    start(): void;
    send(b: Uint8Array): void;
    close(): void;
  }): void;
  on(event: "resize", fn: (s: { cols: number; rows: number }) => void): void;
  focus(): void;
  dispose(): void;
  cols: number;
  rows: number;
};

type WildWindow = Window & {
  Go?: new () => {
    importObject: WebAssembly.Imports;
    run(i: WebAssembly.Instance): Promise<void>;
  };
  WebTerm?: { WebTerm: new (options: unknown) => Term };
  hearsay?: HearsayApi;
  hearsayFeedText?: string;
  hearsayInitialSize?: [number, number];
  onHearsayReady?: (api: HearsayApi) => void;
};

type Phase = "loading" | "running" | "empty" | "missing" | "error";

export function WildViewer() {
  const host = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    const w = window as WildWindow;
    let term: Term | null = null;
    let gone = false;
    (async () => {
      const [feedRes, engineRes] = await Promise.all([
        fetch("/in-the-wild/feed").catch(() => null),
        fetch("/in-the-wild/engine.json", { cache: "no-cache" }).catch(
          () => null,
        ),
      ]);
      if (!feedRes?.ok) return setPhase("empty");
      const text = await feedRes.text();
      const feed = JSON.parse(text) as { items?: FeedItem[] };
      const list = Array.isArray(feed.items) ? feed.items : [];
      setItems(list);
      if (list.length === 0) return setPhase("empty");
      if (!engineRes?.ok) return setPhase("missing");
      const m = (await engineRes.json()) as Manifest;

      const [, module] = await Promise.all([
        Promise.all([
          addStylesheet(`${m.base}xterm.css`),
          addStylesheet(`${m.base}webterm.css`),
          addScript(`${m.base}wasm_exec.js`),
          addScript(`${m.base}webterm.js`),
        ]),
        fetchModule(m),
      ]);
      if (gone || !host.current || !w.Go || !w.WebTerm) return;
      const small = matchMedia("(max-width: 700px)").matches;
      term = new w.WebTerm.WebTerm({
        fontFamily: "JetBrainsMono Nerd Font Mono",
        fontSize: small ? 11 : 14,
        fonts: [
          {
            source: `url(${m.base}${m.fonts.regular}) format('woff2')`,
            weight: "400",
            style: "normal",
          },
          {
            source: `url(${m.base}${m.fonts.bold}) format('woff2')`,
            weight: "700",
            style: "normal",
          },
        ],
        renderer: { prefer: "webgl" },
        theme: { background: "#15141c", foreground: "#ebe8f7" },
        mouse: { suppressContextMenu: true },
        xterm: { macOptionIsMeta: true },
      });
      await term.open(host.current);
      const t = term;
      const go = new w.Go();
      const instance = await WebAssembly.instantiate(module, go.importObject);
      w.hearsayFeedText = text;
      w.hearsayInitialSize = [t.cols, t.rows];
      w.onHearsayReady = (api) => {
        api.onOutput((bytes) => {
          t.write(bytes);
          t.flush?.();
        });
        t.attach({
          name: "wasm",
          start() {},
          send(b) {
            api.input(b);
          },
          close() {},
        });
        t.on("resize", ({ cols, rows }) => api.resize(cols, rows));
        api.resize(t.cols, t.rows);
        setPhase("running");
      };
      go.run(instance);
    })().catch((err: unknown) => {
      console.error("in-the-wild:", err);
      if (!gone) setPhase("error");
    });
    return () => {
      gone = true;
      w.hearsay?.stop?.();
      term?.dispose();
    };
  }, []);

  return (
    <>
      <div className="relative h-[min(78vh,880px)] min-h-[420px] overflow-hidden rounded-xl border border-fd-border bg-[#15141c]">
        <div ref={host} className="absolute inset-2" />
        {phase !== "running" && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center font-mono text-[#9a97ad] text-sm">
            {message(phase)}
          </div>
        )}
      </div>
      {items.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-fd-muted-foreground text-sm">
            The same {items.length} mentions as a plain list
          </summary>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((it) => (
              <li key={it.id}>
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener"
                  className="text-fd-foreground underline underline-offset-2"
                >
                  {it.title}
                </a>
                <span className="text-fd-muted-foreground">
                  {it.author ? ` by ${it.author}` : ""}
                  {it.published ? `, ${it.published.slice(0, 10)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

function message(phase: Phase) {
  switch (phase) {
    case "empty":
      return "Nothing is featured yet. Check back soon.";
    case "missing":
      return "The viewer is not built in this copy of the site.";
    case "error":
      return "The viewer did not start. The list below has every mention.";
    default:
      return "Loading...";
  }
}

async function fetchModule(m: Manifest) {
  if (m.wasmEncoded) {
    const res = await fetch(`${m.base}${m.wasmEncoded}`).catch(() => null);
    if (
      res?.ok &&
      res.headers.get("content-type")?.includes("application/wasm")
    ) {
      return WebAssembly.compileStreaming(res);
    }
    await res?.body?.cancel();
  }
  const gz = await fetch(`${m.base}${m.wasm}`);
  if (!gz.ok || !gz.body) throw new Error(`cannot fetch ${m.wasm}`);
  const raw = new Response(
    gz.body.pipeThrough(new DecompressionStream("gzip")),
    { headers: { "content-type": "application/wasm" } },
  );
  return WebAssembly.compileStreaming(raw);
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
