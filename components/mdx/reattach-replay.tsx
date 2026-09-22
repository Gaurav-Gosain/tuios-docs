"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Two small models of the two halves of the post.
 *
 * The replay tab is the rolled reattach from issue #123. A top-like program
 * repaints the same six rows on every tick, one chunk of output per tick. The
 * client restored a snapshot taken after chunk 4, and the daemon's catch-up
 * ring holds four and a half chunks. Once the pane has produced enough while
 * the client was away, the ring no longer holds the snapshot's position. The
 * old path cleared the screen and replayed the ring from its first byte, which
 * is the middle of a chunk. The new path keeps the snapshot and replays from
 * the first whole chunk inside the ring (chunkMarks, SubscribeFromSnapshot).
 *
 * The timeline tab compares the old 30 second ticker with the saver that polls
 * a dirty flag every 2 seconds and still writes every 30 seconds regardless.
 * Both follow internal/session/resurrection.go.
 */

// ---------------------------------------------------------------- replay model

const SNAPSHOT_AT = 4; // the snapshot was taken after chunk 4
const RING_CHUNKS = 4.5; // ring capacity, in chunk widths
const MAX_PRODUCED = 8;
const REPAINTED = [0, 2, 7, 8, 9, 10]; // rows top rewrites on each tick

const PROCS = [
  { pid: " 1234", user: "gaurav", cmd: "tuios" },
  { pid: "  812", user: "root  ", cmd: "Xorg" },
  { pid: "  977", user: "gaurav", cmd: "pipewire" },
  { pid: "    1", user: "root  ", cmd: "systemd" },
];

/** The full screen top shows after it has drawn chunk k. */
function topScreen(k: number): string[] {
  const secs = String((7 + k * 3) % 60).padStart(2, "0");
  const load = (0.3 + ((k * 7) % 10) / 100).toFixed(2);
  const us = (2 + ((k * 13) % 50) / 10).toFixed(1);
  const cpu = (i: number) =>
    ((((k + 1) * (i + 3) * 17) % 90) / 10).toFixed(1).padStart(4);
  return [
    `top - 10:42:${secs} up 3 days, load ${load}`,
    "Tasks: 214 total,   1 running",
    `%Cpu(s): ${us.padStart(4)} us,  1.2 sy`,
    "MiB Mem :  15876.2 total",
    "MiB Swap:   2048.0 total",
    "",
    "  PID USER    %CPU COMMAND",
    ...PROCS.map((p, i) => `${p.pid} ${p.user}  ${cpu(i)} ${p.cmd}`),
  ];
}

/** A stable name per screen row, for React keys. */
const ROW_IDS = [
  "uptime",
  "tasks",
  "cpu",
  "mem",
  "swap",
  "gap",
  "head",
  "p1",
  "p2",
  "p3",
  "p4",
];

type Path = "old" | "new";

interface Replay {
  rolled: boolean;
  ringStart: number;
  end: number;
  partial: number | null; // the chunk the ring starts inside, if any
  firstWhole: number; // first chunk replayed whole
  rows: string[];
  matches: boolean;
  blank: number;
  sends: string;
}

function replay(produced: number, path: Path): Replay {
  const end = SNAPSHOT_AT + produced;
  const ringStart = Math.max(0, end - RING_CHUNKS);
  const rolled = ringStart > SNAPSHOT_AT;
  const daemon = topScreen(end);

  if (!rolled) {
    // The ring still holds fromSeq: both paths replay from it on top of the
    // snapshot, and the screen converges.
    return {
      rolled,
      ringStart,
      end,
      partial: null,
      firstWhole: SNAPSHOT_AT + 1,
      rows: daemon,
      matches: true,
      blank: 0,
      sends: `chunks ${SNAPSHOT_AT + 1} to ${end}, from the snapshot's position`,
    };
  }

  const partial = Math.floor(ringStart) + 1; // chunk k spans [k-1, k)
  const firstWhole = partial + 1;

  if (path === "new") {
    // Snapshot kept; whole chunks repaint the rows top rewrites. Rows top does
    // not rewrite keep the snapshot's copy, which is still right.
    const snap = topScreen(SNAPSHOT_AT);
    const rows = snap.map((row, i) =>
      REPAINTED.includes(i) ? daemon[i] : row,
    );
    return {
      rolled,
      ringStart,
      end,
      partial,
      firstWhole,
      rows,
      matches: rows.every((r, i) => r === daemon[i]),
      blank: 0,
      sends: `chunks ${firstWhole} to ${end}, whole, on top of the snapshot`,
    };
  }

  // Old path: clear, then the ring from its first byte. Only the rows a
  // replayed chunk rewrites come back. The rest were only in the snapshot.
  const rows = daemon.map((row, i) => (REPAINTED.includes(i) ? row : ""));
  const blank = daemon.filter((r, i) => r !== "" && rows[i] === "").length;
  return {
    rolled,
    ringStart,
    end,
    partial,
    firstWhole,
    rows,
    matches: false,
    blank,
    sends: `a screen clear, the second half of chunk ${partial} (it opens with "9;1H", the tail of a cursor move, printed as text), then chunks ${firstWhole} to ${end}`,
  };
}

