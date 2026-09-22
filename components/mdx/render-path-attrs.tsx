"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * One line of styled terminal text drawn the way each tuios render path drew
 * it before and after fb8735a6. The paths and their variants are the ten cases
 * of TestEveryRenderPathKeepsTextAttributes in internal/app/render_attrs_test.go.
 *
 * Before the fix a pane reached the screen through one of three style
 * builders:
 * - the emulator's own Render (unfocused fast path): every attribute kept;
 * - the cell loop with buildCellStyle: underline, its style and its colour
 *   dropped, the rest kept;
 * - the cell loop with buildOptimizedCellStyle, used when the pane was
 *   unfocused and the app was not in terminal mode: colours only.
 * After the fix every path keeps every attribute.
 */

type Attr = "underline" | "curly" | "bold" | "italic" | "reverse" | "strike";

interface Run {
  text: string;
  attr: Attr;
  label: string;
}

// The runs follow the test's attrsLine, minus faint and blink, which do not
// read well at this size.
const RUNS: Run[] = [
  { text: "under", attr: "underline", label: "underline" },
  { text: "curl", attr: "curly", label: "curly underline, red" },
  { text: "bold", attr: "bold", label: "bold" },
  { text: "ital", attr: "italic", label: "italic" },
  { text: "rev", attr: "reverse", label: "reverse" },
  { text: "strike", attr: "strike", label: "strikethrough" },
];

type Builder = "emulator" | "cell" | "optimized";

const BUILDERS: Record<Builder, { name: string; keeps: Set<Attr> }> = {
  emulator: {
    name: "the emulator's own Render",
    keeps: new Set([
      "underline",
      "curly",
      "bold",
      "italic",
      "reverse",
      "strike",
    ]),
  },
  cell: {
    name: "cell loop, buildCellStyle",
    keeps: new Set(["bold", "italic", "reverse", "strike"]),
  },
  optimized: {
    name: "cell loop, buildOptimizedCellStyle",
    keeps: new Set(),
  },
};

interface Variant {
  label: string;
  /** The builder this case went through before the fix. */
  before: Builder;
  /** The builder after the fix. The optimized one no longer exists. */
  after: Builder;
}

interface Path {
  id: string;
  label: string;
  /** What the variant switch chooses between. */
  axis: string;
  variants: [Variant, Variant];
  dimmed?: boolean;
}

const PATHS: Path[] = [
  {
    id: "focused",
    label: "focused",
    axis: "app mode",
    variants: [
      { label: "terminal mode", before: "cell", after: "cell" },
      { label: "window mode", before: "cell", after: "cell" },
    ],
  },
  {
    id: "unfocused",
    label: "unfocused",
    axis: "app mode",
    variants: [
      { label: "terminal mode", before: "emulator", after: "emulator" },
      { label: "window mode", before: "emulator", after: "emulator" },
    ],
  },
  {
    id: "dimmed",
    label: "dimmed",
    axis: "app mode",
    dimmed: true,
    variants: [
      { label: "terminal mode", before: "cell", after: "cell" },
      { label: "window mode", before: "optimized", after: "cell" },
    ],
  },
  {
    id: "copy",
    label: "copy mode",
    axis: "pane",
    variants: [
      { label: "focused", before: "cell", after: "cell" },
      { label: "unfocused", before: "optimized", after: "cell" },
    ],
  },
  {
    id: "scrollback",
    label: "scrollback",
    axis: "pane",
    variants: [
      { label: "focused", before: "cell", after: "cell" },
      { label: "unfocused", before: "optimized", after: "cell" },
    ],
  },
];

// xterm colour 196, the underline colour the test line asks for.
const UNDERLINE_RED = "#ff0000";

