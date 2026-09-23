/**
 * Types for the /learn page: what the tuios wasm build reports, and the shape
 * of a track.
 */

/** The app state tuios reports with every change (see observe_js.go). */
export type TuiosState = {
  mode: "window" | "terminal";
  windows: number;
  minimized: number;
  totalWindows: number;
  focused: string;
  focusedTitle: string;
  workspace: number;
  tiling: boolean;
  prefix: string;
  help: boolean;
  commandPalette: boolean;
  launcher: boolean;
  settings: boolean;
  copyMode: boolean;
  zoomed: boolean;
  theme: string;
  workspacesUsed: number[];
  cols: number;
  rows: number;
};

/**
 * One event from tuios. `key` carries {key, action, mode}. State changes
 * (mode, window.open, tiling, workspace and the rest) carry {from, to} and the
 * new state. `shell.command` comes from the fake shell with {command, line,
 * cwd}.
 */
export type TuiosEvent = {
  type: string;
  windowId?: string;
  data?: Record<string, unknown>;
  state?: TuiosState;
};

/** The global the wasm build sets up. */
export type TuiosApi = {
  onOutput(fn: (bytes: Uint8Array) => void): void;
  onEvent(fn: (event: TuiosEvent) => void): void;
  input(data: string | Uint8Array): void;
  resize(cols: number, rows: number): void;
  state(): TuiosState;
  command(name: string, ...args: string[]): void;
};

/**
 * A key the step card draws as a keycap. A string is a chord in tuios's
 * notation: "ctrl+b", "shift+tab", "|", "enter". `{ text }` is something to
 * type, drawn as one wide cap, such as a shell command.
 */
export type KeyItem = string | { text: string };

/** What the page runs to set the scene. */
export type SetupCommand =
  /** A tuios.command call, such as ["cascade"] or ["newWindow", "logs"]. */
  | { command: string; args?: string[]; wait?: number }
  /** Raw input, as if typed. */
  | { input: string; wait?: number };

/** Memory the engine keeps across the events of one step. */
export type MatchContext = {
  /** The action of the last key tuios handled, "" if it had none. */
  lastAction: string;
  /** The state after the last state event. */
  state: TuiosState | null;
  /** Per-step scratch space for matchers that count. */
  mem: Record<string, number>;
};

/** Decides whether an event completes the step. */
export type Matcher = (event: TuiosEvent, ctx: MatchContext) => boolean;

/**
 * A feature a browser tab cannot run, such as detaching or a second machine.
 * The step shows a short animation and a docs link, and completes when the
 * reader says they got it.
 */
export type Explainer = {
  art: "detach" | "clients" | "remote" | "agents";
  body: string;
  href: string;
  linkText: string;
};

export type Step = {
  id: string;
  /** Six words or fewer. */
  title: string;
  /** An optional second line, such as "tmux used %". */
  note?: string;
  /** The keys to press, in order. */
  keys: KeyItem[];
  /** The mode the keys work in, for the wrong-mode nudge. */
  needs?: "window" | "terminal";
  /** Run when the step starts, in order. */
  setup?: SetupCommand[];
  /** Completes the step. Not used by explainer steps. */
  done?: Matcher;
  /** Shown once the reader looks stuck. */
  hint: string;
  /** What "Show me" types. Defaults to the bytes of `keys`. */
  showMe?: string;
  explainer?: Explainer;
  /** A short name for the keys, for the "keys learned" list. */
  learned?: string;
};

export type Track = {
  id: string;
  title: string;
  /** One line on the track card. */
  blurb: string;
  /** Who it is for, shown as a small tag. */
  audience: string;
  minutes: number;
  /** Run once when the lesson starts, before the first step. */
  setup?: SetupCommand[];
  steps: Step[];
  /** Tracks to suggest when this one is done. */
  next?: string[];
};
