/**
 * What Tilly, the tuios mascot, says on /learn and how Tilly looks while
 * saying it. Plain data and functions, so the lines and the event mapping can
 * be tested without a page. The component in components/learn/tilly.tsx only
 * draws what this returns.
 */
import type { StepResult } from "./engine";
import type { Step, Track, TuiosEvent } from "./types";

/**
 * How Tilly moves while a line is up. `idle` is the resting bob, `happy` a
 * small bounce, `think` a tilt with the eyes looking up, `cheer` a jump with
 * both arms up, `wave` a raised hand.
 */
export type TillyMood = "idle" | "happy" | "think" | "cheer" | "wave";

/** The sounds a line can come with. See lib/learn/sound.ts. */
export type TillySound = "blip" | "chime" | "fanfare" | "nudge" | "none";

export type Speech = { text: string; mood: TillyMood; sound: TillySound };

/** What the event that finished a step did, as Tilly sees it. */
export type Reaction =
  | "open"
  | "split"
  | "close"
  | "focus"
  | "zoom"
  | "minimize"
  | "move"
  | "swap"
  | "rotate"
  | "resize"
  | "float"
  | "rename"
  | "workspace"
  | "send"
  | "tiling"
  | "layout"
  | "theme"
  | "look"
  | "help"
  | "palette"
  | "launcher"
  | "copy"
  | "scrollback"
  | "settings"
  | "sidebar"
  | "switcher"
  | "screensaver"
  | "typing"
  | "windowMode"
  | "menu"
  | "command"
  | "tape"
  | "agentWorking"
  | "agentDone"
  | "agent"
  | "showkeys"
  | "yank"
  | "explainer"
  | "skipped"
  | "generic";

/** Why Tilly speaks up when the reader has not moved on. */
export type Nudge =
  | "idle"
  | "wrongKeys"
  | "wrongModeWindow"
  | "wrongModeTerminal"
  | "showMe"
  | "altBlocked"
  | "noWindow";

const OVERLAY: Record<string, Reaction> = {
  help: "help",
  whichkey: "menu",
  commandPalette: "palette",
  launcher: "launcher",
  settings: "settings",
  themePicker: "theme",
  keybinds: "settings",
  copyMode: "copy",
  search: "copy",
  scrollback: "scrollback",
  workspaceSwitcher: "switcher",
  layoutPicker: "layout",
  sidebar: "sidebar",
  screensaver: "screensaver",
};

/**
 * Map the event that finished a step to what Tilly reacts to. `lastAction` is
 * the registry action the last key ran, which tells a split from a new
 * window and a swap from a resize. A step that ends by closing an overlay
 * reacts to the overlay, since closing it is only the tidy up.
 */
export function reactionFor(
  event: TuiosEvent | null,
  lastAction = "",
): Reaction {
  if (!event) return "generic";
  const data = event.data ?? {};
  const action = lastAction;
  switch (event.type) {
    case "window.open":
      return action.includes("split") ? "split" : "open";
    case "window.close":
      return "close";
    case "window.focus":
      return "focus";
    case "window.zoom":
      return "zoom";
    case "window.minimize":
      return "minimize";
    case "window.float":
      return "float";
    case "window.rename":
      return "rename";
    case "window.move":
      if (action === "rotate_split") return "rotate";
      if (action.startsWith("swap_")) return "swap";
      if (action.startsWith("resize_")) return "resize";
      return "move";
    case "workspace":
      return action.startsWith("workspace_prefix_move") ||
        action.startsWith("move_to_workspace")
        ? "send"
        : "workspace";
    case "tiling":
      return "tiling";
    case "layout":
      return "layout";
    case "theme":
      return "theme";
    case "setting":
      return "look";
    case "overlay.open":
    case "overlay.close":
      return OVERLAY[String(data.name ?? "")] ?? "generic";
    case "mode":
      return data.to === "terminal" ? "typing" : "windowMode";
    case "prefix":
      return "menu";
    case "shell.start":
    case "shell.command":
      return "command";
    case "tape.start":
    case "tape.finish":
      return "tape";
    case "agent":
      if (data.to === "working") return "agentWorking";
      if (data.to === "done") return "agentDone";
      return "agent";
    case "notification": {
      const message = String(data.message ?? "");
      if (/^showkeys/i.test(message)) return "showkeys";
      if (/^yank/i.test(message)) return "yank";
      return "generic";
    }
    default:
      if (action.startsWith("workspace_prefix_move")) return "send";
      return "generic";
  }
}

