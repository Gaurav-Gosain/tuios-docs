"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A small model of the tuios Inbox, driven by the real keys. It follows
 * internal/app/inbox*.go and render_inbox.go at tuios main:
 *
 *   - Items sit under a heading per kind, in the daemon's order: Approvals,
 *     Questions, Errored, Done (session.AttentionKindNames).
 *   - 1, 2 and 3 answer an approval the Inbox holds: allow, always, deny.
 *   - An approval a risk rule matched reads "risky:" on its row. 1 and 2 allow
 *     it only on a second press of the same key within 3 seconds
 *     (inboxRiskPressWindow). The first press sends nothing and says when it
 *     lapses. Any other key resets it. 3 denies at once.
 *   - z snoozes, then 1 to 4 for how long. A held approval and a question put
 *     with ask-human cannot be snoozed. S shows the snoozed items, and z on
 *     one wakes it.
 *   - d dismisses. u undoes the last dismiss or snooze for 10 seconds
 *     (inboxUndoWindow), and pressed again the one before.
 *
 * Everything the model says is a string the real Inbox prints, except the
 * lines marked as the demo's own.
 */

type Kind = "approval" | "ask" | "errored" | "finished";

interface Item {
  id: string;
  kind: Kind;
  /** The pane's name, as the row names it. */
  who: string;
  /** The session the pane is in. */
  where: string;
  /** How long it has waited, as the row says it. */
  wait: string;
  summary: string;
  /** Risk rules the command matched, with what each guards against. */
  risk?: { rule: string; why: string }[];
  /** The answers of a question put with ask-human. */
  options?: string[];
}

interface Snoozed {
  item: Item;
  /** When it wakes, as the row says it. */
  until: string;
}

interface Armed {
  /** The decision the first press asked for. */
  decision: Decision;
  /** The key that armed it. Any other key resets it. */
  press: string;
  id: string;
  at: number;
}

interface UndoEntry {
  item: Item;
  at: number;
}

type Decision = "once" | "always" | "deny";

const ITEMS: Item[] = [
  {
    id: "a1",
    kind: "approval",
    who: "claude",
    where: "api",
    wait: "4m",
    summary: "approve Bash: rm -rf build dist",
    risk: [
      {
        rule: "recursive delete",
        why: "deletes a tree of files without asking",
      },
    ],
  },
  {
    id: "a2",
    kind: "approval",
    who: "codex",
    where: "web",
    wait: "2m",
    summary: "approve Bash: go test ./...",
  },
  {
    id: "q1",
    kind: "ask",
    who: "release",
    where: "ops",
    wait: "1m",
    summary: "Deploy the branch to staging?",
    options: ["yes", "no", "later"],
  },
  {
    id: "e1",
    kind: "errored",
    who: "opencode",
    where: "cli",
    wait: "9m",
    summary: "go build failed: undefined: retryPolicy",
  },
  {
    id: "f1",
    kind: "finished",
    who: "gemini",
    where: "docs",
    wait: "12m",
    summary: "Rewrote the install page and fixed two broken links",
  },
];

const GROUP_TITLE: Record<Kind, string> = {
  approval: "Approvals",
  ask: "Questions",
  errored: "Errored",
  finished: "Done",
};

const KIND_ORDER: Kind[] = ["approval", "ask", "errored", "finished"];

/** Each kind's mark, as agentStateIndicator draws the state behind it. */
const GLYPH: Record<Kind, string> = {
  approval: "▲",
  ask: "▲",
  errored: "×",
  finished: "■",
};

const GLYPH_INK: Record<Kind, string> = {
  approval: "text-amber-600 dark:text-amber-300",
  ask: "text-amber-600 dark:text-amber-300",
  errored: "text-red-600 dark:text-red-400",
  finished: "text-emerald-600 dark:text-emerald-400",
};

const DECISION_WORDS: Record<Decision, string> = {
  once: "allowed once",
  always: "always allowed",
  deny: "denied",
};

