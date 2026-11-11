/**
 * Types for the /learn page: what the tuios wasm build reports. The tracks'
 * types are in lessons.ts.
 */

/** The overlays tuios reports in `overlays` and the overlay events. */
export type OverlayName =
  | "help"
  | "whichkey"
  | "commandPalette"
  | "launcher"
  | "settings"
  | "themePicker"
  | "themeEditor"
  | "glyphPicker"
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
  | "compare"
  /** The rail has the keyboard (ctrl+b e). */
  | "railFocus"
  /** The palette searches files (ctrl+b f). */
  | "fileSearch"
  /** The review overlay (ctrl+b v). */
  | "review"
  /** The new worktree dialog (ctrl+b U). */
  | "worktree";

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
  /**
   * The rail's files section: the folder it lists, and the path of the row
   * under the rail's cursor while the rail has the keyboard. "" for none.
   * Missing from an engine older than the files lessons.
   */
  files?: { dir: string; cursor: string };
  /**
   * The review overlay: the file it shows and the hunk the cursor is in, -1
   * for none. null while it is closed.
   */
  review?: { file: string; hunk: number } | null;
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
 *
 * The files and review lessons use these too:
 * - `files` {from, to}: each side `{dir, cursor}`, as in the state.
 * - `review.move` {file, hunk, from}: the review's cursor reached another
 *   file or hunk.
 * - `review.note` {action, path?, line?, text?, notes}: a note was added
 *   ("add"), edited or removed. `notes` is the count now.
 * - `review.send` {notes}: S marked this many notes as sent.
 * - `worktree` {repo, branch, path}: ctrl+b U made a worktree.
 *
 * `setting` {name, from, to} is a look that changed. `name` is "glyphs",
 * "borderStyle", or the config path of a look tuios watches, such as
 * "appearance.window_title_style" or "appearance.sidebar.row_style". The
 * values are strings. `themeEdit` {changed} says whether the theme editor
 * holds a colour change that is not saved. The full list is in
 * cmd/tuios-wasm/README.md in the tuios repo.
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
  /** Every lesson as a JSON string, the same bytes as lib/learn/lessons.json. */
  lessons(): string;
  /**
   * Run a lesson command: start, showMe, skip, next, back, stop or log.
   * Returns null, or an error message.
   */
  lesson(cmd: string, ...args: string[]): string | null;
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

/** A step's result. */
export type StepResult = "clean" | "hinted" | "skipped";

/**
 * The data of the lesson events the engine in tuios sends. See "Lessons" in
 * cmd/tuios-wasm/README.md in the tuios repo.
 */
export type LessonStepData = {
  track: string;
  index: number;
  total: number;
  id: string;
  title: string;
  note?: string;
  keys: KeyItem[];
  needs?: "window" | "terminal" | "";
  hint: string;
  waiting?: string;
  learned?: string;
  try?: string;
  explainer?: {
    art: string;
    body: string;
    href: string;
    linkText: string;
  } | null;
};

export type LessonHintData = {
  index: number;
  level: 0 | 1 | 2;
  altBlocked: boolean;
  noWindow: boolean;
  nudge: string;
  waiting: boolean;
};

export type LessonDoneData = {
  index: number;
  id: string;
  result: StepResult;
  results: StepResult[];
  finished: boolean;
  lastAction: string;
  learned?: string;
  explainer?: boolean;
  event?: { type: string; data?: Record<string, unknown> } | null;
};
