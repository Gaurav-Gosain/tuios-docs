/**
 * Types for the /learn page: what the tuios wasm build reports, and the shape
 * of a track.
 */

/** The overlays tuios reports in `overlays` and the overlay events. */
export type OverlayName =
  | "help"
  | "whichkey"
  | "commandPalette"
  | "launcher"
  | "settings"
  | "themePicker"
  | "keybinds"
  | "copyMode"
  | "search"
  | "scrollback"
  | "quitMenu"
  | "workspaceSwitcher"
  | "layoutPicker"
  | "sidebar"
  | "logs"
  | "screensaver"
  | "agents"
  | "mail"
  | "presets"
  | "goto"
  | "hints"
  | "paneLabels"
  | "spotlight"
  | "scratch"
  /** Over the agents view: the prompt an agent waits on. */
  | "peek"
  /** Over the agents view: the reply editor. */
  | "reply"
  /** Over the agents view: the New agent sheet. */
  | "newAgent"
  /** Over the agents view: the attempts of a fan side by side. */
  | "compare";

/** The keymap in use. */
export type TuiosKeys = {
  /** "tuios", "tmux", "screen" or "zellij". */
  preset: string;
  /** The leader key, such as "ctrl+b". */
  leader: string;
  /** Lock mode: every key but the leader goes to the pane. */
  lock: boolean;
};

/** One window in the snapshot. Sizes are in cells. */
export type TuiosWindow = {
  id: string;
  title: string;
  workspace: number;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  zoomed: boolean;
  floating: boolean;
  agent: string;
  agentMessage: string;
  /** "approval" or "question" while the agent needs input. */
  agentKind?: string;
  /** The agent's harness, such as "claude-code", "codex" or "gemini-cli". */
  harness?: string;
  /** "tml" for a window that draws a TML surface, "" for a program's pane. */
  kind?: string;
  /** The window floats as a popup. */
  popup?: boolean;
};

/**
 * The app state tuios reports with every change. See cmd/tuios-wasm/README.md
 * in the tuios repo for the contract.
 */
export type TuiosState = {
  mode: "window" | "terminal";
  workspace: number;
  workspacesUsed: number[];
  tiling: boolean;
  layout: "bsp" | "master-stack" | "scrolling";
  /** "", "prefix", "workspace", "window", "minimize", "layout", "debug", "tape". */
  prefix: string;
  overlays: string[];
  theme: string;
  focused: string;
  focusedTitle: string;
  zoomed: boolean;
  /** On the current workspace, minimized included. */
  windows: number;
  minimized: number;
  totalWindows: number;
  windowList: TuiosWindow[];
  tape: boolean;
  /** The glyph set, "default" for the shipped one. */
  glyphs: string;
  /** The border style, such as "rounded". */
  borderStyle: string;
  /** The keymap in use. An engine built before it existed leaves it out. */
  keys?: TuiosKeys;
  /** The window picture-in-picture shows, "" when it is off. */
  pip?: string;
  /**
   * The agents view's cursor: the window of the agent under it, and the
   * focus tab ("thread", "changes", "checkpoints", "artifacts" or "pane").
   * Both are "" while the view is closed. The agents.select and agents.tab
   * events report each change.
   */
  agentsView?: { selected: string; tab: string };
  cols: number;
  rows: number;
};

/**
 * One event from tuios: `{type, data, windowId?, state?}`. For one key press
 * the order is `key` {key, mode}, then any `action` {name, mode}, then the
 * state changes it caused, each with the new state. `shell.*` events come
 * from the fake shell and carry the window id.
 *
 * `tml.*` events come from the TML surfaces that `tuios tml show` opens.
 * They carry no state:
 * - `tml.open` {surface, windowId, title, owner, target}: target is
 *   "popup" or "pane".
 * - `tml.input` {surface, state}: the person changed the surface's state.
 * - `tml.place` {surface, windowId, target}: moved to a popup or a pane.
 * - `tml.close` {surface, windowId, title, reason, value}: reason is
 *   "closed" (value is the answer) or "dismissed" (value is null).
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
  /** Every keybinding action mapped to its description. */
  actions(): Record<string, string>;
  /** The actions Learn mode turns off, mapped to the note each shows. */
  unavailable(): Record<string, string>;
  /** The command names `command` accepts. */
  commands(): string[];
  /**
   * Ends the program, so its memory can be freed. An engine built before it
   * existed does not have it.
   */
  stop?(): void;
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
  /**
   * The last registry action tuios ran since the last key, from a key, a
   * prefix chord or a menu row. "" if the last key ran none.
   */
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
  art:
    | "detach"
    | "clients"
    | "remote"
    | "agents"
    | "mail"
    | "fanout"
    | "worktree"
    | "protocol"
    | "hooks";
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
  /** The group the hub lists the track under. */
  group: TrackGroup;
};

/** The hub's groups, in the order it shows them. */
export type TrackGroup = "start" | "everyday" | "agents" | "build" | "yours";