function RingStrip({ r, path }: { r: Replay; path: Path }) {
  const total = SNAPSHOT_AT + MAX_PRODUCED;
  const pct = (x: number) => `${(x / total) * 100}%`;
  const replayFrom = !r.rolled
    ? SNAPSHOT_AT
    : path === "old"
      ? r.ringStart
      : r.firstWhole - 1;

  return (
    <div className="px-4 pt-4">
      <div className="relative h-16">
        {/* chunks */}
        {Array.from({ length: total }, (_, i) => {
          const k = i + 1;
          const exists = k <= r.end;
          const gone = i + 1 <= r.ringStart;
          const split = r.partial === k;
          return (
            <div
              key={k}
              className={cn(
                "absolute top-5 flex h-7 items-center justify-center overflow-hidden rounded-sm border font-mono text-[10px] tabular-nums",
                !exists &&
                  "border-dashed border-fd-border text-fd-muted-foreground/40",
                exists &&
                  gone &&
                  "border-fd-border bg-fd-muted/40 text-fd-muted-foreground/60",
                exists &&
                  !gone &&
                  "border-fd-primary/50 bg-fd-primary/10 text-fd-foreground",
              )}
              style={{
                left: `calc(${pct(i)} + 1px)`,
                width: `calc(${pct(1)} - 2px)`,
              }}
            >
              {split ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-1/2 bg-fd-muted/80"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, transparent 0 3px, color-mix(in oklab, var(--color-fd-muted-foreground) 30%, transparent) 3px 4px)",
                  }}
                />
              ) : null}
              <span className="relative">{k}</span>
            </div>
          );
        })}
        {/* ring bracket */}
        <div
          className="absolute top-13 h-2 border-x border-b border-fd-primary transition-[left,width] duration-200 motion-reduce:transition-none"
          style={{ left: pct(r.ringStart), width: pct(r.end - r.ringStart) }}
          aria-hidden="true"
        />
        {/* snapshot marker */}
        <div
          className="absolute top-3 h-11 border-l-2 border-fd-foreground"
          style={{ left: pct(SNAPSHOT_AT) }}
          aria-hidden="true"
        />
        <span
          className="absolute top-0 -translate-x-full whitespace-nowrap pr-1 font-mono text-[10px] text-fd-foreground"
          style={{ left: pct(SNAPSHOT_AT) }}
        >
          snapshot
        </span>
        {/* replay start */}
        <span
          className="absolute top-0 whitespace-nowrap font-mono text-[10px] text-fd-primary transition-[left] duration-200 motion-reduce:transition-none"
          style={{
            left: `calc(${pct(Math.min(replayFrom, total - 2.2))} + 4px)`,
          }}
        >
          {replayFrom > SNAPSHOT_AT ? "↓ replay" : ""}
        </span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-fd-muted-foreground">
        ring: the last 4.5 chunks of output (bracket). hatched: the half of a
        chunk that rolled out.
      </p>
    </div>
  );
}

