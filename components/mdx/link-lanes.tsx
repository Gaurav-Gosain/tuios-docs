"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * One ssh link between two tuios daemons, drawn as the streams multiplexed on
 * it. Three bugs from the federation work, each stepped through before and
 * after its fix:
 *
 *  - ids: both ends allocated stream ids from 1 (5542193f).
 *  - deadline: a write deadline armed for a verb reply stayed on the relayed
 *    connection (e18cf535).
 *  - ctrl+D: the far proxy closed the stream from a defer that ran behind a
 *    blocked copy (c66c1311).
 *
 * The first id on each end is the real one. The ids of later streams are
 * picked to follow the odd and even rule, not read from a trace.
 */

type Owner = "hub" | "peer";
type LaneState = "live" | "waiting" | "bad" | "closed";
type Tone = "good" | "bad" | "neutral";

interface Lane {
  id: number;
  owner: Owner;
  label: string;
  state: LaneState;
  /** Replaces the word the state would print. */
  status?: string;
}

interface Frame {
  lanes: Lane[];
  hub: string[];
  peer: string[];
  caption: string;
  verdict?: { tone: Tone; text: string };
  /** The deadline scenario runs a clock on this step. */
  clock?: boolean;
}

interface Scenario {
  key: string;
  name: string;
  steps: string[];
  old: Frame[];
  fixed: Frame[];
}

const control = (state: LaneState = "live"): Lane => ({
  id: 1,
  owner: "hub",
  label: "control",
  state,
});