function runStyle(attr: Attr, kept: boolean): React.CSSProperties {
  if (!kept) return {};
  switch (attr) {
    case "underline":
      return { textDecorationLine: "underline", textUnderlineOffset: "0.2em" };
    case "curly":
      return {
        textDecorationLine: "underline",
        textDecorationStyle: "wavy",
        textDecorationColor: UNDERLINE_RED,
        textUnderlineOffset: "0.2em",
      };
    case "bold":
      return { fontWeight: 700 };
    case "italic":
      return { fontStyle: "italic" };
    case "reverse":
      return {
        backgroundColor: "var(--rpa-fg)",
        color: "var(--rpa-bg)",
      };
    case "strike":
      return { textDecorationLine: "line-through" };
  }
}

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 font-mono text-xs text-fd-muted-foreground">
        {label}
      </span>
      <fieldset
        className="m-0 inline-flex min-w-0 flex-wrap overflow-hidden rounded-md border border-fd-border p-0"
        aria-label={label}
      >
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "px-2.5 py-1.5 font-mono text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-fd-primary motion-reduce:transition-none",
              value === o.value
                ? "bg-fd-primary text-fd-primary-foreground"
                : "text-fd-muted-foreground hover:text-fd-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </fieldset>
    </div>
  );
}

export function RenderPathAttrs() {
  const [pathId, setPathId] = useState("focused");
  const [variantIdx, setVariantIdx] = useState(0);
  const [fixed, setFixed] = useState(false);
  const statusId = useId();

  const path = PATHS.find((p) => p.id === pathId) ?? PATHS[0];
  const variant = path.variants[variantIdx];
  // After the fix buildCellStyle maps every attribute, so it keeps what the
  // emulator's renderer keeps.
  const builder = fixed
    ? {
        name:
          variant.after === "emulator"
            ? BUILDERS.emulator.name
            : "cell loop, buildCellStyle",
        keeps: BUILDERS.emulator.keeps,
      }
    : BUILDERS[variant.before];
  const kept = (attr: Attr) => builder.keeps.has(attr);
  const keptCount = RUNS.filter((r) => kept(r.attr)).length;

  const lineLabel = RUNS.map(
    (r) => `${r.text}: ${kept(r.attr) ? r.label : "plain"}`,
  ).join(", ");

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-2 border-b border-fd-border px-4 py-3">
        <Segmented
          label="path"
          options={PATHS.map((p) => ({ label: p.label, value: p.id }))}
          value={pathId}
          onChange={setPathId}
        />
        <Segmented
          label={path.axis}
          options={path.variants.map((v, i) => ({ label: v.label, value: i }))}
          value={variantIdx}
          onChange={setVariantIdx}
        />
        <Segmented
          label="code"
          options={[
            { label: "before fb8735a6", value: 0 },
            { label: "after", value: 1 },
          ]}
          value={fixed ? 1 : 0}
          onChange={(v) => setFixed(v === 1)}
        />
      </div>

      <div className="bg-fd-background/40 p-3 sm:p-4">
        <div
          className={cn(
            "overflow-x-auto rounded-md border border-fd-border/70 bg-fd-background px-3 py-4 font-mono text-sm sm:text-base",
            "[--rpa-bg:var(--color-fd-background)]",
            path.dimmed
              ? "[--rpa-fg:var(--color-fd-muted-foreground)]"
              : "[--rpa-fg:var(--color-fd-foreground)]",
          )}
          style={{ color: "var(--rpa-fg)" }}
          role="img"
          aria-label={`The line as drawn: ${lineLabel}.`}
          aria-describedby={statusId}
        >
          <span className="whitespace-pre">
            {RUNS.map((r, i) => (
              <span key={r.text}>
                <span style={runStyle(r.attr, kept(r.attr))}>{r.text}</span>
                {i < RUNS.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        </div>
      </div>

      <div className="border-t border-fd-border px-4 py-3">
        <p
          id={statusId}
          aria-live="polite"
          className="mb-3 font-mono text-xs text-fd-muted-foreground"
        >
          style from: <span className="text-fd-foreground">{builder.name}</span>
          <span className="ml-2 tabular-nums">
            ({keptCount} of {RUNS.length} kept)
          </span>
        </p>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs sm:grid-cols-3">
          {RUNS.map((r) => (
            <li key={r.text} className="flex items-baseline gap-2">
              <span
                className={cn(
                  "w-14 shrink-0",
                  kept(r.attr) ? "text-fd-foreground" : "text-fd-primary",
                )}
              >
                {kept(r.attr) ? "kept" : "dropped"}
              </span>
              <span className="text-fd-muted-foreground">{r.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        The same line through each way tuios drew a pane. Before the fix, the
        answer depended on which style builder the path used. Switch between{" "}
        <strong>focused</strong> and <strong>unfocused</strong> to see what a
        focus change did to it. Dimming changes the colours on purpose, and
        nothing else.
      </figcaption>
    </figure>
  );
}
