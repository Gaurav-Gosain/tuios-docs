"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The three tiling layouts on one set of panes. Each mode keeps the state
 * tuios keeps for it, and the arithmetic follows internal/layout:
 *
 * - BSP (bsp.go): a new pane splits the focused one and takes the right or
 *   bottom half. The spiral scheme picks the axis from the depth of the pane
 *   being split: even depth splits side by side on a landscape screen, odd
 *   depth stacks. Preselection puts the new pane on a chosen side instead.
 *   Closing a pane gives its space to its sibling.
 * - Master-stack (tiling.go): arrangements by pane count. One fills the
 *   screen, two sit side by side, three put a master on the left and stack
 *   two on the right, four or more make a grid two columns wide up to six
 *   panes and three beyond, with a short last row sharing its width.
 * - Scrolling (scrolling.go): each pane is a column 55% of the screen wide on
 *   a strip. A new column goes after the focused one. Moving focus scrolls the
 *   strip by the least that shows the whole column plus a four cell peek.
 */

// The screen, in cells. Wider than twice its height, so it reads as
// landscape the way tuios measures it (a cell is about twice as tall as wide).
const W = 100;
const H = 30;
const COLUMN = 0.55;
const PEEK = 4;

type Mode = "bsp" | "master" | "scroll";
type Dir = "left" | "right" | "up" | "down";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Node =
  | { kind: "leaf"; id: number }
  | { kind: "split"; vertical: boolean; first: Node; second: Node };

function depthOf(node: Node, id: number, depth = 0): number {
  if (node.kind === "leaf") return node.id === id ? depth : -1;
  const left = depthOf(node.first, id, depth + 1);
  return left >= 0 ? left : depthOf(node.second, id, depth + 1);
}

function insert(
  node: Node | null,
  target: number,
  id: number,
  pre: Dir | null,
): Node {
  const leaf: Node = { kind: "leaf", id };
  if (!node) return leaf;
  // Spiral: even depth splits side by side on a landscape screen.
  const vertical = pre
    ? pre === "left" || pre === "right"
    : depthOf(node, target) % 2 === 0;
  const newFirst = pre === "left" || pre === "up";
  const walk = (n: Node): Node => {
    if (n.kind === "leaf") {
      if (n.id !== target) return n;
      return newFirst
        ? { kind: "split", vertical, first: leaf, second: n }
        : { kind: "split", vertical, first: n, second: leaf };
    }
    return { ...n, first: walk(n.first), second: walk(n.second) };
  };
  return walk(node);
}

function remove(node: Node, id: number): Node | null {
  if (node.kind === "leaf") return node.id === id ? null : node;
  const first = remove(node.first, id);
  const second = remove(node.second, id);
  if (!first) return second;
  if (!second) return first;
  return { ...node, first, second };
}

function firstLeaf(node: Node): number {
  return node.kind === "leaf" ? node.id : firstLeaf(node.first);
}

function bspRects(node: Node | null, r: Rect, out = new Map<number, Rect>()) {
  if (!node) return out;
  if (node.kind === "leaf") {
    out.set(node.id, r);
    return out;
  }
  if (node.vertical) {
    const w = r.w / 2;
    bspRects(node.first, { ...r, w }, out);
    bspRects(node.second, { ...r, x: r.x + w, w }, out);
  } else {
    const h = r.h / 2;
    bspRects(node.first, { ...r, h }, out);
    bspRects(node.second, { ...r, y: r.y + h, h }, out);
  }
  return out;
}

