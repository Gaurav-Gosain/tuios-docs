/**
 * Small pieces that decide when a step is done. Each one reads the event
 * stream from tuios, never the page's own keystrokes, so the command palette
 * and the mouse count too.
 */
import type { MatchContext, Matcher, TuiosEvent, TuiosState } from "./types";

/** An event of this type, optionally with a check on it. */
export function on(
  type: string,
  check?: (event: TuiosEvent, ctx: MatchContext) => boolean,
): Matcher {
  return (event, ctx) => event.type === type && (!check || check(event, ctx));
}

/** A state change whose new value is `to`. */
export function changed(type: string, to: unknown): Matcher {
  return on(type, (event) => event.data?.to === to);
}

/** Any state event after which the state passes the check. */
export function whenState(check: (state: TuiosState) => boolean): Matcher {
  return (event) => Boolean(event.state && check(event.state));
}

/** An overlay opened, such as "help" or "commandPalette". */
export function opened(name: string): Matcher {
  return on("overlay.open", (event) => event.data?.name === name);
}

/** An overlay closed. */
export function closed(name: string): Matcher {
  return on("overlay.close", (event) => event.data?.name === name);
}

/** The fake shell finished this command, and knew it. */
export function ran(command: string): Matcher {
  return on(
    "shell.command",
    (event) => event.data?.command === command && event.data?.exitCode !== 127,
  );
}

/** The fake shell finished a command line that matches. */
export function ranLine(pattern: RegExp): Matcher {
  return on("shell.command", (event) =>
    pattern.test(String(event.data?.line ?? "")),
  );
}

/** A pane's agent moved to this state. */
export function agent(to: string): Matcher {
  return on("agent", (event) => event.data?.to === to);
}

/** An event caused by one of these registry actions. */
export function via(actions: string[], matcher: Matcher): Matcher {
  return (event, ctx) =>
    matcher(event, ctx) && actions.includes(ctx.lastAction);
}

/** Any one of the matchers. */
export function any(...matchers: Matcher[]): Matcher {
  return (event, ctx) => matchers.some((m) => m(event, ctx));
}

/** The matcher, `n` times over the step. */
export function times(n: number, matcher: Matcher, key = "count"): Matcher {
  return (event, ctx) => {
    if (!matcher(event, ctx)) return false;
    ctx.mem[key] = (ctx.mem[key] ?? 0) + 1;
    return ctx.mem[key] >= n;
  };
}

/** Each matcher in turn: the step is done when the last one matches. */
export function seq(...matchers: Matcher[]): Matcher {
  return (event, ctx) => {
    const at = ctx.mem.seq ?? 0;
    if (!matchers[at]?.(event, ctx)) return false;
    ctx.mem.seq = at + 1;
    return ctx.mem.seq >= matchers.length;
  };
}

/** The focused window zoomed in (true) or back out (false). */
export function zoomed(value: boolean): Matcher {
  return on("window.zoom", (event) => event.data?.zoomed === value);
}

/** A window moved or changed size, once any animation settled. */
export function moved(): Matcher {
  return on("window.move");
}

/** A note in the dock whose text matches. */
export function notified(pattern: RegExp): Matcher {
  return on("notification", (event) =>
    pattern.test(String(event.data?.message ?? "")),
  );
}

/** A setting the settings page changes, such as "borderStyle". */
export function setting(name: string): Matcher {
  return on("setting", (event) => event.data?.name === name);
}
