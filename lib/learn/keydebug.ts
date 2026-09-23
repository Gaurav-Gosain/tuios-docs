/**
 * A key log for /learn?debug=keys: every keyboard, input and composition
 * event the browser fires, what the page's key handler did with it, the bytes
 * that went to tuios, and the key tuios read. The panel in
 * components/learn/key-debug.tsx shows it and copies it as text, so a reader
 * whose keys do not work can paste back exactly what their browser sent.
 *
 * Everything here is a no-op unless the page was opened with debug=keys.
 */
import { detectMac } from "./keys";

export type KeyDebugRow = {
  id: number;
  /** performance.now() when the row was made. */
  at: number;
  kind: "dom" | "term" | "tuios" | "note";
  type?: string;
  key?: string;
  code?: string;
  keyCode?: number;
  alt?: boolean;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  altGraph?: boolean;
  composing?: boolean;
  repeat?: boolean;
  data?: string | null;
  inputType?: string;
  /** Where the event was aimed: "terminal" or an element name. */
  target?: string;
  /** The event reached the terminal's textarea. */
  textarea?: boolean;
  /** The default was prevented once the terminal had handled it. */
  prevented?: boolean;
  /** What the page's key handler decided, if it ran. */
  handler?: string;
  /** Bytes the page sent to tuios itself for this event. */
  sent?: string;
  text?: string;
};

export type KeyDebugSource = {
  renderer?: () => string | undefined;
  kittyFlags?: () => number | undefined;
  engine?: string;
};

const MAX_ROWS = 40;
const EVENTS = [
  "keydown",
  "keypress",
  "keyup",
  "beforeinput",
  "input",
  "compositionstart",
  "compositionupdate",
  "compositionend",
] as const;

let enabled: boolean | null = null;
let rows: KeyDebugRow[] = [];
let nextId = 1;
let source: KeyDebugSource = {};
const byEvent = new WeakMap<Event, KeyDebugRow>();
const listeners = new Set<() => void>();

/** Whether the page was opened with debug=keys (debug=keys,other works too). */
export function keyDebugEnabled(): boolean {
  if (enabled === null) {
    enabled =
      typeof location !== "undefined" &&
      (new URLSearchParams(location.search).get("debug") ?? "")
        .split(",")
        .includes("keys");
  }
  return enabled;
}

