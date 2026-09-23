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

/** The fake shell ran this command. */
export function ran(command: string): Matcher {
  return on("shell.command", (event) => event.data?.command === command);
}

/** An event of this type caused by a key bound to one of these actions. */
export function via(actions: string[], matcher: Matcher): Matcher {
  return (event, ctx) =>
    matcher(event, ctx) && actions.includes(ctx.lastAction);
}

/** Any one of the matchers. */
export function any(...matchers: Matcher[]): Matcher {
  return (event, ctx) => matchers.some((m) => m(event, ctx));
}

/** The matcher, `times` times over the step. */
export function times(n: number, matcher: Matcher, key = "count"): Matcher {
  return (event, ctx) => {
    if (!matcher(event, ctx)) return false;
    ctx.mem[key] = (ctx.mem[key] ?? 0) + 1;
    return ctx.mem[key] >= n;
  };
}

/** `first`, then later `then`. */
export function seq(first: Matcher, then: Matcher): Matcher {
  return (event, ctx) => {
    if (!ctx.mem.seq) {
      if (first(event, ctx)) ctx.mem.seq = 1;
      return false;
    }
    return then(event, ctx);
  };
}
