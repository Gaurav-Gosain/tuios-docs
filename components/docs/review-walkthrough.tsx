"use client";

import { type KeyboardEvent, type ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A walk through reviewing what an agent changed and comparing the attempts
 * of a fan, one screen per step. Each screen is drawn the way the review
 * overlay draws it at tuios main (internal/app/render_review.go and
 * review_compare.go): the header, the file list beside the diff, notes under
 * their line, and a footer of the keys that act where the cursor is. The
 * keys are the overlay's own (internal/input/review_input.go); the words the
 * dock says and the message the agent receives are the strings tuios prints
 * (review_overlay.go, internal/review/compose.go).
 */

type Tone =
  | "fg"
  | "dim"
  | "mute"
  | "accent"
  | "add"
  | "del"
  | "hunk"
  | "note"
  | "sent"
  | "ok"
  | "warn"
  | "sel"
  | "key";

type Seg = [string, Tone?];
type Line = Seg[];

const TONE: Record<Tone, string> = {
  fg: "text-fd-foreground",
  dim: "text-fd-muted-foreground",
  mute: "text-fd-muted-foreground",
  accent: "font-semibold text-fd-primary",
  add: "text-emerald-700 dark:text-emerald-300",
  del: "text-red-700 dark:text-red-300",
  hunk: "text-sky-700 dark:text-sky-300",
  note: "text-amber-700 dark:text-amber-300",
  sent: "text-fd-muted-foreground",
  ok: "text-emerald-700 dark:text-emerald-400",
  warn: "text-amber-700 dark:text-amber-300",
  sel: "font-semibold text-fd-foreground",
  key: "text-fd-primary",
};

const RULE: Line = [["─".repeat(68), "mute"]];

function pad(s: string, n: number) {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

function padLeft(s: string, n: number) {
  return s.length >= n ? s.slice(0, n) : " ".repeat(n - s.length) + s;
}

/** A footer of keys, as the review's hint strip draws them. */
function hints(...pairs: [string, string][]): Line {
  const line: Line = [[" "]];
  pairs.forEach(([key, label], i) => {
    if (i > 0) line.push(["  "]);
    line.push([key, "key"], [` ${label}`, "dim"]);
  });
  return line;
}

// The file list is 26 cells wide, then the divider, then the diff.
const LIST_W = 26;

interface FileRow {
  status: "M" | "A" | "U";
  path: string;
  counts: string;
}

const FILES: FileRow[] = [
  { status: "M", path: "client.go", counts: "+24 -6" },
  { status: "A", path: "backoff.go", counts: "+12 -0" },
  { status: "M", path: "client_test.go", counts: "+2 -0" },
];

function listCell(i: number, cursor: number, listFocus: boolean): Seg[] {
  const f = FILES[i];
  if (!f) return [[" ".repeat(LIST_W)]];
  const mark = listFocus && i === cursor ? "›" : " ";
  const room = LIST_W - 4 - f.counts.length;
  return [
    [mark, "accent"],
    [`${f.status} `, f.status === "A" ? "add" : "hunk"],
    [pad(f.path, room), i === cursor ? "sel" : "dim"],
    [` ${f.counts} `, "mute"],
  ];
}

/** The review: the file list on the left, the diff rows on the right. */
function reviewBody(
  diff: Line[],
  cursor: number,
  listFocus: boolean,
  height = 8,
): Line[] {
  const out: Line[] = [];
  for (let i = 0; i < height; i++) {
    out.push([
      ...listCell(i, cursor, listFocus),
      ["│", "mute"],
      ...(diff[i] ?? []),
    ]);
  }
  return out;
}

function header(...rest: Seg[]): Line {
  return [[" Review", "accent"], ["  api-fan-retry-2", "sel"], ...rest];
}

const HEADER_BASE = (notes: string): Line =>
  header(
    ["  claude  3 files", "dim"],
    ["  +38", "add"],
    [" -6", "del"],
    [`  vs main  ${notes}`, "dim"],
  );

// client.go, the first hunk. The cursor sits on the row marked "cur".
function clientHunk(opts: {
  cursorRow?: number;
  extra?: { after: number; line: Line }[];
}): Line[] {
  const rows: Line[] = [
    [
      ["@@ -40,6 +40,14 @@", "hunk"],
      [" func (c *Client) Do", "mute"],
    ],
    [
      ["  40  40 ", "mute"],
      ["   req = req.Clone(ctx)", "fg"],
    ],
    [
      ["  41     ", "mute"],
      ["-", "del"],
      ["  resp, err := c.http.Do(req)", "del"],
    ],
    [
      ["      41 ", "mute"],
      ["+", "add"],
      ["  resp, err := c.retry(ctx, req)", "add"],
    ],
    [
      ["      42 ", "mute"],
      ["+", "add"],
      ["  if err != nil {", "add"],
    ],
    [
      ["      43 ", "mute"],
      ["+", "add"],
      ["      return nil, err", "add"],
    ],
    [
      ["      44 ", "mute"],
      ["+", "add"],
      ["  }", "add"],
    ],
  ];
  const withExtras: Line[] = [];
  rows.forEach((row, i) => {
    const mark: Seg =
      opts.cursorRow === i ? [" ›", "accent"] : ["  ", undefined];
    withExtras.push([mark, ...row]);
    for (const e of opts.extra ?? []) {
      if (e.after === i) withExtras.push(e.line);
    }
  });
  return withExtras;
}

const BACKOFF_HUNK: Line[] = [
  [["  "], ["@@ -0,0 +1,12 @@", "hunk"]],
  [["  "], ["       1 ", "mute"], ["+", "add"], ["  package api", "add"]],
  [["  "], ["       2 ", "mute"], ["+", "add"]],
  [["  "], ["       3 ", "mute"], ["+", "add"], ['  import "time"', "add"]],
  [["  "], ["       4 ", "mute"], ["+", "add"]],
  [
    ["  "],
    ["       5 ", "mute"],
    ["+", "add"],
    ["  func backoff(n int) time.Duration {", "add"],
  ],
];

const NOTE_TEXT = "log the attempt number here too";

// A note sits under its line, past the line numbers and the change mark.
const NOTE_INDENT = " ".repeat(12);

// The fan's attempts, as the compare view lists them on a narrow screen.
interface Attempt {
  session: string;
  agent: string;
  state: string;
  files: string;
  diff: string;
  check: string;
  checkTone: Tone;
  age: string;
}

const ATTEMPTS: Attempt[] = [
  {
    session: "api-fan-retry",
    agent: "claude",
    state: "done",
    files: "2",
    diff: "+31 -4",
    check: "-",
    checkTone: "dim",
    age: "-",
  },
  {
    session: "api-fan-retry-2",
    agent: "claude",
    state: "done",
    files: "3",
    diff: "+38 -6",
    check: "-",
    checkTone: "dim",
    age: "-",
  },
  {
    session: "api-fan-retry-3",
    agent: "codex",
    state: "idle",
    files: "1",
    diff: "+9 -2",
    check: "-",
    checkTone: "dim",
    age: "-",
  },
];

const CHECKED: Attempt[] = [
  { ...ATTEMPTS[0], check: "failed 1", checkTone: "warn", age: "12s" },
  { ...ATTEMPTS[1], check: "passed", checkTone: "ok", age: "9s" },
  { ...ATTEMPTS[2], check: "passed", checkTone: "ok", age: "10s" },
];

function compare(
  rows: Attempt[],
  cursor: number,
  marks: string[],
  question: Line,
  footer: Line,
): Line[] {
  const S = 16;
  const out: Line[] = [
    [
      [" Compare", "accent"],
      ["  fan/retry", "sel"],
      [" in api, 3 attempts vs main", "dim"],
    ],
    RULE,
    [
      [
        `    ${pad("session", S)} ${pad("agent", 7)}${pad("state", 8)}${padLeft("files", 5)}  ${pad("+/-", 11)}${pad("check", 9)}${padLeft("age", 4)}`,
        "mute",
      ],
    ],
  ];
  rows.forEach((r, i) => {
    const cur = i === cursor ? "›" : " ";
    const mark = marks.includes(r.session) ? "*" : " ";
    out.push([
      [` ${cur}${mark} `, "accent"],
      [`${pad(r.session, S)} `, i === cursor ? "sel" : "fg"],
      [`${pad(r.agent, 7)}${pad(r.state, 8)}${padLeft(r.files, 5)}  `, "dim"],
      [pad(r.diff, 11), "dim"],
      [pad(r.check, 9), r.checkTone],
      [padLeft(r.age, 4), "mute"],
    ]);
  });
  out.push([[""]], question, RULE, footer);
  return out;
}

interface Step {
  title: string;
  keys: string;
  body: ReactNode;
  screen: Line[];
  /** What the dock says after the step, if anything. */
  dock?: string;
  /** A second block: the message the agent receives, or the CLI. */
  aside?: { label: string; lines: string[] };
}

const STEPS: Step[] = [
  {
    title: "Open the review",
    keys: "Ctrl+B v",
    body: (
      <>
        <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>v</kbd> reviews the focused pane, and{" "}
        <kbd>v</kbd> on an Inbox row or a rail agent row reviews that pane. The
        diff is the worktree against the base it was made from, committed and
        uncommitted work together.
      </>
    ),
    screen: [
      HEADER_BASE("0 notes"),
      RULE,
      ...reviewBody(clientHunk({ cursorRow: 0 }), 0, false),
      RULE,
      hints(
        ["c", "note"],
        ["]", "next hunk"],
        ["}", "next file"],
        ["s", "split"],
        ["w", "compare"],
        ["esc", "close"],
      ),
    ],
    aside: {
      label: "The same from a shell",
      lines: ["tuios review api-fan-retry-2", "tuios review --stat"],
    },
  },
  {
    title: "Move through it",
    keys: "] [ } { tab",
    body: (
      <>
        <kbd>]</kbd> and <kbd>[</kbd> go to the next and previous hunk,{" "}
        <kbd>{"}"}</kbd> and <kbd>{"{"}</kbd> to the next and previous file.{" "}
        <kbd>Tab</kbd> moves between the file list and the diff, and{" "}
        <kbd>Enter</kbd> in the list opens that file. <kbd>s</kbd> puts the two
        sides next to each other on a wide screen.
      </>
    ),
    screen: [
      HEADER_BASE("0 notes"),
      RULE,
      ...reviewBody(BACKOFF_HUNK, 1, true),
      RULE,
      hints(
        ["↵", "open file"],
        ["tab", "diff"],
        ["]", "next hunk"],
        ["}", "next file"],
        ["esc", "close"],
      ),
    ],
  },
  {
    title: "Leave a note",
    keys: "c",
    body: (
      <>
        <kbd>c</kbd> leaves a note on the line under the cursor, and{" "}
        <kbd>C</kbd> one on the whole hunk. <kbd>Enter</kbd> saves it. A note
        keeps the text of its line, so it follows the line when the file
        changes.
      </>
    ),
    screen: [
      HEADER_BASE("0 notes"),
      RULE,
      ...reviewBody(
        clientHunk({
          cursorRow: 3,
          extra: [
            {
              after: 3,
              line: [
                [NOTE_INDENT],
                ["▌ note: ", "accent"],
                [`${NOTE_TEXT}_`, "fg"],
              ],
            },
          ],
        }),
        0,
        false,
      ),
      RULE,
      hints(["↵", "save"], ["esc", "drop"]),
    ],
  },
  {
    title: "Send the notes",
    keys: "S",
    body: (
      <>
        With the cursor on a note, <kbd>e</kbd> edits it and <kbd>x</kbd>{" "}
        resolves it. <kbd>S</kbd> sends every unsent note to the agent as one
        message, through the queue, so it is typed when the agent is at rest.
      </>
    ),
    screen: [
      HEADER_BASE("1 note"),
      RULE,
      ...reviewBody(
        clientHunk({
          extra: [
            {
              after: 3,
              line: [
                [" ›", "accent"],
                [NOTE_INDENT.slice(2)],
                [`▌ note: ${NOTE_TEXT}`, "note"],
              ],
            },
          ],
        }),
        0,
        false,
      ),
      RULE,
      hints(
        ["e", "edit"],
        ["x", "resolve"],
        ["S", "send 1 note"],
        ["]", "next hunk"],
        ["esc", "close"],
      ),
    ],
    dock: "1 note queued, sent when claude is at rest",
    aside: {
      label: "What the agent receives",
      lines: [
        "Review notes on your changes (vs main), from the person:",
        "",
        '1. client.go:41, on "resp, err := c.retry(ctx, req)"',
        `   ${NOTE_TEXT}`,
        "",
        "Address each note, then say which you changed.",
      ],
    },
  },
  {
    title: "Compare the attempts",
    keys: "w",
    body: (
      <>
        For a pane in a fan, <kbd>w</kbd> shows every attempt on one line: its
        agent and state, what it changed against the fan's base, and its last
        check. <kbd>Enter</kbd> reviews the attempt under the cursor, and{" "}
        <kbd>esc</kbd> goes back.
      </>
    ),
    screen: compare(
      ATTEMPTS,
      1,
      [],
      [[""]],
      hints(
        ["↵", "review"],
        ["m", "mark"],
        ["V", "verify"],
        ["K", "keep"],
        ["esc", "back"],
      ),
    ),
    aside: {
      label: "The same from a shell",
      lines: ["tuios fan compare api-fan-retry"],
    },
  },
  {
    title: "Check every attempt",
    keys: "V",
    body: (
      <>
        <kbd>V</kbd> asks for a command, <code>Run in every attempt:</code>, and
        runs it in a window of its own in each attempt. The check column then
        says how each one went.
      </>
    ),
    screen: compare(
      CHECKED,
      1,
      [],
      [[""]],
      hints(
        ["↵", "review"],
        ["m", "mark"],
        ["V", "verify"],
        ["K", "keep"],
        ["esc", "back"],
      ),
    ),
    dock: "Checking 3 attempts: go test ./...",
    aside: {
      label: "The same from a shell",
      lines: ["tuios fan verify api-fan-retry -- 'go test ./...'"],
    },
  },
  {
    title: "Diff two attempts",
    keys: "m m d",
    body: (
      <>
        <kbd>m</kbd> marks an attempt. With two marked, <kbd>d</kbd> reviews the
        first one marked against the second: the header then reads{" "}
        <code>against api-fan-retry</code>, and <kbd>esc</kbd> comes back here.
      </>
    ),
    screen: compare(
      CHECKED,
      0,
      ["api-fan-retry-2", "api-fan-retry"],
      [[" Marked: api-fan-retry-2, api-fan-retry", "dim"]],
      hints(
        ["↵", "review"],
        ["m", "mark"],
        ["d", "diff marked"],
        ["V", "verify"],
        ["K", "keep"],
        ["esc", "back"],
      ),
    ),
    aside: {
      label: "The same from a shell",
      lines: [
        "tuios fan diff api-fan-retry api-fan-retry-2 --stat",
        "tuios review api-fan-retry-2 --against api-fan-retry",
      ],
    },
  },
  {
    title: "Keep one",
    keys: "K y",
    body: (
      <>
        <kbd>K</kbd> keeps the attempt under the cursor and asks before it
        removes the others. <kbd>y</kbd> removes their worktrees and sessions;
        their branches stay. An attempt with uncommitted work is left in place.
      </>
    ),
    screen: compare(
      CHECKED,
      1,
      [],
      [
        [
          " Keep api-fan-retry-2 and remove api-fan-retry, api-fan-retry-3? Their worktrees and sessions go; branches stay.",
          "warn",
        ],
      ],
      hints(["y", "keep it, remove the others"], ["n", "cancel"]),
    ),
    dock: "Kept api-fan-retry-2. Removed api-fan-retry, api-fan-retry-3. Branches stay.",
    aside: {
      label: "The same from a shell",
      lines: ["tuios fan keep api-fan-retry-2 --stash"],
    },
  },
];

function Screen({ lines, label }: { lines: Line[]; label: string }) {
  return (
    <section
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must take focus so the keyboard can scroll it.
      tabIndex={0}
      aria-label={label}
      className="overflow-x-auto rounded-md border border-fd-border bg-fd-background focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary"
    >
      <pre className="m-0 w-max min-w-full bg-transparent p-2 font-mono text-[10.5px] leading-[1.35] sm:text-xs">
        {lines.map((line, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: rows of a fixed screen never reorder.
          <div key={i} className="whitespace-pre">
            {line.map((seg, j) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: segments of a fixed row never reorder.
              <span key={j} className={seg[1] ? TONE[seg[1]] : undefined}>
                {seg[0]}
              </span>
            ))}
            {line.length === 0 ? " " : null}
          </div>
        ))}
      </pre>
    </section>
  );
}

export function ReviewWalkthrough() {
  const [step, setStep] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const s = STEPS[step];
  const last = STEPS.length - 1;

  function go(to: number, focus: boolean) {
    const next = Math.max(0, Math.min(last, to));
    setStep(next);
    if (focus) tabs.current[next]?.focus();
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        go(step + 1, true);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        go(step - 1, true);
        break;
      case "Home":
        e.preventDefault();
        go(0, true);
        break;
      case "End":
        e.preventDefault();
        go(last, true);
        break;
    }
  }

  return (
    <figure
      data-widget="review-walkthrough"
      className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card"
    >
      <div className="flex items-center gap-2 border-fd-border border-b bg-fd-muted/40 px-3 py-2">
        <span className="font-mono text-fd-muted-foreground text-xs">
          review and compare
        </span>
        <span className="ml-auto font-mono text-fd-muted-foreground text-xs tabular-nums">
          {step + 1} of {STEPS.length}
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Steps"
        className="flex gap-1 overflow-x-auto border-fd-border border-b px-3 py-2"
      >
        {STEPS.map((st, i) => (
          <button
            key={st.title}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`review-step-tab-${i}`}
            aria-selected={i === step}
            aria-controls="review-step-panel"
            tabIndex={i === step ? 0 : -1}
            onClick={() => go(i, false)}
            onKeyDown={onTabKey}
            className={cn(
              "shrink-0 rounded-md px-2 py-1 font-mono text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary motion-reduce:transition-none",
              i === step
                ? "bg-fd-primary text-fd-primary-foreground"
                : "text-fd-muted-foreground hover:text-fd-foreground",
            )}
          >
            <span aria-hidden="true">{i + 1}</span>
            <span className="sr-only">
              Step {i + 1}: {st.title}
            </span>
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="review-step-panel"
        aria-labelledby={`review-step-tab-${step}`}
        className="space-y-3 bg-fd-background/40 p-3"
      >
        <div>
          <p className="font-mono font-semibold text-fd-foreground text-sm">
            {s.title}{" "}
            <span className="font-normal text-fd-muted-foreground">
              ({s.keys})
            </span>
          </p>
          <p className="mt-1 text-fd-muted-foreground text-sm leading-relaxed [&_code]:rounded [&_code]:bg-fd-accent/60 [&_code]:px-1 [&_code]:text-[0.8125rem] [&_kbd]:rounded [&_kbd]:border [&_kbd]:border-fd-border [&_kbd]:px-1 [&_kbd]:font-mono [&_kbd]:text-[0.75rem] [&_kbd]:text-fd-foreground">
            {s.body}
          </p>
        </div>

        <Screen lines={s.screen} label={`Screen: ${s.title}`} />

        {s.dock ? (
          <p className="font-mono text-fd-foreground text-xs">
            <span className="text-fd-muted-foreground">dock: </span>
            {s.dock}
          </p>
        ) : null}

        {s.aside ? (
          <div>
            <p className="font-mono text-fd-muted-foreground text-xs">
              {s.aside.label}
            </p>
            <pre className="mt-1 overflow-x-auto rounded-md border border-fd-border bg-fd-background p-2 font-mono text-[10.5px] text-fd-foreground leading-[1.35] sm:text-xs">
              {s.aside.lines.join("\n")}
            </pre>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2 border-fd-border border-t px-3 py-2">
        <button
          type="button"
          onClick={() => go(step - 1, false)}
          disabled={step === 0}
          className="rounded-md border border-fd-border px-3 py-1 font-mono text-xs transition-colors hover:border-fd-primary/60 focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary disabled:opacity-40 motion-reduce:transition-none"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => go(step + 1, false)}
          disabled={step === last}
          className="rounded-md border border-fd-border px-3 py-1 font-mono text-xs transition-colors hover:border-fd-primary/60 focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary disabled:opacity-40 motion-reduce:transition-none"
        >
          Next
        </button>
        <span className="ml-auto hidden font-mono text-fd-muted-foreground text-xs sm:inline">
          arrow keys move between steps
        </span>
      </div>

      <figcaption className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-sm">
        The review overlay and its compare view, drawn as tuios draws them for a
        fan of three attempts. Every key and message is the overlay's own.
      </figcaption>
    </figure>
  );
}
