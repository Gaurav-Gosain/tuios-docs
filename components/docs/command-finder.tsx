"use client";

import { Check, Copy, Search, X } from "lucide-react";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { BrandMark } from "@/components/brand";
import { cn } from "@/lib/cn";
import data from "@/lib/commands/commands.json";

/**
 * Every tuios command, found by what it does. The data is tuios's own command
 * tree (`tuios help --json`), turned into lib/commands/commands.json by
 * scripts/commands.mjs, so a usage line or a flag here is the one the binary
 * has.
 */

interface Flag {
  name: string;
  short?: string;
  type: string;
  default?: string;
  usage: string;
}

interface Command {
  path: string;
  use: string;
  short: string;
  aliases?: string[];
  flags?: Flag[];
  doc?: string;
}

const commands = data.commands as Command[];

/** The first word after tuios, which the group menu lists. */
function group(c: Command) {
  return c.path.split(" ")[1] ?? "";
}

const groups = [...new Set(commands.map(group))].sort();

/** Words that score a command higher when they hit its name, not its text. */
function score(c: Command, terms: string[]): number {
  if (terms.length === 0) return 1;
  const name = c.path.slice("tuios ".length).toLowerCase();
  const text = [c.short, c.use, ...(c.aliases ?? [])].join(" ").toLowerCase();
  const flags = (c.flags ?? [])
    .map((f) => `--${f.name} ${f.usage}`)
    .join(" ")
    .toLowerCase();
  let total = 0;
  for (const t of terms) {
    if (name.includes(t)) total += name.split(" ").includes(t) ? 6 : 4;
    else if (text.includes(t)) total += 2;
    else if (flags.includes(t)) total += 1;
    else return 0;
  }
  return total;
}

function CopyUse({ c }: { c: Command }) {
  const [done, setDone] = useState(false);
  const line = c.path;
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(line).then(
          () => {
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          },
          () => {},
        );
      }}
      aria-label={`Copy ${line}`}
      title={line}
      className="shrink-0 rounded p-1 text-fd-muted-foreground hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

function FlagList({ flags }: { flags: Flag[] }) {
  return (
    <ul className="mt-2 grid gap-1">
      {flags.map((f) => (
        <li key={f.name} className="flex flex-wrap gap-x-2 text-xs">
          <code className="font-mono text-fd-foreground">
            {f.short ? `-${f.short}, ` : ""}--{f.name}
            {f.type !== "bool" ? ` ${f.type}` : ""}
          </code>
          <span className="text-fd-muted-foreground">
            {f.usage}
            {f.default ? ` (default ${f.default})` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function CommandFinder() {
  const [query, setQuery] = useState("");
  const [only, setOnly] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const deferred = useDeferredValue(query);
  const inputId = useId();
  const groupId = useId();
  const countId = useId();

  const found = useMemo(() => {
    const terms = deferred
      .toLowerCase()
      .replace(/^tuios\s+/, "")
      .split(/\s+/)
      .filter(Boolean);
    return commands
      .filter((c) => only === "all" || group(c) === only)
      .map((c) => ({ c, s: score(c, terms) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.c.path.localeCompare(b.c.path))
      .map((x) => x.c);
  }, [deferred, only]);

  return (
    <figure
      data-widget="command-finder"
      className="not-prose my-8 overflow-hidden rounded-xl border border-fd-border bg-fd-card"
    >
      <div className="flex flex-wrap items-center gap-2 border-fd-border border-b bg-fd-muted/40 p-3">
        <label htmlFor={inputId} className="sr-only">
          Find a command by name, by what it does, or by a flag
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
            placeholder="What do you want to do? split, attach, screenshot, --json..."
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-md border border-fd-border bg-fd-background py-1.5 [&::-webkit-search-cancel-button]:appearance-none pr-8 pl-8 font-mono text-fd-foreground text-sm placeholder:text-fd-muted-foreground focus:border-fd-primary focus:outline-none focus:ring-1 focus:ring-fd-primary"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear the search"
              className="-translate-y-1/2 absolute top-1/2 right-1.5 rounded p-1 text-fd-muted-foreground hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
        <label htmlFor={groupId} className="sr-only">
          Command
        </label>
        <select
          id={groupId}
          value={only}
          onChange={(e) => setOnly(e.target.value)}
          className="rounded-md border border-fd-border bg-fd-background px-2 py-1.5 font-mono text-fd-foreground text-xs focus:border-fd-primary focus:outline-none focus:ring-1 focus:ring-fd-primary"
        >
          <option value="all">Every command</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <p
        id={countId}
        aria-live="polite"
        className="border-fd-border border-b px-4 py-2 font-mono text-fd-muted-foreground text-xs"
      >
        {found.length} of {commands.length} commands
      </p>

      <div className="max-h-[36rem] overflow-y-auto">
        {found.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <BrandMark size={40} />
            <p className="text-fd-muted-foreground text-sm">
              Tilly looked through every command and found none for that. Try
              another word for what you want to do, or the{" "}
              <a className="underline" href="/docs/control-protocol">
                control protocol
              </a>{" "}
              for the verbs under the commands.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-fd-border/60">
            {found.map((c) => {
              const expanded = open === c.path;
              return (
                <li key={c.path} className="px-4 py-2.5">
                  <div className="flex gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <code className="break-all font-mono text-fd-foreground text-sm">
                          {c.path}
                        </code>
                        {c.aliases?.length ? (
                          <span className="font-mono text-[0.6875rem] text-fd-muted-foreground">
                            also {c.aliases.join(", ")}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-fd-foreground text-sm">
                        {c.short}
                      </p>
                      <p className="mt-1 break-words font-mono text-fd-muted-foreground text-xs">
                        {c.use}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-3 font-mono text-xs">
                        {c.flags?.length ? (
                          <button
                            type="button"
                            aria-expanded={expanded}
                            onClick={() => setOpen(expanded ? null : c.path)}
                            className={cn(
                              "underline decoration-fd-border underline-offset-4 hover:text-fd-foreground",
                              expanded
                                ? "text-fd-foreground"
                                : "text-fd-muted-foreground",
                            )}
                          >
                            {expanded
                              ? "hide the flags"
                              : `${c.flags.length} flag${c.flags.length === 1 ? "" : "s"}`}
                          </button>
                        ) : null}
                        {c.doc ? (
                          <a
                            href={c.doc}
                            className="text-fd-primary underline decoration-fd-primary/40 underline-offset-4"
                          >
                            reference
                          </a>
                        ) : null}
                      </div>
                      {expanded && c.flags ? (
                        <FlagList flags={c.flags} />
                      ) : null}
                    </div>
                    <CopyUse c={c} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <figcaption className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-xs">
        Read from <code>{data.source}</code>. Every command also takes{" "}
        <code>--help</code>, and <code>tuios help -i</code> opens the same list
        in your terminal.
      </figcaption>
    </figure>
  );
}
