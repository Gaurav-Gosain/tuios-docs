"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * One scrollback line in the three encodings tuios has used, computed the way
 * internal/vt/scrollback.go computes them:
 *
 * - uv.Cell: every column of the line, 112 bytes each, whatever is on it.
 * - packed (0b4e48c3): 24 bytes a cell, up to the last cell that is not a
 *   plain blank.
 * - text (d43d18b1): the width as a uvarint, then the cells as UTF-8, with a
 *   token starting 0xF8 to 0xFF wherever the style, the link or the cell
 *   width is something a plain byte cannot say.
 *
 * The byte strips were checked against the Go encoder for every preset. Cell
 * widths for typed text come from a small table here rather than from the
 * emulator's width tables, so an unusual character can come out a column off.
 */

type Color =
  | { kind: "basic"; v: number }
  | { kind: "indexed"; v: number }
  | { kind: "true"; v: number };

interface Segment {
  text: string;
  fg?: Color;
  bold?: boolean;
}

interface Cell {
  content: string;
  width: number;
  fg?: Color;
  bold: boolean;
}

export const PRESETS: { id: string; label: string; segments: Segment[] }[] = [
  {
    id: "log",
    label: "build log",
    segments: [
      {
        text: "go: downloading github.com/charmbracelet/ultraviolet v0.0.0-20260812204455-68fa937c71be; compiling internal/vt, internal/session and internal/terminal for darwin/arm64 (cgo 0)",
      },
    ],
  },
  {
    id: "ls",
    label: "colored ls row",
    segments: [
      { text: "drwxr-xr-x  12 gaurav  staff   384 Sep  6 12:15 " },
      { text: "internal", fg: { kind: "basic", v: 4 }, bold: true },
      { text: "  " },
      { text: "run.sh", fg: { kind: "basic", v: 2 }, bold: true },
    ],
  },
  {
    id: "prompt",
    label: "truecolor prompt",
    segments: [
      { text: "~/dev/tuios", fg: { kind: "true", v: 0x7aa2f7 }, bold: true },
      { text: " on " },
      { text: "main", fg: { kind: "true", v: 0xbb9af7 } },
      { text: " via " },
      { text: "go 1.25", fg: { kind: "indexed", v: 81 } },
      { text: " > " },
      { text: "git status", fg: { kind: "basic", v: 10 } },
    ],
  },
  {
    id: "cjk",
    label: "CJK",
    segments: [{ text: "ビルド完了: 漢字のテスト 12 件 成功" }],
  },
  {
    id: "redcjk",
    label: "red CJK",
    segments: [{ text: "漢字のテスト", fg: { kind: "basic", v: 1 } }],
  },
  {
    id: "emoji",
    label: "emoji",
    segments: [{ text: "tests ✅ 142 passed 👩‍💻 on 🇬🇧 runner" }],
  },
];

const WIDTHS = [80, 120, 207];
const UV_CELL = 112;
const PACKED_CELL = 24;

function isWide(cp: number): boolean {
  return (
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0x303e) ||
    (cp >= 0x3041 && cp <= 0x33ff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0xa000 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe30 && cp <= 0xfe4f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6) ||
    (cp >= 0x1f1e6 && cp <= 0x1f1ff) ||
    (cp >= 0x20000 && cp <= 0x3fffd)
  );
}

const EMOJI_PRESENTATION = /\p{Emoji_Presentation}/u;

function graphemeWidth(g: string): number {
  const cp = g.codePointAt(0) ?? 0;
  if (cp < 0x20 || (cp >= 0x7f && cp < 0xa0)) return 0;
  if (
    g.includes(String.fromCharCode(0x200d)) ||
    g.includes(String.fromCharCode(0xfe0f))
  )
    return 2;
  if (EMOJI_PRESENTATION.test(g)) return 2;
  return isWide(cp) ? 2 : 1;
}

function graphemes(s: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(s), (x) => x.segment);
  }
  return Array.from(s);
}

/** Lay segments out on a line of the given width, as uv.Line.Set does. */
export function layout(segments: Segment[], width: number): Cell[] {
  const line: Cell[] = Array.from({ length: width }, () => ({
    content: " ",
    width: 1,
    bold: false,
  }));
  let x = 0;
  for (const s of segments) {
    for (const g of graphemes(s.text)) {
      const w = graphemeWidth(g);
      if (w === 0) continue;
      if (x + w > width) return line;
      line[x] = { content: g, width: w, fg: s.fg, bold: !!s.bold };
      // A wide cell is followed by zero-width placeholders with no style.
      for (let j = 1; j < w; j++)
        line[x + j] = { content: "", width: 0, bold: false };
      x += w;
    }
  }
  return line;
}