export function subscribeKeyDebug(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function keyDebugRows() {
  return rows;
}

export function clearKeyDebug() {
  rows = [];
  changed();
}

/** Where the renderer, the Kitty keyboard flags and the engine are read. */
export function setKeyDebugSource(next: KeyDebugSource) {
  source = next;
  changed();
}

function changed() {
  for (const fn of listeners) fn();
}

function push(row: Omit<KeyDebugRow, "id" | "at">): KeyDebugRow {
  const full = { ...row, id: nextId++, at: performance.now() };
  rows = [...rows, full].slice(-MAX_ROWS);
  changed();
  return full;
}

function update(row: KeyDebugRow) {
  rows = rows.map((r) => (r.id === row.id ? { ...row } : r));
  changed();
}

function describeTarget(target: EventTarget | null): string {
  if (!(target instanceof Element)) return "window";
  if (target.closest(".learn-term")) {
    return target.tagName === "TEXTAREA"
      ? "terminal"
      : "terminal (not its textarea)";
  }
  const cls =
    typeof target.className === "string" && target.className
      ? `.${target.className.trim().split(/\s+/)[0]}`
      : "";
  return `${target.tagName.toLowerCase()}${cls}`;
}

function rowFor(e: Event): KeyDebugRow {
  const known = byEvent.get(e);
  if (known) return known;
  const row: Omit<KeyDebugRow, "id" | "at"> = {
    kind: "dom",
    type: e.type,
    target: describeTarget(e.target),
  };
  if (e instanceof KeyboardEvent) {
    Object.assign(row, {
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      alt: e.altKey,
      meta: e.metaKey,
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      altGraph: e.getModifierState?.("AltGraph") ?? false,
      composing: e.isComposing,
      repeat: e.repeat,
    });
  } else if (typeof InputEvent !== "undefined" && e instanceof InputEvent) {
    Object.assign(row, {
      data: e.data,
      inputType: e.inputType,
      composing: e.isComposing,
    });
  } else if (
    typeof CompositionEvent !== "undefined" &&
    e instanceof CompositionEvent
  ) {
    row.data = e.data;
  }
  const made = push(row);
  byEvent.set(e, made);
  return made;
}

/** Log every key, input and composition event on window, capture phase. */
export function watchWindow() {
  if (!keyDebugEnabled()) return () => {};
  const on = (e: Event) => {
    rowFor(e);
  };
  for (const t of EVENTS) window.addEventListener(t, on, true);
  return () => {
    for (const t of EVENTS) window.removeEventListener(t, on, true);
  };
}

/**
 * Mark the events that reach the terminal's textarea. These listeners are
 * added after the terminal's own, and in the same capture phase, so they run
 * even when the terminal stops propagation and see whether it prevented the
 * default.
 */
export function watchTextarea(el: Element | null) {
  if (!keyDebugEnabled() || !el) return () => {};
  const on = (e: Event) => {
    const row = rowFor(e);
    row.textarea = true;
    row.prevented = e.defaultPrevented;
    update(row);
  };
  for (const t of EVENTS) el.addEventListener(t, on, true);
  return () => {
    for (const t of EVENTS) el.removeEventListener(t, on, true);
  };
}

/** What the page's key handler did with an event, and any bytes it sent. */
export function noteHandler(e: KeyboardEvent, decision: string, sent?: string) {
  if (!keyDebugEnabled()) return;
  const row = rowFor(e);
  row.handler = decision;
  if (sent !== undefined) row.sent = sent;
  update(row);
}

/**
 * Bytes a terminal itself sent to tuios (its own key encoding). `tag` names
 * the terminal, since the hub's demo and the lesson each run one.
 */
export function noteTerminalSent(tag: string, bytes: Uint8Array | string) {
  if (!keyDebugEnabled()) return;
  const text =
    typeof bytes === "string" ? bytes : new TextDecoder().decode(bytes);
  // Mouse reports would drown the keys.
  if (text.startsWith("\x1b[<") && /^.\[<\d+;\d+;\d+[mM]$/.test(text)) return;
  push({ kind: "term", text: `${tag} ${showBytes(text)}` });
}

/** A key or action event from the tuios in terminal `tag`. */
export function noteTuios(
  tag: string,
  type: string,
  data: Record<string, unknown>,
) {
  if (!keyDebugEnabled()) return;
  const name = String(data.key ?? data.name ?? "");
  const mode = data.mode ? ` mode=${data.mode}` : "";
  push({
    kind: "tuios",
    text: `${tag} ${type} ${JSON.stringify(name)}${mode}`,
  });
}

/** A line of its own, such as a new terminal starting. */
export function noteKeyDebug(text: string) {
  if (!keyDebugEnabled()) return;
  push({ kind: "note", text });
}

/**
 * Bytes as readable text: ESC is \e, other control bytes are ^X, and a
 * character past ASCII is followed by its code point.
 */
export function showBytes(text: string): string {
  let out = "";
  for (const ch of text) {
    const c = ch.codePointAt(0) ?? 0;
    if (c === 0x1b) out += "\\e";
    else if (c < 0x20) out += `^${String.fromCharCode(c + 64)}`;
    else if (c === 0x7f) out += "^?";
    else if (c > 0x7e)
      out += `${ch}(U+${c.toString(16).toUpperCase().padStart(4, "0")})`;
    else out += ch;
  }
  return `"${out}"`;
}

const yes = (v: boolean | undefined) => (v ? "y" : "n");

function mods(row: KeyDebugRow) {
  return [
    row.alt ? "A" : "-",
    row.meta ? "M" : "-",
    row.ctrl ? "C" : "-",
    row.shift ? "S" : "-",
    row.altGraph ? "G" : "-",
  ].join("");
}

/** One row as one line of text. */
export function formatRow(row: KeyDebugRow, start: number): string {
  const t = `+${Math.max(0, Math.round(row.at - start))}ms`.padEnd(8);
  if (row.kind === "term") {
    return `${t} terminal ${row.text} sent`;
  }
  if (row.kind === "tuios") return `${t} tuios ${row.text}`;
  if (row.kind === "note") return `${t} note: ${row.text}`;
  const parts = [`${t} ${(row.type ?? "").padEnd(11)}`];
  if (row.key !== undefined) {
    parts.push(
      `key=${showBytes(row.key)} code=${row.code || '""'} keyCode=${row.keyCode} mods=${mods(row)} composing=${yes(row.composing)} repeat=${yes(row.repeat)}`,
    );
  } else {
    if (row.inputType) parts.push(`inputType=${row.inputType}`);
    parts.push(`data=${row.data == null ? "null" : showBytes(row.data)}`);
    if (row.composing !== undefined)
      parts.push(`composing=${yes(row.composing)}`);
  }
  parts.push(`on=${row.target}`);
  parts.push(
    row.textarea ? `textarea=y prevented=${yes(row.prevented)}` : "textarea=n",
  );
  if (row.handler) parts.push(`| page: ${row.handler}`);
  if (row.sent !== undefined) parts.push(`sent ${showBytes(row.sent)}`);
  return parts.join(" ");
}

/** The environment lines at the top of the copied log. */
export function environmentLines(): string[] {
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const oldMac = /Mac|iPhone|iPad/.test(nav.platform);
  const active = document.activeElement;
  return [
    `url: ${location.href}`,
    `time: ${new Date().toISOString()}`,
    `navigator.platform: ${JSON.stringify(nav.platform)}`,
    `navigator.userAgentData.platform: ${JSON.stringify(nav.userAgentData?.platform ?? null)}`,
    `navigator.userAgent: ${nav.userAgent}`,
    `IS_MAC (old check, navigator.platform only): ${oldMac}`,
    `IS_MAC (current check, platform or userAgentData or userAgent): ${detectMac(nav)}`,
    `renderer: ${source.renderer?.() ?? "unknown"}`,
    `kitty keyboard flags: ${source.kittyFlags?.() ?? "unknown"}`,
    `engine: ${source.engine ?? "unknown"}`,
    `focus: ${active ? describeTarget(active) : "none"}`,
  ];
}

/** The whole log as text, for pasting into a bug report. */
export function formatKeyDebug(): string {
  const start = rows[0]?.at ?? 0;
  return [
    "tuios /learn key log (debug=keys)",
    "",
    ...environmentLines(),
    "",
    "How to read it: one line per browser event, oldest first, times from the",
    "first line. mods is A=alt M=meta C=ctrl S=shift G=AltGraph, '-' when up.",
    "on= is where the event was aimed. textarea=y means it reached the",
    "terminal, and prevented= whether the default was stopped there.",
    "'page:' is what the page's key handler did, and 'sent' the bytes it sent",
    "to tuios itself. 'terminal tN ... sent' is what terminal N encoded on its",
    "own. 'tuios tN key' is the key tuios read, with its mode. The hub's demo",
    "and the lesson each run a terminal, so t1 is usually the demo.",
    "If Option+j shows only Alt lines and no line with code=KeyJ, the browser",
    "never got the j: something outside it, such as a window manager hotkey",
    "(AeroSpace, Rectangle, Raycast), took the key first.",
    "",
    ...rows.map((r) => formatRow(r, start)),
  ].join("\n");
}