/** What Tilly says after each kind of step. Keep them short and specific. */
export const REACTION_LINES: Record<Reaction, readonly string[]> = {
  open: [
    "A fresh window, all yours.",
    "New window. Every session starts like that.",
    "There it is. A shell of your own.",
  ],
  split: [
    "Nice split.",
    "Clean split. Two panes, one screen.",
    "Split. My face works the same way.",
  ],
  close: [
    "Closed, and the rest made room.",
    "Tidy. One less window to think about.",
    "Gone. Nothing else moved.",
  ],
  focus: [
    "Nice hop. Watch the bright border follow you.",
    "Focus moved. You are over there now.",
    "Smooth. No mouse needed.",
  ],
  zoom: [
    "Zoom in, zoom out. Handy for a closer look.",
    "Full screen and back again.",
    "Zoom is the quickest way to focus on one thing.",
  ],
  minimize: ["Tucked away in the dock.", "Minimized, not closed."],
  move: [
    "Moved. The layout keeps up.",
    "Everything shifted into place.",
    "That window found a new spot.",
  ],
  swap: ["Swapped. Same panes, new seats.", "Nice swap."],
  rotate: [
    "Rotated. The split turned on its side.",
    "A quarter turn for the layout.",
  ],
  resize: [
    "Resized. The rest made room.",
    "A little bigger here, a little smaller there.",
  ],
  float: ["Floating. It sits above the tiles now.", "That one floats free."],
  rename: ["Named. Easier to find later."],
  workspace: [
    "Workspace {n}. A whole new desk.",
    "Hello from workspace {n}.",
    "Workspace {n}. Your other windows are safe where you left them.",
  ],
  send: [
    "Sent to workspace {n}, and you followed it.",
    "Packed up and moved to workspace {n}.",
  ],
  tiling: ["Tiles snapped into place.", "Tiling does the arranging for you."],
  layout: [
    "{layout}. Same windows, new shape.",
    "Switched to {layout}.",
    "{layout} suits you.",
  ],
  theme: ["New colours. Looks good.", "Nice pick.", "Fresh paint."],
  look: ["Small change, different feel.", "Looking sharp.", "Very you."],
  help: [
    "Help is always one key away.",
    "Now you know where the answers live.",
  ],
  palette: [
    "The palette finds any action by name.",
    "Type what you want, press enter. That is the palette.",
  ],
  launcher: [
    "The launcher opens programs fast.",
    "Launched. No typing paths needed.",
  ],
  copy: [
    "Copy mode, like vim. Your hands already know it.",
    "Found it. Search works in any pane.",
  ],
  scrollback: [
    "Scrollback, with every command marked.",
    "Your whole history, one key away.",
  ],
  settings: [
    "Settings live here. Nothing to edit by hand.",
    "That is where the knobs are.",
  ],
  sidebar: [
    "The rail shows every session at a glance.",
    "There is the rail. Everything in one list.",
  ],
  switcher: [
    "Every workspace at once.",
    "The switcher. Pick a desk, any desk.",
  ],
  screensaver: ["Nice screen saver. I like that one.", "Pretty, right?"],
  typing: [
    "Typing mode. Your keys go to the shell now.",
    "Green badge. The shell is listening.",
  ],
  windowMode: [
    "Back in window mode. Keys move windows again.",
    "Window mode. Your keys drive tuios.",
  ],
  menu: [
    "The menu shows what each key does.",
    "That menu is there whenever you forget a key.",
  ],
  command: [
    "The shell says hi back.",
    "{command} ran in a real pane.",
    "Nice. That ran just like on your machine.",
  ],
  tape: [
    "The tape played itself. That was tuios driving.",
    "All scripted. You just watched a tape.",
  ],
  agentWorking: [
    "Your agent is working. You are free to wander.",
    "The agent is on it.",
  ],
  agentDone: [
    "The agent finished. You approved it from right here.",
    "Done, and you never lost your place.",
  ],
  agent: ["The agent is moving along."],
  showkeys: [
    "Showkeys is on. Handy when you share your screen.",
    "Now everyone watching can see your keys.",
  ],
  yank: ["Yanked. It is on your clipboard.", "Copied, vim style."],
  explainer: [
    "Good to know.",
    "Worth trying once tuios is on your machine.",
    "That one needs a real machine. Now you know where to look.",
  ],
  skipped: [
    "Skipped. You can come back to it any time.",
    "No problem. On to the next one.",
  ],
  generic: ["Nice.", "You got it.", "That is the one.", "Smooth."],
};

/** Said before the reaction when the step needed the hint or Show me. */
export const HINTED_LEAD: readonly string[] = [
  "Got it.",
  "There you go.",
  "You worked it out.",
];