function isBlank(c: Cell) {
  return c.content === " " && c.width === 1 && !c.fg && !c.bold;
}

function trimmedLength(line: Cell[]) {
  let n = line.length;
  while (n > 0 && isBlank(line[n - 1])) n--;
  return n;
}

function uvarint(v: number): number[] {
  const out: number[] = [];
  while (v >= 0x80) {
    out.push((v % 0x80) | 0x80);
    v = Math.floor(v / 0x80);
  }
  out.push(v);
  return out;
}

function utf8(s: string): number[] {
  return Array.from(new TextEncoder().encode(s));
}

/**
 * The tag for each colour kind. The emulator turns SGR 38;2 into a color.RGBA,
 * which packs under tag 4, not the ansi.TrueColor tag 3.
 */
function colorTag(c: Color): number {
  return c.kind === "basic" ? 1 : c.kind === "indexed" ? 2 : 4;
}

/** The text encoding's colour packing: the tag in the low three bits. */
function packColorText(c?: Color): number {
  if (!c) return 0;
  const tag = colorTag(c);
  return c.v * 8 + tag;
}

/** The 24-byte cell's colour packing: the tag in the top three bits. */
function packColor24(c?: Color): number {
  if (!c) return 0;
  const tag = colorTag(c);
  return (tag * 0x20000000 + c.v) >>> 0;
}

type Kind = "header" | "text" | "token" | "payload";
interface Byte {
  v: number;
  kind: Kind;
}

export function encodeText(line: Cell[], width: number): Byte[] {
  const out: Byte[] = [];
  const push = (bytes: number[], kind: Kind) => {
    for (const v of bytes) out.push({ v, kind });
  };
  push(uvarint(width), "header");
  const n = trimmedLength(line);
  let fg = 0;
  let attrs = 0;
  const interned = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    const c = line[i];
    const cfg = packColorText(c.fg);
    const cattrs = c.bold ? 1 : 0;
    if (cfg !== fg || cattrs !== attrs) {
      fg = cfg;
      attrs = cattrs;
      push([0xff], "token");
      push([...uvarint(cfg), 0, 0, cattrs, 0], "payload");
    }
    if (c.width !== 1) {
      push([0xfd], "token");
      push([c.width], "payload");
    }
    const cps = Array.from(c.content);
    if (c.content === "") {
      push([0xfb], "token");
    } else if (cps.length === 1) {
      push(utf8(c.content), "text");
    } else {
      let idx = interned.get(c.content);
      if (idx === undefined) {
        idx = interned.size;
        interned.set(c.content, idx);
      }
      push([0xfc], "token");
      push(uvarint(idx), "payload");
    }
  }
  return out;
}

function u32le(v: number): number[] {
  return [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
}

export function encodePacked(line: Cell[]): number[] {
  const out: number[] = [];
  const n = trimmedLength(line);
  const interned = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    const c = line[i];
    const cps = Array.from(c.content);
    let content = 0;
    if (cps.length === 1) content = c.content.codePointAt(0) ?? 0;
    else if (cps.length > 1) {
      let idx = interned.get(c.content);
      if (idx === undefined) {
        idx = interned.size;
        interned.set(c.content, idx);
      }
      content = (0x80000000 + idx) >>> 0;
    }
    out.push(
      ...u32le(content),
      ...u32le(packColor24(c.fg)),
      ...u32le(0),
      ...u32le(0),
      ...u32le(0),
      c.bold ? 1 : 0,
      0,
      c.width,
      0,
    );
  }
  return out;
}

function hex(v: number) {
  return v.toString(16).padStart(2, "0");
}

function formatBytes(b: number): string {
  if (b < 1e3) return `${b} B`;
  if (b < 1e6) return `${(b / 1e3).toFixed(1)} kB`;
  if (b < 1e9) return `${(b / 1e6).toFixed(1)} MB`;
  return `${(b / 1e9).toFixed(2)} GB`;
}