function masterRects(ids: number[]) {
  const out = new Map<number, Rect>();
  const n = ids.length;
  if (n === 1) out.set(ids[0], { x: 0, y: 0, w: W, h: H });
  else if (n === 2) {
    out.set(ids[0], { x: 0, y: 0, w: W / 2, h: H });
    out.set(ids[1], { x: W / 2, y: 0, w: W / 2, h: H });
  } else if (n === 3) {
    out.set(ids[0], { x: 0, y: 0, w: W / 2, h: H });
    out.set(ids[1], { x: W / 2, y: 0, w: W / 2, h: H / 2 });
    out.set(ids[2], { x: W / 2, y: H / 2, w: W / 2, h: H / 2 });
  } else if (n > 3) {
    const cols = n <= 6 ? 2 : 3;
    const rows = Math.ceil(n / cols);
    ids.forEach((id, i) => {
      const row = Math.floor(i / cols);
      const inRow = Math.min(cols, n - row * cols);
      const w = W / inRow;
      out.set(id, {
        x: (i - row * cols) * w,
        y: (row * H) / rows,
        w,
        h: H / rows,
      });
    });
  }
  return out;
}

interface State {
  next: number;
  focused: number;
  order: number[];
  tree: Node | null;
  columns: number[];
  viewport: number;
}

function initial(): State {
  let s: State = {
    next: 1,
    focused: 0,
    order: [],
    tree: null,
    columns: [],
    viewport: 0,
  };
  for (let i = 0; i < 3; i++) s = addPane(s, null);
  return s;
}

function reveal(columns: number[], index: number, viewport: number) {
  const cw = W * COLUMN;
  const x = index * cw;
  const max = Math.max(columns.length * cw - W, 0);
  let v = viewport;
  if (x - PEEK < v) v = x - PEEK;
  if (x + cw + PEEK > v + W) v = x + cw + PEEK - W;
  return Math.min(Math.max(v, 0), max);
}

function addPane(s: State, pre: Dir | null): State {
  const id = s.next;
  const at = s.columns.indexOf(s.focused);
  const columns = [...s.columns];
  columns.splice(at < 0 ? columns.length : at + 1, 0, id);
  return {
    next: id + 1,
    focused: id,
    order: [...s.order, id],
    tree: insert(s.tree, s.focused, id, pre),
    columns,
    viewport: reveal(columns, columns.indexOf(id), s.viewport),
  };
}

function closePane(s: State): State {
  if (s.order.length <= 1) return s;
  const id = s.focused;
  const at = s.columns.indexOf(id);
  const columns = s.columns.filter((c) => c !== id);
  const tree = s.tree ? remove(s.tree, id) : null;
  // Scrolling moves focus to the column on the left; take the same pane in
  // every mode so switching modes keeps one focus.
  const focused = columns[Math.max(at - 1, 0)] ?? (tree ? firstLeaf(tree) : 0);
  return {
    ...s,
    focused,
    order: s.order.filter((o) => o !== id),
    tree,
    columns,
    viewport: reveal(columns, columns.indexOf(focused), s.viewport),
  };
}

function focusColumn(s: State, step: number): State {
  const at = s.columns.indexOf(s.focused) + step;
  if (at < 0 || at >= s.columns.length) return s;
  return {
    ...s,
    focused: s.columns[at],
    viewport: reveal(s.columns, at, s.viewport),
  };
}

const MODES: { id: Mode; label: string }[] = [
  { id: "bsp", label: "BSP" },
  { id: "master", label: "Master-stack" },
  { id: "scroll", label: "Scrolling" },
];

const PRESELECT: { dir: Dir; key: string; glyph: string }[] = [
  { dir: "left", key: "Alt+H", glyph: "←" },
  { dir: "down", key: "Alt+J", glyph: "↓" },
  { dir: "up", key: "Alt+K", glyph: "↑" },
  { dir: "right", key: "Alt+L", glyph: "→" },
];

const MAX_PANES = 9;

/** Percent of the stage for a rect in cells. The screen spans 70% of it. */
function place(r: Rect, offset = 0): React.CSSProperties {
  const scale = 70 / W;
  return {
    left: `${15 + (r.x - offset) * scale}%`,
    width: `${r.w * scale}%`,
    top: `${(r.y / H) * 100}%`,
    height: `${(r.h / H) * 100}%`,
  };
}

