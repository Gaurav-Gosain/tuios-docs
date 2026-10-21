"use client";

/**
 * The sketch playground: type Mermaid on the left, see tuios.dev/sketch draw
 * it on the right. sketch runs as WebAssembly in a Web Worker
 * (lib/sketch/engine.ts), so typing never waits on a render. Each new drawing
 * morphs from the last one (lib/sketch/morph.ts). An error keeps the last
 * good drawing on screen and marks its line in the editor.
 */
import { Check, Copy, Download, Image as ImageIcon, Link2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type NamedTheme,
  type RenderError,
  SketchEngine,
} from "@/lib/sketch/engine";
import { DEFAULT_EXAMPLE, EXAMPLES, GROUPS } from "@/lib/sketch/examples";
import { type Motion, morph, snapshot } from "@/lib/sketch/morph";
import { sanitizeSvg } from "@/lib/sketch/sanitize";
import { decodeHash, encodeHash } from "@/lib/sketch/share";
import "./sketch-playground.css";

const SketchEditor = dynamic(
  () => import("./sketch-editor").then((m) => m.SketchEditor),
  { ssr: false, loading: () => <div className="h-full" /> },
);

/** The theme that follows the site: Catppuccin, as the docs are. */
const SITE = "site";
const SITE_LIGHT = "catppuccin-latte";
const SITE_DARK = "catppuccin-mocha";

/** The font sketch measures labels for, metric-compatible with Arial. */
const FONT = 'Arial, "Liberation Sans", Arimo, Helvetica, sans-serif';

/** The wait after a key before a render. Short: the worker is fast. */
const DEBOUNCE = 90;

/** The wait before an error shows, so typing does not flash errors. */
const ERROR_DELAY = 450;

/**
 * The morph runs on the main thread and measures every object. Above these
 * sizes a new drawing replaces the old one at once, as with reduced motion.
 */
const MORPH_MAX_OBJECTS = 300;
const MORPH_MAX_BYTES = 200_000;

/** The wait after the last resize step before a drawing is redrawn. */
const RESIZE_DELAY = 250;

/** What a visitor sees when the renderer does not start. */
const LOAD_FAILED =
  "The diagram renderer did not load. Reload the page to try again.";

type Drawn = { svg: string; width: number; height: number; type: string };

type Status = { phase: "loading" } | { phase: "failed" } | { phase: "ready" };

const TYPE_NAMES: Record<string, string> = {
  flowchart: "Flowchart",
  "flowchart-v2": "Flowchart",
  graph: "Flowchart",
  sequence: "Sequence diagram",
  state: "State diagram",
  stateDiagram: "State diagram",
  class: "Class diagram",
  classDiagram: "Class diagram",
  er: "ER diagram",
  pie: "Pie chart",
  mindmap: "Mindmap",
  gantt: "Gantt chart",
  xychart: "XY chart",
  timeline: "Timeline",
  quadrantChart: "Quadrant chart",
  journey: "User journey",
  kanban: "Kanban board",
  gitGraph: "Git graph",
  sankey: "Sankey diagram",
  block: "Block diagram",
  architecture: "Architecture diagram",
  requirement: "Requirement diagram",
  c4: "C4 diagram",
  packet: "Packet diagram",
  radar: "Radar chart",
  treemap: "Treemap",
  info: "Info",
  treeView: "Tree view",
  ishikawa: "Ishikawa diagram",
  cynefin: "Cynefin diagram",
  eventmodeling: "Event model",
  venn: "Venn diagram",
  wardley: "Wardley map",
  railroad: "Railroad diagram",
  swimlane: "Swimlane diagram",
  usecase: "Use case diagram",
  agentflow: "Agent flow",
};

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * The first line of an error, and the rest, which shows where it is. pele
 * writes the source line with a caret under it. At the end of the text the
 * source line is empty, and a caret under nothing says nothing, so it goes.
 */
function splitError(e: RenderError) {
  const [head, ...rest] = e.message.split("\n");
  const lines: string[] = [];
  for (const line of rest) {
    if (/^-*\^$/.test(line) && !lines.at(-1)?.trim()) {
      lines.pop();
      continue;
    }
    lines.push(line);
  }
  return { head, detail: lines.join("\n").trim() };
}