function ReplayTab() {
  const [produced, setProduced] = useState(6);
  const [path, setPath] = useState<Path>("old");
  const r = useMemo(() => replay(produced, path), [produced, path]);
  const sliderId = useId();
  const rolledBy = r.ringStart - SNAPSHOT_AT;

  return (
    <div>
      <RingStrip r={r} path={path} />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-fd-border p-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor={sliderId}
            className="text-sm text-fd-muted-foreground"
          >
            chunks the pane produced while you were away
          </label>
          <div className="flex items-center gap-3">
            <input
              id={sliderId}
              type="range"
              min={1}
              max={MAX_PRODUCED}
              step={1}
              value={produced}
              onChange={(e) => setProduced(Number(e.target.value))}
              className="w-44 accent-current"
            />
            <span className="w-4 font-mono text-sm tabular-nums text-fd-foreground">
              {produced}
            </span>
          </div>
        </div>
        <div
          className="flex gap-1"
          role="radiogroup"
          aria-label="Which replay path"
        >
          {(
            [
              ["old", "before: clear, raw tail"],
              ["new", "after: whole chunks"],
            ] as const
          ).map(([value, label]) => (
            // biome-ignore lint/a11y/useSemanticElements: styled radio buttons
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={path === value}
              onClick={() => setPath(value)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary",
                path === value
                  ? "border-fd-primary bg-fd-primary/10 text-fd-foreground"
                  : "border-fd-border text-fd-muted-foreground hover:text-fd-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <p className="mb-3 text-sm text-fd-foreground" aria-live="polite">
          {r.rolled
            ? `The ring has rolled ${rolledBy} chunks past the snapshot. `
            : "The ring still holds the snapshot position, so both paths replay from it. "}
          <span className="text-fd-muted-foreground">
            The client is sent {r.sends}.
          </span>
        </p>
        <div className="overflow-x-auto rounded-md border border-fd-border bg-fd-background">
          <pre className="min-w-max px-3 py-2 font-mono text-xs leading-5">
            {r.rows.map((row, i) => (
              <div
                key={ROW_IDS[i]}
                className={cn(
                  row === "" &&
                    topScreen(r.end)[i] !== "" &&
                    "bg-fd-primary/10",
                  "text-fd-foreground",
                )}
              >
                {row || " "}
              </div>
            ))}
          </pre>
        </div>
        <p className="mt-2 font-mono text-xs text-fd-muted-foreground">
          {r.matches
            ? "client screen matches the daemon"
            : `client screen differs from the daemon: ${r.blank} rows blank (shaded)`}
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------- kill timeline

const SPAN = 64;
const EVENTS = [
  { t: 0, label: "new session, 1 window" },
  { t: 35, label: "second window" },
];

function oldWrites(): number[] {
  return [30, 60];
}

/** Save-on-change: a 2s poll of a dirty flag, plus a write 30s after the last one. */
function newWrites(): number[] {
  const out: number[] = [];
  let last = 0;
  let dirty = false;
  const pending = [...EVENTS];
  for (let t = 2; t <= SPAN; t += 2) {
    while (pending.length && pending[0].t < t) {
      pending.shift();
      dirty = true;
    }
    if (dirty || t - last >= 30) {
      out.push(t);
      last = t;
      dirty = false;
    }
  }
  return out;
}

function onDisk(writes: number[], kill: number): string {
  const done = writes.filter((w) => w <= kill);
  if (!done.length) return "nothing on disk: the session is gone";
  const at = done[done.length - 1];
  const windows = EVENTS.filter((e) => e.t < at).length;
  const lost = EVENTS.filter((e) => e.t >= at && e.t < kill).length;
  return `the session, ${windows} window${windows === 1 ? "" : "s"}, as of ${at}s${lost ? `; the ${EVENTS[1].label} is lost` : ""}`;
}

function writesBy(writes: number[], kill: number): string {
  const n = writes.filter((w) => w <= kill).length;
  return `${n} write${n === 1 ? "" : "s"}`;
}

function TimelineTab() {
  const [kill, setKill] = useState(20);
  const sliderId = useId();
  const rows = [
    { label: "30s ticker", writes: oldWrites() },
    { label: "save on change", writes: newWrites() },
  ];
  const x = (t: number) => `${(t / SPAN) * 100}%`;

  return (
    <div>
      <div className="px-4 pt-4">
        <div className="relative ml-28 h-8">
          {EVENTS.map((e) => (
            <span
              key={e.t}
              className="absolute whitespace-nowrap pl-1 font-mono text-[10px] text-fd-muted-foreground"
              style={{ left: x(e.t), top: e.t === 0 ? 0 : "1rem" }}
            >
              {e.label}
            </span>
          ))}
        </div>
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-2 py-1.5">
            <span className="w-26 shrink-0 text-right font-mono text-[11px] text-fd-muted-foreground">
              {row.label}
            </span>
            <div className="relative h-6 flex-1 border-b border-fd-border">
              {EVENTS.map((e) => (
                <div
                  key={e.t}
                  className="absolute inset-y-0 border-l border-dashed border-fd-muted-foreground/50"
                  style={{ left: x(e.t) }}
                  aria-hidden="true"
                />
              ))}
              {row.writes.map((w) => (
                <div
                  key={w}
                  className={cn(
                    "absolute top-1 h-4 w-1.5 -translate-x-1/2 rounded-sm",
                    w <= kill ? "bg-fd-primary" : "bg-fd-muted-foreground/25",
                  )}
                  style={{ left: x(w) }}
                  title={`write at ${w}s`}
                />
              ))}
              <div
                className="absolute -inset-y-1 border-l-2 border-fd-foreground"
                style={{ left: x(kill) }}
                aria-hidden="true"
              />
            </div>
          </div>
        ))}
        <div className="ml-28 flex justify-between font-mono text-[10px] text-fd-muted-foreground">
          <span>0s</span>
          <span>30s</span>
          <span>{SPAN}s</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-fd-border p-4">
        <label htmlFor={sliderId} className="text-sm text-fd-muted-foreground">
          kill -9 the daemon at
        </label>
        <input
          id={sliderId}
          type="range"
          min={1}
          max={SPAN}
          step={1}
          value={kill}
          onChange={(e) => setKill(Number(e.target.value))}
          className="w-48 accent-current"
        />
        <span className="font-mono text-sm tabular-nums text-fd-foreground">
          {kill}s
        </span>
      </div>

      <dl className="grid gap-3 p-4 text-sm sm:grid-cols-2" aria-live="polite">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="font-mono text-xs text-fd-muted-foreground">
              {row.label}, {writesBy(row.writes, kill)} so far
            </dt>
            <dd className="text-fd-foreground">{onDisk(row.writes, kill)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ---------------------------------------------------------------------- shell

const TABS = [
  { id: "replay", label: "reattach replay" },
  { id: "kill", label: "kill -9 timeline" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ReattachReplay({
  initialTab = "replay",
}: {
  initialTab?: TabId;
}) {
  const [tab, setTab] = useState<TabId>(initialTab);
  const base = useId();

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.id === tab);
    const next =
      TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    setTab(next.id);
    document.getElementById(`${base}-${next.id}-tab`)?.focus();
  };

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div
        className="flex gap-1 border-b border-fd-border bg-fd-muted/40 px-3 py-2"
        role="tablist"
        aria-label="Model"
        onKeyDown={onKey}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`${base}-${t.id}-tab`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`${base}-${t.id}-panel`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-2.5 py-1 font-mono text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary",
              tab === t.id
                ? "bg-fd-background text-fd-foreground shadow-sm"
                : "text-fd-muted-foreground hover:text-fd-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${base}-${tab}-panel`}
        aria-labelledby={`${base}-${tab}-tab`}
      >
        {tab === "replay" ? <ReplayTab /> : <TimelineTab />}
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        {tab === "replay"
          ? "A model, not a capture. A top-like program rewrites six rows per tick, one chunk each. The snapshot was taken after chunk 4 and the ring holds four and a half chunks. Once it rolls past the snapshot, the old path clears the screen and starts mid-chunk, so every row only the snapshot held comes back blank. The new path keeps the snapshot and starts at the first whole chunk."
          : "A model of the two savers in resurrection.go. The session starts at 0s with one window and gains a second at 35s. The old ticker first writes 30s after the session starts. The new saver polls a dirty flag every 2s and still writes 30s after its last write, so an idle session costs the same as before."}
      </figcaption>
    </figure>
  );
}