const RISK_WINDOW_MS = 3000;
const UNDO_WINDOW_MS = 10_000;
const NOTICE_MS = 5000;

const SNOOZE_CHOICES = [
  { key: "1", label: "15m", words: "for 15 minutes" },
  { key: "2", label: "1h", words: "for an hour" },
  { key: "3", label: "tomorrow 9:00", words: "until 9:00 tomorrow" },
  { key: "4", label: "until it changes", words: "until it changes" },
] as const;

function isHeld(it: Item) {
  return it.kind === "approval";
}

function clock(ms: number, withSeconds: boolean) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return withSeconds ? `${hm}:${pad(d.getSeconds())}` : hm;
}

/** When a snooze wakes, as inboxSnoozedWhen says it. */
function snoozeUntil(key: string, now: number) {
  switch (key) {
    case "1":
      return `until ${clock(now + 15 * 60_000, false)}`;
    case "2":
      return `until ${clock(now + 60 * 60_000, false)}`;
    case "3": {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      const day = d.toLocaleDateString("en-US", { weekday: "short" });
      return `until ${day} 09:00`;
    }
    default:
      return "until it changes";
  }
}

/** Why an item cannot be snoozed, as inboxSnoozeRefusal says it. */
function snoozeRefusal(it: Item) {
  if (it.kind === "approval") {
    return "The Inbox is holding this approval for your answer, so it is not snoozed. Answer it or dismiss it.";
  }
  if (it.kind === "ask") {
    return "A question waits for your answer, so it is not snoozed. Answer it or dismiss it.";
  }
  return "";
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The command a risky allow allows: the text after "approve Tool: ". */
function riskTarget(it: Item) {
  const m = /^approve [^:]+: (.*)$/.exec(it.summary);
  return m ? m[1] : it.summary;
}

function sortByKind(items: Item[]) {
  return [...items].sort(
    (a, b) =>
      KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
      ITEMS.indexOf(a) - ITEMS.indexOf(b),
  );
}

type Tone = "info" | "success" | "demo";

interface Notice {
  text: string;
  tone: Tone;
  id: number;
}

interface Row {
  heading?: string;
  note?: string;
  item?: Item;
  snoozed?: string;
}

export function InboxDemo() {
  const [open, setOpen] = useState<Item[]>(ITEMS);
  const [snoozed, setSnoozed] = useState<Snoozed[]>([]);
  const [showSnoozed, setShowSnoozed] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [picking, setPicking] = useState<string | null>(null);
  const [armed, setArmed] = useState<Armed | null>(null);
  const [undo, setUndo] = useState<UndoEntry[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const noticeSeq = useRef(0);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), NOTICE_MS);
    return () => window.clearTimeout(t);
  }, [notice]);

  // The rows as the overlay lists them: each kind under its heading, then
  // the snoozed ones, or a line that says how many there are.
  const rows: Row[] = [];
  const selectable: { item: Item; snoozed?: string }[] = [];
  for (const kind of KIND_ORDER) {
    const group = open.filter((it) => it.kind === kind);
    if (group.length === 0) continue;
    rows.push({ heading: `${GROUP_TITLE[kind]} ${group.length}` });
    for (const it of group) {
      rows.push({ item: it });
      selectable.push({ item: it });
    }
  }
  if (snoozed.length > 0) {
    if (showSnoozed) {
      rows.push({ heading: `Snoozed ${snoozed.length}` });
      for (const s of snoozed) {
        rows.push({ item: s.item, snoozed: s.until });
        selectable.push({ item: s.item, snoozed: s.until });
      }
    } else if (open.length > 0) {
      rows.push({
        note:
          snoozed.length === 1
            ? "1 snoozed. S shows it."
            : `${snoozed.length} snoozed. S shows them.`,
      });
    }
  }
  const sel = Math.min(cursor, Math.max(selectable.length - 1, 0));
  const current = selectable[sel];

  function say(text: string, tone: Tone = "info") {
    noticeSeq.current += 1;
    setNotice({ text, tone, id: noticeSeq.current });
  }

  function reset() {
    setOpen(ITEMS);
    setSnoozed([]);
    setShowSnoozed(false);
    setCursor(0);
    setPicking(null);
    setArmed(null);
    setUndo([]);
    setNotice(null);
  }

  function remember(item: Item, now: number) {
    setUndo((u) => [
      ...u.filter((e) => e.item.id !== item.id && now - e.at < UNDO_WINDOW_MS),
      { item, at: now },
    ]);
  }

  function removeOpen(id: string) {
    setOpen((items) => items.filter((it) => it.id !== id));
  }

  function answerApproval(
    it: Item,
    decision: Decision,
    key: string,
    arm: Armed | null,
  ): Armed | null {
    if (!isHeld(it)) {
      say(
        "1, 2 and 3 answer an approval the Inbox is holding. Enter goes to the pane.",
      );
      return arm;
    }
    const now = Date.now();
    if (it.risk && decision !== "deny") {
      const second =
        arm !== null &&
        arm.decision === decision &&
        arm.id === it.id &&
        now - arm.at <= RISK_WINDOW_MS;
      if (!second) {
        // The first press sends nothing. The detail says what the second
        // press does, and by when.
        return { decision, press: key, id: it.id, at: now };
      }
    }
    removeOpen(it.id);
    say(`${it.who}: ${DECISION_WORDS[decision]}`, "success");
    return null;
  }

  function press(key: string) {
    // A risky allow's first press waits for the same key again; any other
    // key resets it (InboxKeyPressed).
    let arm = armed;
    if (arm && key !== arm.press) arm = null;
    const now = Date.now();

    if (picking) {
      // The snooze picker takes the next key: 1 to 4 is how long, anything
      // else closes it.
      const choice = SNOOZE_CHOICES.find((c) => c.key === key);
      const it = open.find((i) => i.id === picking);
      setPicking(null);
      if (choice && it) {
        removeOpen(it.id);
        setSnoozed((s) => [...s, { item: it, until: snoozeUntil(key, now) }]);
        remember(it, now);
        say(`Snoozed ${it.who} ${choice.words}. u in the Inbox undoes.`);
      }
      setArmed(arm);
      return;
    }

    const it = current?.item;
    const isSnoozed = current?.snoozed !== undefined;

    if (/^[1-9]$/.test(key)) {
      const n = Number(key);
      if (it?.kind === "ask" && it.options) {
        if (n > it.options.length) {
          say(`This question takes 1 to ${it.options.length}`);
        } else {
          removeOpen(it.id);
          say(`${it.who}: ${it.options[n - 1]}`, "success");
        }
      } else if (it && n <= 3 && !isSnoozed) {
        const decision = (["once", "always", "deny"] as const)[n - 1];
        arm = answerApproval(it, decision, key, arm);
      } else if (it && n <= 3) {
        say(
          "1, 2 and 3 answer an approval the Inbox is holding. Enter goes to the pane.",
        );
      }
      setArmed(arm);
      return;
    }

    switch (key) {
      case "j":
      case "ArrowDown":
        setCursor(Math.min(sel + 1, selectable.length - 1));
        break;
      case "k":
      case "ArrowUp":
        setCursor(Math.max(sel - 1, 0));
        break;
      case "g":
      case "Home":
        setCursor(0);
        break;
      case "G":
      case "End":
        setCursor(Math.max(selectable.length - 1, 0));
        break;
      case "d":
      case "Delete":
        if (!it) break;
        if (isSnoozed) {
          setSnoozed((s) => s.filter((x) => x.item.id !== it.id));
        } else {
          removeOpen(it.id);
        }
        // A question put with ask-human is answered as dismissed, so it
        // does not come back.
        if (it.kind !== "ask") {
          remember(it, now);
          say(`Dismissed ${it.who}. u undoes.`);
        }
        break;
      case "z":
        if (!it) break;
        if (isSnoozed) {
          setSnoozed((s) => s.filter((x) => x.item.id !== it.id));
          setOpen((items) => sortByKind([...items, it]));
          say(`${capitalize(it.who)} is back in the Inbox`);
          break;
        }
        if (snoozeRefusal(it)) {
          say(snoozeRefusal(it));
          break;
        }
        setPicking(it.id);
        break;
      case "u": {
        const live = undo.filter((e) => now - e.at < UNDO_WINDOW_MS);
        const last = live.at(-1);
        if (!last) {
          setUndo([]);
          say(
            "Nothing to undo: a dismiss or a snooze can be undone for 10 seconds",
          );
          break;
        }
        setUndo(live.slice(0, -1));
        setSnoozed((s) => s.filter((x) => x.item.id !== last.item.id));
        setOpen((items) =>
          sortByKind([
            ...items.filter((i) => i.id !== last.item.id),
            last.item,
          ]),
        );
        say(`Restored ${last.item.who}`, "success");
        break;
      }
      case "S":
        if (!showSnoozed && snoozed.length === 0) {
          say("Nothing is snoozed");
          break;
        }
        setShowSnoozed((v) => !v);
        break;
      case "Enter":
        if (it) say("In tuios, enter goes to the item's pane.", "demo");
        break;
    }
    setArmed(arm);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const handled = [
      "j",
      "k",
      "g",
      "G",
      "d",
      "z",
      "u",
      "S",
      "Escape",
      "Enter",
      "ArrowDown",
      "ArrowUp",
      "Home",
      "End",
      "Delete",
    ];
    if (/^[1-9]$/.test(e.key) || handled.includes(e.key)) {
      e.preventDefault();
      press(e.key === "Escape" ? "esc" : e.key);
    }
  }

  function click(key: string) {
    press(key);
    listRef.current?.focus();
  }

  // The detail under the list: a held approval's whole line, its rules, and
  // what the second press does; a question with its answers numbered.
  const now = Date.now();
  const detail: string[] = [];
  if (current && !current.snoozed) {
    const it = current.item;
    if (isHeld(it)) {
      detail.push(it.summary);
      for (const r of it.risk ?? []) detail.push(`Risky: ${r.rule}, ${r.why}`);
      if (armed && armed.id === it.id && now - armed.at <= RISK_WINDOW_MS) {
        detail.push(
          `Press ${armed.press} again by ${clock(armed.at + RISK_WINDOW_MS, true)} to allow ${riskTarget(it)}`,
        );
      }
    } else if (it.kind === "ask" && it.options) {
      detail.push(it.summary);
      it.options.forEach((o, i) => {
        detail.push(`  ${i + 1}  ${o}`);
      });
    }
  }

  // The footer: the keys that act on the row under the cursor. The ones
  // this model acts on are buttons; the others are shown as tuios shows them.
  type Hint = { key: string; label: string; press?: string };
  let hints: Hint[] = [];
  if (picking) {
    hints = [
      ...SNOOZE_CHOICES.map((c) => ({
        key: c.key,
        label: c.label,
        press: c.key,
      })),
      { key: "esc", label: "cancel", press: "esc" },
    ];
  } else if (current) {
    const it = current.item;
    if (current.snoozed) {
      hints = [
        { key: "↵", label: "go" },
        { key: "z", label: "wake", press: "z" },
        { key: "d", label: "dismiss", press: "d" },
      ];
    } else if (isHeld(it)) {
      hints = [
        { key: "1", label: "allow", press: "1" },
        { key: "2", label: "always", press: "2" },
        { key: "3", label: "deny", press: "3" },
        { key: "↵", label: "answer in pane" },
        { key: "d", label: "dismiss", press: "d" },
      ];
    } else if (it.kind === "ask" && it.options) {
      hints = [
        { key: `1-${it.options.length}`, label: "answer" },
        { key: "↵", label: "go to pane" },
        { key: "d", label: "dismiss", press: "d" },
      ];
    } else {
      hints = [
        { key: "↵", label: "go" },
        { key: "r", label: "reply" },
        { key: "z", label: "snooze", press: "z" },
        { key: "d", label: "dismiss", press: "d" },
      ];
    }
    hints.push({ key: "esc", label: "close" });
  }

  const activeId = current
    ? `inbox-row-${current.item.id}${current.snoozed ? "-z" : ""}`
    : undefined;

  return (
    <figure
      data-widget="inbox-demo"
      className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card"
    >
      <div className="flex items-center gap-2 border-fd-border border-b bg-fd-muted/40 px-3 py-2">
        <span className="font-mono text-fd-muted-foreground text-xs">
          Inbox, a model with the real keys
        </span>
        <button
          type="button"
          onClick={reset}
          className="ml-auto shrink-0 whitespace-nowrap rounded px-2 py-0.5 font-mono text-fd-muted-foreground text-xs hover:text-fd-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary"
        >
          start over
        </button>
      </div>

      <div className="bg-fd-background/40 p-2 sm:p-3">
        <div className="overflow-hidden rounded-md border border-fd-border bg-fd-background font-mono text-[11px] leading-5 sm:text-xs">
          <div className="flex items-center border-fd-border border-b px-2 py-1 text-fd-foreground">
            <span className="font-semibold">Inbox</span>
          </div>

          {/* The list owns the keyboard, like the overlay does. */}
          <div
            ref={listRef}
            role="listbox"
            tabIndex={0}
            aria-label="Inbox items. j and k move, 1 2 3 answer, z snooze, d dismiss, u undo, S show snoozed"
            aria-activedescendant={activeId}
            onKeyDown={onKeyDown}
            className="min-h-40 px-1 py-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary focus-visible:ring-inset"
          >
            {rows.length === 0 ? (
              <div className="px-1 py-2 text-fd-muted-foreground">
                <p>Nothing is waiting for you.</p>
                {snoozed.length > 0 ? (
                  <p className="mt-2">
                    {snoozed.length === 1
                      ? "1 snoozed. S shows it."
                      : `${snoozed.length} snoozed. S shows them.`}
                  </p>
                ) : null}
              </div>
            ) : (
              rows.map((row) => {
                if (row.heading) {
                  return (
                    <div
                      key={`h-${row.heading}`}
                      className="px-1 pt-1 font-semibold text-fd-muted-foreground"
                    >
                      {row.heading}
                    </div>
                  );
                }
                if (row.note) {
                  return (
                    <div
                      key="note"
                      className="px-1 pt-1 text-fd-muted-foreground"
                    >
                      {row.note}
                    </div>
                  );
                }
                const it = row.item as Item;
                const id = `inbox-row-${it.id}${row.snoozed ? "-z" : ""}`;
                const selected = id === activeId;
                const index = selectable.findIndex(
                  (s) =>
                    s.item.id === it.id &&
                    (s.snoozed !== undefined) === (row.snoozed !== undefined),
                );
                const muted = row.snoozed !== undefined;
                let summary = it.summary;
                if (it.risk) summary = `risky: ${summary}`;
                if (it.kind === "ask" && it.options) {
                  summary = `[1-${it.options.length}] ${summary}`;
                }
                return (
                  // biome-ignore lint/a11y/useKeyWithClickEvents: the listbox owns the keyboard through aria-activedescendant; a click only moves the cursor.
                  <div
                    key={id}
                    id={id}
                    role="option"
                    tabIndex={-1}
                    aria-selected={selected}
                    onClick={() => {
                      setCursor(index);
                      listRef.current?.focus();
                    }}
                    className={cn(
                      "flex cursor-default items-center gap-1.5 rounded-sm px-1",
                      selected && "bg-fd-primary/15",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="w-3 shrink-0 text-fd-primary"
                    >
                      {selected ? "›" : ""}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "shrink-0",
                        muted ? "text-fd-muted-foreground" : GLYPH_INK[it.kind],
                      )}
                    >
                      {GLYPH[it.kind]}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 font-semibold",
                        muted
                          ? "text-fd-muted-foreground"
                          : selected
                            ? "text-fd-foreground"
                            : "text-fd-foreground/80",
                      )}
                    >
                      {it.who}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-fd-muted-foreground">
                      {summary}
                    </span>
                    <span className="hidden shrink-0 text-fd-muted-foreground/80 sm:inline">
                      {it.where} &middot;{" "}
                    </span>
                    <span className="shrink-0 text-fd-muted-foreground">
                      {row.snoozed ?? it.wait}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {detail.length > 0 ? (
            <div className="border-fd-border border-t px-3 py-1.5 text-fd-foreground">
              {detail.map((line) => (
                <p
                  key={line}
                  className={cn(
                    "whitespace-pre-wrap break-words",
                    line.startsWith("Risky:") &&
                      "text-amber-700 dark:text-amber-300",
                    line.startsWith("Press ") &&
                      "font-semibold text-fd-primary",
                  )}
                >
                  {line}
                </p>
              ))}
            </div>
          ) : null}

          <fieldset className="flex flex-wrap gap-1 border-fd-border border-t px-2 py-1.5">
            <legend className="sr-only">
              Keys for the item under the cursor
            </legend>
            {hints.map((h) =>
              h.press ? (
                <button
                  key={`${h.key}-${h.label}`}
                  type="button"
                  onClick={() => click(h.press as string)}
                  className="inline-flex items-center gap-1 rounded border border-fd-border px-1.5 py-0.5 text-fd-foreground transition-colors hover:border-fd-primary/60 focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary motion-reduce:transition-none"
                >
                  <kbd className="text-fd-primary">{h.key}</kbd>
                  <span className="text-fd-muted-foreground">{h.label}</span>
                </button>
              ) : (
                <span
                  key={`${h.key}-${h.label}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5"
                >
                  <kbd className="text-fd-muted-foreground">{h.key}</kbd>
                  <span className="text-fd-muted-foreground">{h.label}</span>
                </span>
              ),
            )}
            {!picking && (undo.length > 0 || snoozed.length > 0) ? (
              <>
                <button
                  type="button"
                  onClick={() => click("u")}
                  className="inline-flex items-center gap-1 rounded border border-fd-border px-1.5 py-0.5 text-fd-foreground transition-colors hover:border-fd-primary/60 focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary motion-reduce:transition-none"
                >
                  <kbd className="text-fd-primary">u</kbd>
                  <span className="text-fd-muted-foreground">undo</span>
                </button>
                <button
                  type="button"
                  onClick={() => click("S")}
                  aria-pressed={showSnoozed}
                  className="inline-flex items-center gap-1 rounded border border-fd-border px-1.5 py-0.5 text-fd-foreground transition-colors hover:border-fd-primary/60 focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary motion-reduce:transition-none"
                >
                  <kbd className="text-fd-primary">S</kbd>
                  <span className="text-fd-muted-foreground">snoozed</span>
                </button>
              </>
            ) : null}
          </fieldset>

          <output
            aria-live="polite"
            className={cn(
              "block min-h-7 border-fd-border border-t px-3 py-1",
              notice?.tone === "success"
                ? "text-emerald-700 dark:text-emerald-400"
                : notice?.tone === "demo"
                  ? "text-fd-muted-foreground italic"
                  : "text-fd-foreground",
            )}
          >
            {notice ? notice.text : ""}
          </output>
        </div>
      </div>

      <figcaption className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-sm">
        Click the list, then use the keys, or press the buttons. The first
        approval is <strong>risky</strong>: <kbd>1</kbd> only arms it, and a
        second <kbd>1</kbd> within 3 seconds allows it. Any other key disarms
        it, and <kbd>3</kbd> denies at once. <kbd>z</kbd> snoozes the errored or
        finished item, <kbd>d</kbd> dismisses, and <kbd>u</kbd> brings back the
        last dismiss or snooze for 10 seconds. Held approvals and questions
        cannot be snoozed, because an agent is waiting on them.
      </figcaption>
    </figure>
  );
}