/** Tilly's hello at the start of each track. */
export const GREET_LINES: Record<string, readonly string[]> = {
  basics: [
    "Hi, I am Tilly. We start from zero, one key at a time.",
    "Hello. I live in a terminal too. Let us open your first window.",
  ],
  "from-tmux": [
    "Coming from tmux? Your fingers already know most of this.",
    "Hi. ctrl+b still leads here, so you have a head start.",
  ],
  "from-zellij": [
    "Hi. Panes, tabs and floats all have a home here. Let me show you where.",
    "Coming from zellij? Same ideas, a few new keys.",
  ],
  layouts: [
    "Layouts are my favourite part. My face is one.",
    "Hi. Let us move some tiles around.",
  ],
  workspaces: [
    "Nine workspaces, all yours. Let us visit one.",
    "Hi. Time to spread out a little.",
  ],
  "power-moves": [
    "You know the basics. These keys save the most time.",
    "Hi again. Palette, launcher and copy mode are next.",
  ],
  "make-it-yours": [
    "Let us make tuios look like yours.",
    "Hi. Themes, glyphs, borders. Pick what you like.",
  ],
  agents: [
    "Agents live in panes here. I will show you how to keep an eye on them.",
    "Hi. Let us start an agent and check on it from elsewhere.",
  ],
  automation: [
    "Tapes let tuios drive itself. Let us watch one play.",
    "Hi. A little scripting, and then a party.",
  ],
};

const GREET_DEFAULT: readonly string[] = [
  "Hi, I am Tilly. Let us learn this together.",
  "Hello. {steps} short steps, and I will be right here.",
];

/** Tilly's cheer at the end of each track. */
export const FINISH_LINES: Record<string, readonly string[]> = {
  basics: [
    "That is the basics. You can drive tuios now.",
    "Windows, modes, the leader key and help. All yours.",
  ],
  "from-tmux": [
    "Done. Your tmux habits carry over, and now you know the differences.",
  ],
  "from-zellij": ["Done. Panes, floats and tabs, the tuios way."],
  layouts: ["You shaped every layout there is. My face approves."],
  workspaces: ["Nine desks and you know your way around all of them."],
  "power-moves": ["Those are the keys that stick. Well played."],
  "make-it-yours": ["It looks like yours now. Take it home."],
  agents: ["Now you can run agents and still get your own work done."],
  automation: ["You made tuios drive itself. That was fun to watch."],
};

const FINISH_DEFAULT: readonly string[] = [
  "Track done. Take a bow.",
  "Every step, done. I am proud of you.",
  "That is the whole track. Come back for another when you like.",
];

/** When the reader seems stuck. They point at the help on the card. */
export const NUDGE_LINES: Record<Nudge, readonly string[]> = {
  idle: [
    "Take your time. The hint on the card has the next key.",
    "No rush. The glowing key is the one to press.",
    "Still with you. Click the terminal first if keys do nothing.",
  ],
  wrongKeys: [
    "Close. Check the order of the keys on the card.",
    "Not that one. The hint on the card will help.",
  ],
  wrongModeWindow: [
    "You are typing into the shell. ctrl+b, then esc, gets you to window mode.",
  ],
  wrongModeTerminal: [
    "You are in window mode. Press i to type into the shell.",
  ],
  showMe: [
    "Want a demo? Show me does it slowly, then it is your turn.",
    "Stuck is fine. Show me will play the keys for you.",
  ],
  altBlocked: [
    "Your Option chords are not reaching tuios. Something outside the browser may be taking them. The note on the card explains.",
  ],
  noWindow: ["There is no window to work with. Press n for a new one."],
};

/** When the reader clicks Tilly. */
export const POKE_LINES: readonly string[] = [
  "That tickles.",
  "My eyes are two panes and my mouth is a prompt.",
  "You are doing fine.",
  "Show me is there any time you want a demo.",
  "Three esc presses take you out of the terminal.",
];

const LAYOUT_NAMES: Record<string, string> = {
  bsp: "BSP",
  "master-stack": "Master and stack",
  scrolling: "Scrolling",
};

/** Fill `{name}` slots from `values`. A slot with no value is left out. */
export function fill(
  line: string,
  values: Record<string, string | number | undefined>,
): string {
  return line.replace(/\{(\w+)\}/g, (_, name: string) =>
    String(values[name] ?? ""),
  );
}

/**
 * The slots a reaction line can use, from the event that finished the step.
 * A line whose slot has no value is not picked.
 */