const SCENARIOS: Scenario[] = [
  {
    key: "ids",
    name: "stream ids",
    steps: [
      "open control stream",
      "peer opens a stream",
      "hub answers",
      "delete the refusal",
    ],
    old: [
      {
        lanes: [control()],
        hub: ["dialed the link", "next id: 2"],
        peer: ["answered the link", "next id: 1"],
        caption:
          "The hub dials, so it opens the control stream. It takes id 1. Both ends count from 1.",
      },
      {
        lanes: [
          { ...control("bad"), status: "collides" },
          {
            id: 1,
            owner: "peer",
            label: "peer open",
            state: "bad",
            status: "collides",
          },
        ],
        hub: ["holds stream 1"],
        peer: ["opens stream 1"],
        caption:
          "The peer opens its first stream. It also counts from 1, so it names the hub’s own control stream.",
        verdict: { tone: "bad", text: "id 1 is used twice" },
      },
      {
        lanes: [
          control(),
          { id: 1, owner: "peer", label: "peer open", state: "closed" },
        ],
        hub: ["refusal: close 1"],
        peer: ["sees: close on 1"],
        caption:
          "The refusal answers with a close on id 1. The peer sees its stream closed.",
        verdict: { tone: "neutral", text: "peer sees a close" },
      },
      {
        lanes: [
          control(),
          { id: 1, owner: "peer", label: "peer open", state: "closed" },
        ],
        hub: ["refusal: deleted", "duplicate check: close 1"],
        peer: ["sees: close on 1"],
        caption:
          "Delete the refusal. The duplicate id check finds id 1 in use and sends the same close. The peer cannot tell the two apart, so the test stays green.",
        verdict: { tone: "bad", text: "test passes without the refusal" },
      },
    ],
    fixed: [
      {
        lanes: [control()],
        hub: ["dialed the link", "allocates 1, 3, 5"],
        peer: ["answered the link", "allocates 2, 4, 6"],
        caption:
          "The dialer takes odd ids and the answerer even ones, the way ssh and HTTP/2 split them. The control stream is still id 1.",
      },
      {
        lanes: [
          control(),
          { id: 2, owner: "peer", label: "peer open", state: "waiting" },
        ],
        hub: ["holds stream 1"],
        peer: ["opens stream 2"],
        caption:
          "The peer’s first stream is id 2. It cannot name anything the hub owns.",
      },
      {
        lanes: [
          control(),
          { id: 2, owner: "peer", label: "peer open", state: "closed" },
        ],
        hub: ["refusal: close 2", "list-sessions: answered"],
        peer: ["sees: close on 2"],
        caption:
          "The refusal is the only code that can answer id 2. It sends a close, and the control stream keeps answering verbs.",
        verdict: { tone: "good", text: "refused, and the link is still up" },
      },
      {
        lanes: [
          control(),
          {
            id: 2,
            owner: "peer",
            label: "peer open",
            state: "bad",
            status: "not closed",
          },
        ],
        hub: ["refusal: deleted", "nothing closes 2"],
        peer: ["stream 2 stays open"],
        caption:
          "Delete the refusal and nothing closes id 2. The test sees that and fails, which is its job.",
        verdict: { tone: "good", text: "test fails without the refusal" },
      },
    ],
  },
  {
    key: "deadline",
    name: "11 second drop",
    steps: ["ask for a connection", "relay starts", "pane prints"],
    old: [
      {
        lanes: [
          control(),
          { id: 3, owner: "hub", label: "relay", state: "waiting" },
        ],
        hub: ["open-host-connection", "reply write deadline: now + 10 s"],
        peer: ["proxy dials daemon"],
        caption:
          "A client asks its own daemon for a connection to the host. The answer is a verb reply, written under a ten second write deadline on the client’s socket.",
      },
      {
        lanes: [
          control(),
          { id: 3, owner: "hub", label: "relay", state: "live" },
        ],
        hub: ["read deadline: cleared", "write deadline: still armed"],
        peer: ["far session attached"],
        caption:
          "The relay takes over the socket. It clears the read deadline and leaves the write one. A net.Conn deadline is a point in time, not a budget per write.",
      },
      {
        lanes: [
          control(),
          {
            id: 3,
            owner: "hub",
            label: "relay",
            state: "bad",
            status: "i/o timeout",
          },
        ],
        hub: ["write: i/o timeout", "client: link lost"],
        peer: ["pane prints a line"],
        caption:
          'The far pane prints something. The write to the client fails with "i/o timeout", and the client is told it lost the link. No network was involved.',
        verdict: { tone: "bad", text: "dropped, every attach" },
        clock: true,
      },
    ],
    fixed: [
      {
        lanes: [
          control(),
          { id: 3, owner: "hub", label: "relay", state: "waiting" },
        ],
        hub: ["open-host-connection", "reply write deadline: now + 10 s"],
        peer: ["proxy dials daemon"],
        caption:
          "Same start. The reply still goes out under a ten second write deadline.",
      },
      {
        lanes: [
          control(),
          { id: 3, owner: "hub", label: "relay", state: "live" },
        ],
        hub: ["read deadline: cleared", "write deadline: cleared"],
        peer: ["far session attached"],
        caption:
          "The relay clears both deadlines. A pane can be silent for hours, and a busy one can write for hours.",
      },
      {
        lanes: [
          control(),
          { id: 3, owner: "hub", label: "relay", state: "live" },
        ],
        hub: ["write: ok"],
        peer: ["pane prints a line"],
        caption: "The pane prints at eleven seconds, and nothing is racing it.",
        verdict: { tone: "good", text: "still attached" },
        clock: true,
      },
    ],
  },
  {
    key: "ctrld",
    name: "ctrl+D",
    steps: ["attach pane", "far process exits", "wait", "press a key"],
    old: [
      {
        lanes: [
          control(),
          { id: 5, owner: "hub", label: "pane", state: "live" },
        ],
        hub: ["window: open"],
        peer: [
          "copy A, daemon to stream: running",
          "copy B, stream to daemon: running",
        ],
        caption:
          "On the far machine the proxy runs two copies for the pane’s stream, one in each direction.",
      },
      {
        lanes: [
          control(),
          { id: 5, owner: "hub", label: "pane", state: "live" },
        ],
        hub: ["window: open", 'screen shows "exit"'],
        peer: [
          "copy A: end of file, returned",
          "copy B: blocked reading stream",
        ],
        caption:
          'ctrl+D. The shell prints "exit" and ends, the far daemon closes its connection, and copy A returns.',
      },
      {
        lanes: [
          control(),
          {
            id: 5,
            owner: "hub",
            label: "pane",
            state: "bad",
            status: "still open",
          },
        ],
        hub: ["window: still open"],
        peer: ["close: in a defer", "defer: waits for copy B"],
        caption:
          "The close is in a defer, and the defer runs after waiting for copy B. Copy B is waiting for bytes from the laptop. Nothing tells the laptop anything.",
        verdict: { tone: "bad", text: "window stays open" },
      },
      {
        lanes: [
          control(),
          { id: 5, owner: "hub", label: "pane", state: "closed" },
        ],
        hub: ["key sent", "window: closed"],
        peer: ["copy B: write fails, returns", "defer: close stream"],
        caption:
          "A keypress crosses the link. Copy B writes it to the dead connection, fails and returns. The wait ends, the defer closes the stream, and the window closes, one key late.",
        verdict: { tone: "neutral", text: "closed by the next key" },
      },
    ],
    fixed: [
      {
        lanes: [
          control(),
          { id: 5, owner: "hub", label: "pane", state: "live" },
        ],
        hub: ["window: open"],
        peer: [
          "copy A, daemon to stream: running",
          "copy B, stream to daemon: running",
        ],
        caption: "Same two copies.",
      },
      {
        lanes: [
          control(),
          { id: 5, owner: "hub", label: "pane", state: "closed" },
        ],
        hub: ["stream: closed", "window: closed"],
        peer: ["copy A: end of file, returned", "close stream now"],
        caption:
          "Copy A returns and the stream is closed right there. Copy A ran to end of file, so everything the daemon sent is already on the stream.",
        verdict: { tone: "good", text: "window closes" },
      },
      {
        lanes: [
          control(),
          { id: 5, owner: "hub", label: "pane", state: "closed" },
        ],
        hub: ["window: closed"],
        peer: ["defer: close again, no-op"],
        caption: "The defer still runs, and closing twice is harmless.",
        verdict: { tone: "good", text: "nothing to wait for" },
      },
      {
        lanes: [
          control(),
          { id: 5, owner: "hub", label: "pane", state: "closed" },
        ],
        hub: ["window: closed"],
        peer: [],
        caption: "There is no stream left for a key to wake.",
        verdict: { tone: "good", text: "closed on ctrl+D" },
      },
    ],
  },
];

