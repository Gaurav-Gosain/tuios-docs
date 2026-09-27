"use client";

import { Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useId, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import data from "@/lib/keybindings/defaults.json";

/**
 * Every default binding, filtered as you type. The data is tuios's own
 * keybind report (`tuios keybinds doctor --json`), turned into
 * lib/keybindings/defaults.json by scripts/keybindings.mjs, so the table
 * cannot drift from the registry the way a hand-copied one does.
 */

interface Binding {
  scope: string;
  section: string;
  action: string;
  description: string;
  keys: string[];
  mac?: string[];
}

const bindings = data.bindings as Binding[];

/** Where a binding is live, in the order the filter chips show. */
const GROUPS: { id: string; label: string; scopes: string[] }[] = [
  { id: "window", label: "Window mode", scopes: ["window", "global"] },
  { id: "terminal", label: "Terminal mode", scopes: ["terminal", "global"] },
  {
    id: "prefix",
    label: "Ctrl+B prefix",
    scopes: [
      "prefix",
      "prefix.window",
      "prefix.minimize",
      "prefix.workspace",
      "prefix.layout",
      "prefix.debug",
      "prefix.tape",
    ],
  },
  {
    id: "inbox",
    label: "Inbox and mail",
    scopes: ["inbox", "inbox.peek", "mail"],
  },
  {
    id: "sidebar",
    label: "Sidebar",
    scopes: ["sidebar", "sidebar.files", "sidebar.agents"],
  },
];

const SECTION_LABELS: Record<string, string> = {
  global: "Everywhere",
  window_management: "Windows",
  workspaces: "Workspaces",
  layout: "Layout",
  mode_control: "Modes",
  system: "System",
  navigation: "Navigation",
  restore_minimized: "Restore minimized",
  terminal_mode: "Terminal mode",
  sidebar: "Sidebar",
  sidebar_files: "Sidebar: files",
  sidebar_agents: "Sidebar: agents",
  inbox: "Inbox",
  inbox_peek: "Inbox: answering a prompt",
  mail: "Mailbox",
  prefix_mode: "Prefix (Ctrl+B)",
  window_prefix: "Window prefix (Ctrl+B t)",
  minimize_prefix: "Minimize prefix (Ctrl+B m)",
  workspace_prefix: "Workspace prefix (Ctrl+B w)",
  debug_prefix: "Debug prefix (Ctrl+B D)",
  tape_prefix: "Tape prefix (Ctrl+B T)",
  layout_prefix: "Layout prefix (Ctrl+B L)",
  script: "While a tape plays",
};

const KEY_NAMES: Record<string, string> = {
  ctrl: "Ctrl",
  alt: "Alt",
  opt: "Opt",
  shift: "Shift",
  super: "Super",
  esc: "Esc",
  enter: "Enter",
  tab: "Tab",
  space: "Space",
  up: "Up",
  down: "Down",
  left: "Left",
  right: "Right",
  home: "Home",
  end: "End",
  pgup: "PgUp",
  pgdown: "PgDn",
  delete: "Delete",
};

/** "ctrl+b L 5" is a chord of three presses; "ctrl+b" is one. */
function presses(key: string) {
  return key.split(" ").map((press) => {
    const parts = press.split("+");
    // Ctrl ignores case, so ctrl+p reads as Ctrl+P, the way the docs write
    // it. With alt or none, case is a different key and stays as bound.
    const ctrl = parts.includes("ctrl");
    return parts
      .map((part) =>
        ctrl && part.length === 1
          ? part.toUpperCase()
          : (KEY_NAMES[part] ?? part),
      )
      .join("+");
  });
}

type Platform = "linux" | "mac";

function keysFor(b: Binding, platform: Platform) {
  return platform === "mac" && b.mac ? b.mac : b.keys;
}

function matches(b: Binding, terms: string[], platform: Platform) {
  if (terms.length === 0) return true;
  const hay = [
    b.action,
    b.description,
    b.section,
    SECTION_LABELS[b.section] ?? "",
    ...keysFor(b, platform),
    ...keysFor(b, platform).flatMap(presses),
  ]
    .join(" ")
    .toLowerCase();
  return terms.every((t) => hay.includes(t));
}

export function KeybindingExplorer() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("all");
  const [platform, setPlatform] = useState<Platform>("linux");
  const deferred = useDeferredValue(query);
  const inputId = useId();
  const countId = useId();

  // Show the reader's own platform first. navigator is only read after
  // hydration, so the static HTML and the first client render agree.
  useEffect(() => {
    if (/mac/i.test(navigator.userAgent)) setPlatform("mac");
  }, []);

  const sections = useMemo(() => {
    const terms = deferred.toLowerCase().split(/\s+/).filter(Boolean);
    const scopes =
      group === "all" ? null : GROUPS.find((g) => g.id === group)?.scopes;
    const out = new Map<string, Binding[]>();
    for (const b of bindings) {
      if (scopes && !scopes.includes(b.scope)) continue;
      if (!matches(b, terms, platform)) continue;
      const list = out.get(b.section) ?? [];
      list.push(b);
      out.set(b.section, list);
    }
    return [...out];
  }, [deferred, group, platform]);

  const shown = sections.reduce((n, [, list]) => n + list.length, 0);

  return (
    <figure
      data-widget="keybinding-explorer"
      className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card"
    >
      <div className="flex flex-col gap-3 border-fd-border border-b bg-fd-muted/40 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={inputId} className="sr-only">
            Filter keybindings by key, action or description
          </label>
          <div className="relative min-w-0 flex-1 basis-56">
            <Search
              aria-hidden="true"
              className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 size-4 text-fd-muted-foreground"
            />
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-describedby={countId}
              placeholder="Filter: inbox, ctrl+b, split, workspace..."
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-md border border-fd-border bg-fd-background py-1.5 [&::-webkit-search-cancel-button]:appearance-none pr-8 pl-8 font-mono text-fd-foreground text-sm placeholder:text-fd-muted-foreground focus:border-fd-primary focus:outline-none focus:ring-1 focus:ring-fd-primary"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear the filter"
                className="-translate-y-1/2 absolute top-1/2 right-1.5 rounded p-1 text-fd-muted-foreground hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
          <fieldset className="inline-flex overflow-hidden rounded-md border border-fd-border">
            <legend className="sr-only">Platform</legend>
            {(
              [
                ["linux", "Linux"],
                ["mac", "macOS"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={platform === id}
                onClick={() => setPlatform(id)}
                className={cn(
                  "px-2.5 py-1.5 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary focus-visible:ring-inset",
                  platform === id
                    ? "bg-fd-primary text-fd-primary-foreground"
                    : "text-fd-muted-foreground hover:text-fd-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </fieldset>
        </div>
        <fieldset className="flex flex-wrap gap-1.5">
          <legend className="sr-only">Where the key works</legend>
          {[{ id: "all", label: "All" }, ...GROUPS].map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={group === g.id}
              onClick={() => setGroup(g.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary",
                group === g.id
                  ? "border-fd-primary bg-fd-primary/15 text-fd-foreground"
                  : "border-fd-border text-fd-muted-foreground hover:text-fd-foreground",
              )}
            >
              {g.label}
            </button>
          ))}
        </fieldset>
      </div>

      <p
        id={countId}
        aria-live="polite"
        className="border-fd-border border-b px-4 py-2 font-mono text-fd-muted-foreground text-xs"
      >
        {shown} of {bindings.length} actions
      </p>

      <div className="max-h-[32rem] overflow-y-auto">
        {sections.length === 0 ? (
          <p className="px-4 py-8 text-center text-fd-muted-foreground text-sm">
            No default binding matches. The action may be unbound: search the
            palette for it, or bind it in the config.
          </p>
        ) : (
          sections.map(([section, list]) => (
            <section key={section} aria-labelledby={`kb-${section}`}>
              {/* Not a heading: thirty section titles inside one figure would
                  crowd the page outline and break its heading order. */}
              <div
                id={`kb-${section}`}
                className="sticky top-0 z-10 flex flex-wrap items-baseline justify-between gap-x-3 border-fd-border border-b bg-fd-card/95 px-4 py-2 font-semibold text-fd-foreground text-sm backdrop-blur"
              >
                {SECTION_LABELS[section] ?? section}
                <code className="font-normal text-fd-muted-foreground text-xs">
                  [keybindings.{section}]
                </code>
              </div>
              <ul className="divide-y divide-fd-border/60">
                {list.map((b) => (
                  <li
                    key={`${b.scope} ${b.action}`}
                    className="grid gap-x-4 gap-y-1 px-4 py-2 sm:grid-cols-[minmax(9rem,auto)_1fr]"
                  >
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {keysFor(b, platform).map((key, i) => (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1"
                        >
                          {i > 0 ? (
                            <span className="text-fd-muted-foreground text-xs">
                              or
                            </span>
                          ) : null}
                          {presses(key).map((p, j) => (
                            <kbd
                              // A chord can repeat a press, so the position is
                              // part of the key.
                              key={`${j}:${p}`}
                              className="keycap"
                            >
                              {p}
                            </kbd>
                          ))}
                        </span>
                      ))}
                    </span>
                    <span className="min-w-0 text-sm">
                      <span className="text-fd-foreground">
                        {b.description}
                      </span>{" "}
                      <code className="block break-words text-fd-muted-foreground text-xs sm:inline">
                        {b.action}
                      </code>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
      <figcaption className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-xs">
        The defaults, read from <code>{data.source}</code>. Your own bindings:{" "}
        <code>tuios keybinds list</code>, or{" "}
        <kbd className="keycap">Ctrl+B</kbd> <kbd className="keycap">k</kbd> in
        a session.
      </figcaption>
    </figure>
  );
}