export function slotsFor(event: TuiosEvent | null) {
  const data = event?.data ?? {};
  const values: Record<string, string | number | undefined> = {};
  if (event?.type === "workspace" && data.to !== undefined) {
    values.n = Number(data.to);
  } else if (event?.state?.workspace) {
    values.n = event.state.workspace;
  }
  if (event?.type === "layout" && typeof data.to === "string") {
    values.layout = LAYOUT_NAMES[data.to] ?? data.to;
  }
  if (typeof data.command === "string" && data.command) {
    values.command = data.command;
  }
  return values;
}

/** Whether every slot in the line has a value. */
function fits(line: string, values: Record<string, unknown>) {
  for (const m of line.matchAll(/\{(\w+)\}/g)) {
    const v = values[m[1]];
    if (v === undefined || v === "") return false;
  }
  return true;
}

/**
 * Picks lines so that the same one does not come twice in a row, and
 * recently used ones wait their turn while the pool has others.
 */
export class LinePicker {
  private recent: string[] = [];

  constructor(
    private rand: () => number = Math.random,
    private memory = 6,
  ) {}

  pick(pool: readonly string[]): string {
    if (pool.length === 0) return "";
    const last = this.recent[this.recent.length - 1];
    let choices = pool.filter((l) => !this.recent.includes(l));
    if (choices.length === 0) choices = pool.filter((l) => l !== last);
    if (choices.length === 0) choices = [...pool];
    const i = Math.min(
      choices.length - 1,
      Math.floor(this.rand() * choices.length),
    );
    const line = choices[i];
    this.recent.push(line);
    if (this.recent.length > this.memory) this.recent.shift();
    return line;
  }
}

/** Everything Tilly says in one lesson, with its own memory of lines. */
export class TillyScript {
  private picker: LinePicker;

  constructor(rand: () => number = Math.random) {
    this.picker = new LinePicker(rand);
  }

  greet(track: Track): Speech {
    const pool = GREET_LINES[track.id] ?? GREET_DEFAULT;
    const text = fill(this.picker.pick(pool), { steps: track.steps.length });
    return { text, mood: "wave", sound: "blip" };
  }

  /** After a step, from the event that finished it. */
  react(opts: {
    step: Step;
    event: TuiosEvent | null;
    lastAction?: string;
    result: StepResult;
  }): Speech {
    const { step, event, result } = opts;
    let reaction: Reaction;
    if (result === "skipped") reaction = "skipped";
    else if (step.explainer) reaction = "explainer";
    else reaction = reactionFor(event, opts.lastAction);
    const values = slotsFor(event);
    let pool: readonly string[] = REACTION_LINES[reaction].filter((l) =>
      fits(l, values),
    );
    if (pool.length === 0) pool = REACTION_LINES.generic;
    let text = fill(this.picker.pick(pool), values);
    if (result === "hinted") text = `${this.picker.pick(HINTED_LEAD)} ${text}`;
    const skipped = reaction === "skipped";
    return {
      text,
      mood: skipped ? "idle" : "happy",
      sound: skipped ? "blip" : "chime",
    };
  }

  nudge(kind: Nudge): Speech {
    return {
      text: this.picker.pick(NUDGE_LINES[kind]),
      mood: "think",
      sound: "nudge",
    };
  }

  finish(track: Track, results: StepResult[]): Speech {
    const own = FINISH_LINES[track.id] ?? [];
    const clean = results.filter((r) => r === "clean").length;
    const values = { clean, total: results.length };
    const pool = [...own, ...FINISH_DEFAULT].filter((l) => fits(l, values));
    return {
      text: fill(this.picker.pick(pool), values),
      mood: "cheer",
      sound: "fanfare",
    };
  }

  poke(): Speech {
    return { text: this.picker.pick(POKE_LINES), mood: "wave", sound: "blip" };
  }
}

/**
 * Which nudge the lesson's current look calls for, most specific first, or
 * null. The inputs are what the step card already shows: the hint level from
 * hintLevel, the wrong mode note, the no window note and altChordBlocked.
 */
export function nudgeFor(opts: {
  level: 0 | 1 | 2;
  wrong: number;
  wrongMode: boolean;
  needs?: "window" | "terminal";
  noWindow: boolean;
  altBlocked: boolean;
}): Nudge | null {
  if (opts.noWindow) return "noWindow";
  if (opts.altBlocked) return "altBlocked";
  if (opts.wrongMode) {
    return opts.needs === "terminal" ? "wrongModeTerminal" : "wrongModeWindow";
  }
  if (opts.level >= 2) return "showMe";
  if (opts.level >= 1) return opts.wrong > 0 ? "wrongKeys" : "idle";
  return null;
}