export function SketchPlayground() {
  const [code, setCode] = useState(DEFAULT_EXAMPLE.source);
  const [themeName, setThemeName] = useState(SITE);
  const [themes, setThemes] = useState<NamedTheme[]>([]);
  const [status, setStatus] = useState<Status>({ phase: "loading" });
  const [error, setError] = useState<RenderError | null>(null);
  const [drawn, setDrawn] = useState<Drawn | null>(null);
  const [ms, setMs] = useState(0);
  const [bytes, setBytes] = useState(0);
  const [copied, setCopied] = useState<"" | "link" | "svg" | "png">("");
  const [restored, setRestored] = useState(false);
  const [stageWidth, setStageWidth] = useState(0);
  const [note, setNote] = useState("");
  const { resolvedTheme } = useTheme();

  const engine = useRef<SketchEngine | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const motion = useRef<Motion | null>(null);
  const seq = useRef(0);
  const last = useRef<Drawn | null>(null);
  const errorTimer = useRef(0);

  // The engine, and the diagram a shared link carries.
  useEffect(() => {
    let live = true;
    (async () => {
      const shared = await decodeHash(window.location.hash).catch(() => null);
      if (!live) return;
      if (shared) {
        setCode(shared.code);
        if (shared.theme) setThemeName(shared.theme);
      }
      setRestored(true);
      try {
        const e = await SketchEngine.load();
        if (!live) return;
        if (!e) {
          console.error(
            "sketch playground: this build has no engine. Build it with cmd/sketch-wasm/build.sh in tuios, then run bun scripts/sketch-engine.mjs <build-dir>.",
          );
          setStatus({ phase: "failed" });
          return;
        }
        engine.current = e;
        setBytes(e.bytes);
        const list = await e.start();
        if (!live) return;
        setThemes(list);
        // A link can name a theme that does not exist.
        if (shared?.theme && !list.some((t) => t.name === shared.theme)) {
          setThemeName(SITE);
          setNote(
            "This link names a theme that does not exist. The drawing uses the site theme.",
          );
        }
        setStatus({ phase: "ready" });
      } catch (err) {
        console.error("sketch playground: the renderer did not start:", err);
        if (live) setStatus({ phase: "failed" });
      }
    })();
    return () => {
      live = false;
      engine.current?.stop();
    };
  }, []);

  const fit = useCallback((svg: SVGSVGElement | null, d: Drawn) => {
    const el = stage.current;
    if (!el || !svg) return;
    const pad = el.clientWidth < 480 ? 16 : 32;
    const w = Math.max(1, el.clientWidth - pad * 2);
    const h = Math.max(1, el.clientHeight - pad * 2);
    const s = Math.min(w / d.width, h / d.height, 1.2);
    svg.style.maxWidth = "none";
    svg.style.width = `${d.width * s}px`;
    svg.style.height = `${d.height * s}px`;
  }, []);

  // The stage width, in steps, for diagrams that can draw narrower.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    // The drawing is fitted at once, which is cheap. A new layout for the new
    // width waits for the resize to stop.
    let t = 0;
    const ro = new ResizeObserver(() => {
      if (last.current)
        fit(el.querySelector("svg[data-current]"), last.current);
      window.clearTimeout(t);
      t = window.setTimeout(
        () => setStageWidth(Math.floor(el.clientWidth / 40) * 40),
        RESIZE_DELAY,
      );
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [fit]);

  /**
   * Puts a new drawing on the stage, morphing from the one there. False when
   * the SVG did not survive the cleaner.
   */
  const show = useCallback(
    (d: Drawn): boolean => {
      const el = stage.current;
      if (!el) return true;
      // A shared link puts someone else's diagram here: only a cleaned copy
      // of the SVG goes into the page.
      const svg = sanitizeSvg(d.svg);
      if (!svg) return false;
      svg.setAttribute("data-current", "");
      svg.setAttribute("aria-label", "Diagram preview");

      const old = el.querySelector<SVGSVGElement>("svg[data-current]");
      const big = (s: Element | null) =>
        !!s && s.querySelectorAll("g[data-id]").length > MORPH_MAX_OBJECTS;
      const still =
        reducedMotion() ||
        d.svg.length > MORPH_MAX_BYTES ||
        big(svg) ||
        big(old);
      const from = old && !still ? snapshot(old) : new Map();
      motion.current?.stop();
      motion.current = null;
      for (const g of el.querySelectorAll("svg[data-ghost]")) g.remove();

      if (old) {
        if (still) {
          old.remove();
        } else {
          // The old drawing stays where it is, on top, while it fades out.
          const r = old.getBoundingClientRect();
          const s = el.getBoundingClientRect();
          old.removeAttribute("data-current");
          old.setAttribute("data-ghost", "");
          old.setAttribute("aria-hidden", "true");
          Object.assign(old.style, {
            position: "absolute",
            left: `${r.left - s.left}px`,
            top: `${r.top - s.top}px`,
            width: `${r.width}px`,
            height: `${r.height}px`,
            pointerEvents: "none",
          });
        }
      }
      fit(svg, d);
      el.prepend(svg);
      last.current = d;
      if (old && !still) {
        motion.current = morph(svg, from, old);
      }
      return true;
    },
    [fit],
  );

  // Render on each change, after a short pause.
  const narrow = stageWidth > 0 && stageWidth < 560 ? stageWidth - 32 : 0;
  useEffect(() => {
    if (status.phase !== "ready" || !restored) return;
    const id = ++seq.current;
    const t = window.setTimeout(async () => {
      const e = engine.current;
      if (!e) return;
      const r = await e.render(code, narrow ? { maxWidth: narrow } : {});
      if (id !== seq.current) return;
      setMs(r.ms);
      window.clearTimeout(errorTimer.current);
      if (r.ok) {
        setError(null);
        const d = {
          svg: r.svg,
          width: r.width,
          height: r.height,
          type: r.type,
        };
        if (show(d)) {
          setDrawn(d);
        } else {
          setError({ message: "This drawing cannot be shown.", code: "clean" });
        }
      } else if (r.error.code === "timeout" || r.error.code === "crash") {
        setError(r.error);
      } else {
        // A line half typed is an error for a moment. Wait before it shows.
        // sketch counts the newline it adds at the end as a line. An error
        // there is on the last line of the editor.
        const lines = code.split("\n").length;
        const at = Math.min(r.error.line ?? 0, lines);
        const e = {
          ...r.error,
          line: at,
          message: r.error.message.replace(/on line \d+/, `on line ${at}`),
        };
        errorTimer.current = window.setTimeout(() => setError(e), ERROR_DELAY);
      }
    }, DEBOUNCE);
    return () => window.clearTimeout(t);
  }, [code, narrow, status.phase, restored, show]);

  // Keep the link in the address bar current, without new history entries.
  useEffect(() => {
    if (!restored) return;
    const t = window.setTimeout(async () => {
      const hash = await encodeHash(code, themeName === SITE ? "" : themeName);
      history.replaceState(null, "", hash);
    }, 400);
    return () => window.clearTimeout(t);
  }, [code, themeName, restored]);

  const effective =
    themeName === SITE
      ? resolvedTheme === "dark"
        ? SITE_DARK
        : SITE_LIGHT
      : themeName;
  const theme = useMemo(
    () => themes.find((t) => t.name === effective),
    [themes, effective],
  );
  const vars = useMemo(() => {
    const v: Record<string, string> = { "--pele-font": FONT };
    if (theme) Object.assign(v, theme.vars);
    return v;
  }, [theme]);

  /** The SVG with the theme written in, for copy and download. */
  const exported = useCallback(() => {
    if (!drawn) return "";
    const root = sanitizeSvg(drawn.svg);
    if (!root) return "";
    root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    return new XMLSerializer().serializeToString(root);
  }, [drawn, vars]);

  const flash = (what: "link" | "svg" | "png") => {
    setCopied(what);
    window.setTimeout(() => setCopied(""), 1600);
  };

  const copyLink = async () => {
    const hash = await encodeHash(code, themeName === SITE ? "" : themeName);
    history.replaceState(null, "", hash);
    await navigator.clipboard.writeText(window.location.href);
    flash("link");
  };

  const copySvg = async () => {
    const svg = exported();
    if (!svg) return;
    await navigator.clipboard.writeText(svg);
    flash("svg");
  };

  // The SVG goes through a data: URL, not a blob: one: the site's CSP allows
  // data: images and blocks blob: ones.
  const renderPng = async (): Promise<Blob | null> => {
    if (!drawn) return null;
    const scale = 2;
    const pad = 16;
    const bytes = new TextEncoder().encode(exported());
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    const img = new Image();
    img.decoding = "async";
    img.src = `data:image/svg+xml;base64,${btoa(bin)}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil((drawn.width + pad * 2) * scale);
    canvas.height = Math.ceil((drawn.height + pad * 2) * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = vars["--pele-bg"] ?? "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      pad * scale,
      pad * scale,
      drawn.width * scale,
      drawn.height * scale,
    );
    return new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  };

  const downloadPng = async () => {
    const blob = await renderPng();
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${drawn?.type || "diagram"}.png`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const copyPng = async () => {
    if (!drawn) return;
    // Safari needs the ClipboardItem to be made inside the click, with the
    // image still a promise.
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": renderPng().then((b) => {
          if (!b) throw new Error("no image");
          return b;
        }),
      }),
    ]);
    flash("png");
  };

  const exampleId = EXAMPLES.find((e) => e.source === code)?.id ?? "";
  const err = error ? splitError(error) : null;
  const typeName = drawn ? (TYPE_NAMES[drawn.type] ?? drawn.type) : "";

  return (
    <section
      className="sketch-playground not-prose"
      aria-label="Mermaid playground"
    >
      <div className="sp-toolbar">
        <label className="sp-field">
          <span>Example</span>
          <select
            value={exampleId}
            onChange={(e) => {
              const ex = EXAMPLES.find((x) => x.id === e.target.value);
              if (ex) setCode(ex.source);
            }}
          >
            {exampleId === "" && <option value="">Your diagram</option>}
            {GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {EXAMPLES.filter((ex) => ex.group === group).map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="sp-field">
          <span>Theme</span>
          <select
            value={themeName}
            onChange={(e) => {
              setThemeName(e.target.value);
              setNote("");
            }}
            disabled={themes.length === 0}
          >
            <option value={SITE}>Match the site</option>
            {themes.map((t) => (
              <option key={t.name} value={t.name}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <div className="sp-actions">
          <button type="button" onClick={copyLink} className="sp-button">
            {copied === "link" ? <Check aria-hidden /> : <Link2 aria-hidden />}
            <span>{copied === "link" ? "Link copied" : "Copy link"}</span>
          </button>
          <button
            type="button"
            onClick={copySvg}
            className="sp-button"
            disabled={!drawn}
          >
            {copied === "svg" ? <Check aria-hidden /> : <Copy aria-hidden />}
            <span>{copied === "svg" ? "SVG copied" : "Copy SVG"}</span>
          </button>
          <button
            type="button"
            onClick={copyPng}
            className="sp-button"
            disabled={!drawn}
          >
            {copied === "png" ? (
              <Check aria-hidden />
            ) : (
              <ImageIcon aria-hidden />
            )}
            <span>{copied === "png" ? "PNG copied" : "Copy PNG"}</span>
          </button>
          <button
            type="button"
            onClick={downloadPng}
            className="sp-button"
            disabled={!drawn}
          >
            <Download aria-hidden />
            <span>Download PNG</span>
          </button>
        </div>
      </div>

      {note && <output className="sp-note">{note}</output>}

      <div className="sp-panes">
        <div className="sp-editor">
          <div className="sp-editor-body">
            <SketchEditor
              value={code}
              onChange={setCode}
              errorAt={error?.line ?? 0}
              label="Mermaid source"
            />
          </div>
          <div
            className="sp-status"
            data-error={err ? "" : undefined}
            aria-live="polite"
          >
            {err ? (
              <>
                <p className="sp-status-head">{err.head}</p>
                {err.detail && <pre>{err.detail}</pre>}
              </>
            ) : status.phase === "ready" && drawn ? (
              <p>
                {typeName}
                <span className="sp-dim"> · drawn in {ms.toFixed(1)} ms</span>
              </p>
            ) : (
              <p className="sp-dim">Type Mermaid here.</p>
            )}
          </div>
        </div>

        <div
          className="sp-preview"
          style={vars as React.CSSProperties}
          data-stale={err ? "" : undefined}
        >
          <div ref={stage} className="sp-stage" />
          {status.phase !== "ready" && (
            <div className="sp-overlay">
              {status.phase === "loading" && (
                <p className="sp-loading">
                  Loading the renderer
                  {bytes > 0 && ` (${(bytes / 1e6).toFixed(1)} MB)`}
                </p>
              )}
              {status.phase === "failed" && <p>{LOAD_FAILED}</p>}
            </div>
          )}
          {err && drawn && <p className="sp-stale-note">Last good drawing</p>}
        </div>
      </div>
    </section>
  );
}
