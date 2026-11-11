/**
 * What Tilly, the tuios mascot, says on /learn and how Tilly looks while
 * saying it. Plain data and functions, so the lines and the event mapping can
 * be tested without a page. The component in components/learn/tilly.tsx only
 * draws what this returns.
 */
import { coach, type Track } from "./lessons";
import type { StepResult, TuiosEvent } from "./types";

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

/**
 * The lines come from the lessons in tuios (lessons.json, the `coach` of the
 * document and of each track), so the page and `tuios tutor` say the same.
 */
export const REACTION_LINES = coach.reactions as Record<
  Reaction,
  readonly string[]
>;

/** Said before the reaction when the step needed the hint or Show me. */
export const HINTED_LEAD: readonly string[] = coach.hintedLead;

/** When the reader seems stuck. They point at the help on the card. */
export const NUDGE_LINES = coach.nudges as Record<Nudge, readonly string[]>;

/** When the reader clicks Tilly. */
export const POKE_LINES: readonly string[] = coach.poke;

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
    const pool = track.coach?.greet?.length ? track.coach.greet : coach.greet;
    const text = fill(this.picker.pick(pool), { steps: track.steps.length });
    return { text, mood: "wave", sound: "blip" };
  }

  /** After a step, from the event that finished it. */
  react(opts: {
    /** The step was an explainer, read and not played. */
    explainer: boolean;
    event: TuiosEvent | null;
    lastAction?: string;
    result: StepResult;
  }): Speech {
    const { event, result } = opts;
    let reaction: Reaction;
    if (result === "skipped") reaction = "skipped";
    else if (opts.explainer) reaction = "explainer";
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
    const own = track.coach?.finish ?? [];
    const clean = results.filter((r) => r === "clean").length;
    const values = { clean, total: results.length };
    const pool = [...own, ...coach.finish].filter((l) => fits(l, values));
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

/** Whether a nudge name from the engine is one Tilly has lines for. */
export function isNudge(name: string): name is Nudge {
  return name in NUDGE_LINES;
}