export function LayoutModes({ initialMode = "bsp" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [state, setState] = useState(initial);
  const [pre, setPre] = useState<Dir | null>(null);
  const statusId = useId();

  const rects =
    mode === "bsp"
      ? bspRects(state.tree, { x: 0, y: 0, w: W, h: H })
      : mode === "master"
        ? masterRects(state.order)
        : new Map(
            state.columns.map((id, i) => [
              id,
              { x: i * W * COLUMN, y: 0, w: W * COLUMN, h: H },
            ]),
          );
  const offset = mode === "scroll" ? state.viewport : 0;

  const count = state.order.length;
  const focusDepth = state.tree ? depthOf(state.tree, state.focused) : 0;
  let status: string;
  if (mode === "bsp") {
    const how = pre
      ? `on the ${pre} of pane ${state.focused} (preselected)`
      : focusDepth % 2 === 0
        ? `side by side with pane ${state.focused}`
        : `below pane ${state.focused}`;
    status = `${count} panes. The next pane opens ${how}.`;
  } else if (mode === "master") {
    status =
      count <= 3
        ? `${count} panes: ${["", "full screen", "side by side", "a master on the left, two stacked on the right"][count]}.`
        : `${count} panes: a grid ${count <= 6 ? "two" : "three"} columns wide.`;
  } else {
    const at = state.columns.indexOf(state.focused) + 1;
    status = `${count} columns on a strip ${Math.round(count * COLUMN * 100)}% of the screen wide. Focus is on column ${at}.`;
  }

  const add = () => {
    if (count >= MAX_PANES) return;
    setState((s) => addPane(s, mode === "bsp" ? pre : null));
    setPre(null);
  };
  const close = () => setState(closePane);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLButtonElement && e.key === "Enter") return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const key = e.key;
    if (key === "n") add();
    else if (key === "w" || key === "x") close();
    else if (mode === "scroll" && (key === "h" || key === "ArrowLeft"))
      setState((s) => focusColumn(s, -1));
    else if (mode === "scroll" && (key === "l" || key === "ArrowRight"))
      setState((s) => focusColumn(s, 1));
    else return;
    e.preventDefault();
  };

  const pane = (id: number, r: Rect, ghost: boolean) => (
    <button
      key={`${ghost ? "g" : "p"}${id}`}
      type="button"
      tabIndex={ghost ? -1 : 0}
      aria-hidden={ghost || undefined}
      aria-label={`pane ${id}${id === state.focused ? ", focused" : ""}`}
      aria-pressed={id === state.focused}
      onClick={() =>
        setState((s) => ({
          ...s,
          focused: id,
          viewport:
            mode === "scroll"
              ? reveal(s.columns, s.columns.indexOf(id), s.viewport)
              : s.viewport,
        }))
      }
      style={place(r, offset)}
      className="absolute p-[3px] transition-all duration-300 ease-out focus:outline-none motion-reduce:transition-none"
    >
      <span
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md border text-left",
          id === state.focused
            ? "border-fd-primary bg-fd-primary/10"
            : "border-fd-border bg-fd-card",
          ghost && "border-dashed opacity-35",
        )}
      >
        <span
          className={cn(
            "truncate px-1.5 py-0.5 font-mono text-[10px] sm:text-xs",
            id === state.focused
              ? "text-fd-primary"
              : "text-fd-muted-foreground",
          )}
        >
          {id}
        </span>
      </span>
    </button>
  );

  return (
    <figure
      data-widget="layout-modes"
      className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card"
    >
      <div className="flex flex-wrap items-center gap-2 border-fd-border border-b bg-fd-muted/40 px-3 py-2">
        <fieldset className="inline-flex overflow-hidden rounded-md border border-fd-border">
          <legend className="sr-only">Layout</legend>
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary focus-visible:ring-inset",
                mode === m.id
                  ? "bg-fd-primary text-fd-primary-foreground"
                  : "text-fd-muted-foreground hover:text-fd-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </fieldset>
        <span className="ml-auto font-mono text-fd-muted-foreground text-xs tabular-nums">
          {count} / {MAX_PANES} panes
        </span>
      </div>

      {/* biome-ignore lint/a11y/noStaticElementInteractions: the keys are shortcuts for the buttons below, which stay the accessible way in */}
      <div
        className="bg-fd-background/40 px-2 py-4 sm:px-4"
        onKeyDown={onKeyDown}
      >
        <div className="relative mx-auto aspect-[10/4] w-full max-w-2xl overflow-hidden">
          {/* The screen. */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-[15%] w-[70%] rounded-md border border-fd-foreground/25 border-dashed"
          />
          {mode === "scroll" ? (
            <>
              {/* The strip off screen, faded. */}
              {[...rects].map(([id, r]) => pane(id, r, true))}
              <div className="absolute inset-y-0 left-[15%] w-[70%] overflow-hidden">
                <div className="absolute inset-y-0 left-[-21.43%] w-[142.86%]">
                  {[...rects].map(([id, r]) => pane(id, r, false))}
                </div>
              </div>
            </>
          ) : (
            [...rects].map(([id, r]) => pane(id, r, false))
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-fd-border border-t px-3 py-3">
        <Action onClick={add} disabled={count >= MAX_PANES} hint="n">
          New pane
        </Action>
        <Action onClick={close} disabled={count <= 1} hint="w">
          Close focused
        </Action>
        {mode === "bsp" ? (
          <fieldset className="flex items-center gap-1">
            <legend className="sr-only">
              Preselect where the next pane goes
            </legend>
            <span className="mr-1 font-mono text-fd-muted-foreground text-xs">
              preselect
            </span>
            {PRESELECT.map((p) => (
              <button
                key={p.dir}
                type="button"
                aria-pressed={pre === p.dir}
                aria-label={`Preselect ${p.dir} (${p.key})`}
                title={p.key}
                onClick={() => setPre((cur) => (cur === p.dir ? null : p.dir))}
                className={cn(
                  "size-8 rounded-md border font-mono text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary",
                  pre === p.dir
                    ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                    : "border-fd-border text-fd-muted-foreground hover:text-fd-foreground",
                )}
              >
                {p.glyph}
              </button>
            ))}
          </fieldset>
        ) : null}
        {mode === "scroll" ? (
          <>
            <Action
              onClick={() => setState((s) => focusColumn(s, -1))}
              hint="h"
            >
              Focus left
            </Action>
            <Action onClick={() => setState((s) => focusColumn(s, 1))} hint="l">
              Focus right
            </Action>
          </>
        ) : null}
      </div>

      <figcaption className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-sm">
        <p id={statusId} aria-live="polite" className="text-fd-foreground">
          {status}
        </p>
        <p className="mt-1">
          {mode === "bsp"
            ? "A new pane splits the focused one. With the default spiral scheme the split turns from side by side to stacked as the tree gets deeper. Preselect a side to choose it yourself. Click a pane to focus it."
            : mode === "master"
              ? "The arrangement depends only on how many panes there are. In window mode, < and > move the master pane's share of the screen (appearance.master_ratio, 50% by default)."
              : "Each pane is a column 55% of the screen wide. The dashed box is the screen: the strip slides under it by the least that shows the focused column and a few cells of its neighbour."}
        </p>
      </figcaption>
    </figure>
  );
}

function Action({
  onClick,
  disabled,
  hint,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-md border border-fd-border px-2.5 py-1.5 font-mono text-fd-foreground text-xs transition-colors hover:border-fd-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary disabled:opacity-40"
    >
      {children}
      <kbd className="rounded border border-fd-border px-1 text-[10px] text-fd-muted-foreground">
        {hint}
      </kbd>
    </button>
  );
}