const BYTE_CLASS: Record<Kind, string> = {
  header: "text-fd-muted-foreground underline decoration-dotted",
  text: "text-fd-foreground",
  token:
    "rounded-sm bg-fd-primary px-0.5 font-semibold text-fd-primary-foreground",
  payload: "text-fd-primary",
};

const HEX_LIMIT = 96;

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label
        htmlFor={id}
        className="flex justify-between gap-2 text-xs text-fd-muted-foreground"
      >
        <span>{label}</span>
        <span className="font-mono text-fd-foreground tabular-nums">
          {display}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-fd-primary"
      />
    </div>
  );
}

const LINE_STEPS = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

export function ScrollbackBytes() {
  const [preset, setPreset] = useState("log");
  const [custom, setCustom] = useState("");
  const [width, setWidth] = useState(207);
  const [lineStep, setLineStep] = useState(3);
  const [panes, setPanes] = useState(1);
  const [copies, setCopies] = useState(2);
  const inputId = useId();

  const { cells, used, text, packed } = useMemo(() => {
    const segments: Segment[] =
      preset === "custom"
        ? [{ text: custom }]
        : (PRESETS.find((p) => p.id === preset)?.segments ?? []);
    const line = layout(segments, width);
    return {
      cells: line,
      used: trimmedLength(line),
      text: encodeText(line, width),
      packed: encodePacked(line),
    };
  }, [preset, custom, width]);

  const lines = LINE_STEPS[lineStep];
  const copiesTotal = lines * panes * copies;
  const rows = [
    { id: "uv", label: "uv.Cell, every column", perLine: width * UV_CELL },
    { id: "packed", label: "packed, 24 B a cell", perLine: packed.length },
    { id: "text", label: "text and tokens", perLine: text.length },
  ];
  const maxTotal = Math.max(1, ...rows.map((r) => r.perLine * copiesTotal));
  const tokens = text.filter((b) => b.kind === "token").length;
  const preview = cells
    .slice(0, used)
    .map((c) => c.content)
    .join("");

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-3 p-4">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Line to store</legend>
          {[
            ...PRESETS.map((p) => ({ id: p.id, label: p.label })),
            { id: "custom", label: "type your own" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p.id === preset}
              onClick={() => setPreset(p.id)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary",
                p.id === preset
                  ? "border-fd-primary/60 text-fd-foreground"
                  : "border-fd-border text-fd-muted-foreground hover:border-fd-primary/40",
              )}
            >
              {p.label}
            </button>
          ))}
        </fieldset>
        {preset === "custom" ? (
          <div className="flex flex-col gap-1">
            <label
              htmlFor={inputId}
              className="text-xs text-fd-muted-foreground"
            >
              A line of plain text (no colour)
            </label>
            <input
              id={inputId}
              type="text"
              value={custom}
              maxLength={400}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="type anything, try 漢字 or 🦀"
              className="w-full rounded-md border border-fd-border bg-fd-background px-3 py-1.5 font-mono text-sm text-fd-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
            />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 text-xs text-fd-muted-foreground">
          <span>pane width</span>
          {WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              aria-pressed={w === width}
              onClick={() => setWidth(w)}
              className={cn(
                "rounded border px-2 py-0.5 font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary",
                w === width
                  ? "border-fd-primary/60 text-fd-foreground"
                  : "border-fd-border",
              )}
            >
              {w}
            </button>
          ))}
          <span className="ml-auto font-mono">
            {used} of {width} columns used
          </span>
        </div>
        <div className="overflow-x-auto whitespace-pre rounded border border-fd-border bg-fd-background px-3 py-2 font-mono text-sm text-fd-foreground">
          <span className="sr-only">The line as it appears on screen: </span>
          {preview || " "}
        </div>
      </div>

      <div className="grid gap-4 border-t border-fd-border p-4 md:grid-cols-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium text-fd-foreground">uv.Cell</span>
            <span className="font-mono tabular-nums text-fd-foreground">
              {(width * UV_CELL).toLocaleString("en-GB")} B
            </span>
          </div>
          <p className="mb-2 text-xs text-fd-muted-foreground">
            {width} columns x 112 bytes. Strings, colour interfaces and a link
            per cell, blank or not.
          </p>
          <div
            className="grid gap-px"
            style={{ gridTemplateColumns: "repeat(23, minmax(0, 1fr))" }}
            aria-hidden="true"
          >
            {cells.map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional
                key={i}
                className={cn(
                  "h-1.5 rounded-[1px]",
                  i < used ? "bg-fd-primary" : "bg-fd-muted-foreground/35",
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-fd-muted-foreground">
            One square a column. Grey ones cost the same.
          </p>
        </div>

        <div className="min-w-0">
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium text-fd-foreground">packed cell</span>
            <span className="font-mono tabular-nums text-fd-foreground">
              {packed.length.toLocaleString("en-GB")} B
            </span>
          </div>
          <p className="mb-2 text-xs text-fd-muted-foreground">
            {used} cells x {PACKED_CELL} bytes: rune, three colours, link,
            attrs, underline, width.
          </p>
          <div className="flex flex-wrap gap-x-[0.4em] font-mono text-[11px] leading-5 text-fd-muted-foreground">
            {packed.slice(0, HEX_LIMIT).map((v, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: bytes are positional
                key={i}
                className={cn(
                  Math.floor(i / 24) % 2 === 0
                    ? "text-fd-foreground"
                    : "text-fd-muted-foreground",
                )}
              >
                {hex(v)}
              </span>
            ))}
            {packed.length > HEX_LIMIT ? (
              <span>+{packed.length - HEX_LIMIT} more</span>
            ) : null}
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium text-fd-foreground">
              text and tokens
            </span>
            <span className="font-mono tabular-nums text-fd-foreground">
              {text.length.toLocaleString("en-GB")} B
            </span>
          </div>
          <p className="mb-2 text-xs text-fd-muted-foreground">
            Width header, UTF-8, and {tokens}{" "}
            {tokens === 1 ? "token" : "tokens"} from 0xF8 to 0xFF.
          </p>
          <div className="flex flex-wrap gap-x-[0.4em] font-mono text-[11px] leading-5">
            {text.slice(0, HEX_LIMIT).map((b, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: bytes are positional
                key={i}
                className={BYTE_CLASS[b.kind]}
              >
                {hex(b.v)}
              </span>
            ))}
            {text.length > HEX_LIMIT ? (
              <span className="text-fd-muted-foreground">
                +{text.length - HEX_LIMIT} more
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-fd-muted-foreground">
            <span>
              <span className={BYTE_CLASS.header}>
                {text
                  .filter((b) => b.kind === "header")
                  .map((b) => hex(b.v))
                  .join(" ")}
              </span>{" "}
              width {width}
            </span>
            <span>
              <span className={BYTE_CLASS.token}>ff</span> token
            </span>
            <span>
              <span className={BYTE_CLASS.payload}>01</span> its payload
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-fd-border p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Slider
            label="lines of scrollback"
            value={lineStep}
            min={0}
            max={LINE_STEPS.length - 1}
            step={1}
            onChange={setLineStep}
            display={lines.toLocaleString("en-GB")}
          />
          <Slider
            label="panes"
            value={panes}
            min={1}
            max={16}
            step={1}
            onChange={setPanes}
            display={String(panes)}
          />
          <Slider
            label="copies (daemon + clients)"
            value={copies}
            min={1}
            max={4}
            step={1}
            onChange={setCopies}
            display={String(copies)}
          />
        </div>
        <div className="flex flex-col gap-2">
          {rows.map((r) => {
            const total = r.perLine * copiesTotal;
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1"
              >
                <span className="w-full text-xs text-fd-muted-foreground sm:w-40">
                  {r.label}
                </span>
                <div
                  className="h-4 min-w-0 flex-1 rounded-sm bg-fd-muted/60"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "h-full rounded-sm motion-safe:transition-[width] motion-safe:duration-300",
                      r.id === "text"
                        ? "bg-fd-primary"
                        : "bg-fd-muted-foreground/45",
                    )}
                    style={{
                      width: `${Math.max(0.4, (total / maxTotal) * 100)}%`,
                    }}
                  />
                </div>
                <span
                  className="w-24 text-right font-mono text-xs tabular-nums text-fd-foreground"
                  aria-live="polite"
                >
                  {formatBytes(total)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        Every line of the ring is assumed to be this one. The totals are the
        encoded bytes; the heap rounds each allocation up to a Go size class and
        adds a slice header per line, which is how a 175-character line of 177
        encoded bytes costs 216 on the heap. Payload bytes can also fall in 0xF8
        to 0xFF (a truecolour value often does); only a byte where a cell would
        start is read as a token. Widths of typed text are approximate.
      </figcaption>
    </figure>
  );
}