/** When the relayed write fails: the deadline is ten seconds after the reply. */
const DEADLINE_S = 10;
const CLOCK_END_S = 11;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

const OWNER = {
  hub: {
    bar: "border-sky-600/60 bg-sky-500/12 text-sky-800 dark:border-sky-400/60 dark:text-sky-200",
    dot: "bg-sky-600 dark:bg-sky-400",
  },
  peer: {
    bar: "border-amber-600/60 bg-amber-500/12 text-amber-800 dark:border-amber-400/60 dark:text-amber-200",
    dot: "bg-amber-600 dark:bg-amber-400",
  },
} as const;

const TONE: Record<Tone, string> = {
  good: "text-emerald-700 dark:text-emerald-300",
  bad: "text-red-700 dark:text-red-400",
  neutral: "text-fd-muted-foreground",
};

function LaneRow({ lane }: { lane: Lane }) {
  const fromPeer = lane.owner === "peer";
  const stateText =
    lane.status ??
    { live: "open", waiting: "opening", bad: "broken", closed: "closed" }[
      lane.state
    ];
  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded border px-2 py-1 font-mono text-[11px] leading-tight motion-safe:transition-colors motion-safe:duration-300 sm:text-xs",
        fromPeer && "flex-row-reverse text-right",
        lane.state === "bad"
          ? "border-red-600/70 bg-red-500/12 text-red-800 dark:border-red-400/70 dark:text-red-300"
          : OWNER[lane.owner].bar,
        lane.state === "waiting" && "border-dashed",
        lane.state === "closed" && "opacity-50",
      )}
    >
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          lane.state === "bad"
            ? "bg-red-600 dark:bg-red-400"
            : OWNER[lane.owner].dot,
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          lane.state === "closed" && "line-through",
        )}
      >
        {lane.id} {lane.label}
      </span>
      <span className="shrink-0 opacity-80">{stateText}</span>
    </li>
  );
}

function Machine({
  owner,
  title,
  sub,
}: {
  owner: Owner;
  title: string;
  sub: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center rounded-md border px-2 py-3 text-center",
        OWNER[owner].bar,
      )}
    >
      <span className="font-mono text-xs font-medium sm:text-sm">{title}</span>
      <span className="mt-0.5 text-[10px] opacity-80 sm:text-xs">{sub}</span>
    </div>
  );
}

/**
 * Three bugs on one federation link, stepped through before and after their
 * fixes.
 */
export function LinkLanes() {
  const [scenarioKey, setScenarioKey] = useState(SCENARIOS[0].key);
  const [fixed, setFixed] = useState(false);
  const [step, setStep] = useState(0);
  const [clock, setClock] = useState(0);
  const reduced = usePrefersReducedMotion();

  const scenario = SCENARIOS.find((s) => s.key === scenarioKey) ?? SCENARIOS[0];
  const frames = fixed ? scenario.fixed : scenario.old;
  const frame = frames[Math.min(step, frames.length - 1)];

  // The clock is seconds since the reply went out. It only runs on the step
  // that has one, and jumps straight to the end when motion is reduced.
  useEffect(() => {
    if (!frame.clock) {
      setClock(scenario.key === "deadline" && step > 0 ? 1 : 0);
      return;
    }
    if (reduced) {
      setClock(CLOCK_END_S);
      return;
    }
    setClock(1);
    const timer = window.setInterval(() => {
      setClock((c) => {
        const next = Math.min(CLOCK_END_S, Math.round((c + 0.2) * 10) / 10);
        if (next >= CLOCK_END_S) window.clearInterval(timer);
        return next;
      });
    }, 80);
    return () => window.clearInterval(timer);
  }, [frame, reduced, scenario.key, step]);

  const clockDone = !frame.clock || clock >= CLOCK_END_S;
  // Until the pane prints, the relay is still fine and nothing has failed.
  const showLanes = clockDone
    ? frame.lanes
    : frame.lanes.map((l) =>
        l.id === 3 ? { ...l, state: "live" as const, status: undefined } : l,
      );
  const hubLines = clockDone ? frame.hub : ["relaying"];
  const peerLines = clockDone ? frame.peer : ["pane idle"];
  const caption = clockDone
    ? frame.caption
    : fixed
      ? "Time passes. The relay has no deadline."
      : "Time passes. The deadline set for the reply is still armed.";

  const pick = (key: string) => {
    setScenarioKey(key);
    setStep(0);
  };

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-fd-border p-3">
        <fieldset className="m-0 flex flex-wrap gap-1 border-0 p-0">
          <legend className="sr-only">Bug</legend>
          {SCENARIOS.map((s) => (
            <button
              key={s.key}
              type="button"
              aria-pressed={s.key === scenario.key}
              onClick={() => pick(s.key)}
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-xs",
                s.key === scenario.key
                  ? "border-fd-primary bg-fd-primary/10 text-fd-foreground"
                  : "border-fd-border text-fd-muted-foreground hover:text-fd-foreground",
              )}
            >
              {s.name}
            </button>
          ))}
        </fieldset>
        <fieldset className="m-0 ml-auto flex overflow-hidden rounded-md border border-fd-border p-0">
          <legend className="sr-only">Version</legend>
          {[false, true].map((f) => (
            <button
              key={String(f)}
              type="button"
              aria-pressed={fixed === f}
              onClick={() => setFixed(f)}
              className={cn(
                "px-2.5 py-1 font-mono text-xs",
                fixed === f
                  ? "bg-fd-primary/10 text-fd-foreground"
                  : "text-fd-muted-foreground hover:text-fd-foreground",
              )}
            >
              {f ? "fixed" : "old"}
            </button>
          ))}
        </fieldset>
      </div>

      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-[4.75rem_1fr_4.75rem] items-stretch gap-2 sm:grid-cols-[8rem_1fr_8rem] sm:gap-3">
          <Machine owner="hub" title="laptop" sub="hub daemon" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="truncate text-center font-mono text-[10px] text-fd-muted-foreground sm:text-[11px]">
              ssh BatchMode=yes build tuios stdio-proxy
            </div>
            <ul
              className="flex flex-col gap-1.5"
              aria-label="Streams on the link"
            >
              {showLanes.map((lane) => (
                <LaneRow
                  key={`${lane.owner}-${lane.id}-${lane.label}`}
                  lane={lane}
                />
              ))}
            </ul>
          </div>
          <Machine owner="peer" title="build" sub="far daemon" />
        </div>

        {scenario.key === "deadline" && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between font-mono text-[11px] text-fd-muted-foreground">
              <span>t = {clock.toFixed(1)} s since the reply</span>
              <span>
                {fixed && step > 0
                  ? "no write deadline"
                  : clock < DEADLINE_S
                    ? `deadline in ${(DEADLINE_S - clock).toFixed(1)} s`
                    : "deadline passed"}
              </span>
            </div>
            <div
              className="relative h-2 rounded-full bg-fd-muted"
              role="img"
              aria-label={`Clock at ${clock.toFixed(0)} seconds of ${CLOCK_END_S}. The write deadline is at ${DEADLINE_S} seconds${fixed && step > 0 ? ", and the relay has cleared it" : ""}.`}
            >
              <div
                className={cn(
                  "h-full rounded-full",
                  !fixed && clock > DEADLINE_S
                    ? "bg-red-600 dark:bg-red-400"
                    : "bg-sky-600 dark:bg-sky-400",
                )}
                style={{ width: `${(clock / CLOCK_END_S) * 100}%` }}
              />
              <div
                className={cn(
                  "absolute -top-1 h-4 w-0.5",
                  fixed && step > 0
                    ? "bg-fd-muted-foreground/30"
                    : "bg-red-600 dark:bg-red-400",
                )}
                style={{ left: `${(DEADLINE_S / CLOCK_END_S) * 100}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3 font-mono text-[11px] leading-snug sm:text-xs">
          <ul
            className="flex flex-col gap-0.5 text-sky-800 dark:text-sky-200"
            aria-label="laptop"
          >
            {hubLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <ul
            className="flex flex-col gap-0.5 text-right text-amber-800 dark:text-amber-200"
            aria-label="build"
          >
            {peerLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-fd-border p-3 sm:p-4">
        <ol className="mb-3 flex flex-wrap gap-1" aria-label="Steps">
          {scenario.steps.map((name, i) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={i === step ? "step" : undefined}
                className={cn(
                  "rounded border px-2 py-0.5 font-mono text-[11px]",
                  i === step
                    ? "border-fd-primary bg-fd-primary/10 text-fd-foreground"
                    : i < step
                      ? "border-fd-border text-fd-foreground"
                      : "border-fd-border text-fd-muted-foreground",
                )}
              >
                {i + 1}. {name}
              </button>
            </li>
          ))}
        </ol>
        <p
          className="min-h-[4.5rem] text-sm text-fd-foreground sm:min-h-[3rem]"
          aria-live="polite"
        >
          {caption}
          {frame.verdict && clockDone && (
            <>
              {" "}
              <strong className={cn("font-medium", TONE[frame.verdict.tone])}>
                {frame.verdict.text}.
              </strong>
            </>
          )}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-md border border-fd-border px-3 py-1 text-sm disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() =>
              setStep((s) => Math.min(scenario.steps.length - 1, s + 1))
            }
            disabled={step === scenario.steps.length - 1}
            className="rounded-md border border-fd-border bg-fd-primary/10 px-3 py-1 text-sm disabled:opacity-40"
          >
            Next step
          </button>
        </div>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        One link, three bugs. Pick a bug, step through it, then flip to the fix.
        Blue streams were opened by the laptop, amber ones by the far machine.
        The first id on each side is the real one. Later ids follow the odd and
        even rule and are not read from a trace.
      </figcaption>
    </figure>
  );
}
