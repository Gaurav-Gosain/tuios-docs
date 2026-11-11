"use client";

import { Check, Copy, Search, X } from "lucide-react";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { BrandMark } from "@/components/brand";
import { Since } from "@/components/mdx/since";
import { cn } from "@/lib/cn";
import data from "@/lib/options/options.json";
import since from "@/lib/since/data.json";

/**
 * Every option `tuios set-config` takes, filtered as you type. The data is
 * tuios's own option registry (`tuios list-options --json`), turned into
 * lib/options/options.json by scripts/options.mjs, so the types, defaults
 * and accepted values cannot drift from the code the way a copied table
 * does.
 */

interface Option {
  path: string;
  section: string;
  type: string;
  default: string;
  accepted?: string[];
  min?: number;
  max?: number;
  /** The unit tuios states for the value, such as ms, s, % or rows. */
  unit?: string;
  auto?: boolean;
  deprecated?: string;
  description: string;
}

const options = data.options as Option[];
const dated = since.config as Record<string, string>;

const TYPES = ["bool", "int", "string"] as const;

const sections = [...new Set(options.map((o) => o.section))].sort();

function values(o: Option): string {
  if (o.accepted?.length) return o.accepted.join(", ");
  if (o.type === "bool") return "true, false";
  if (o.min !== undefined && o.max !== undefined) {
    return `${o.min} to ${o.max}${withUnit(o)}${o.auto ? ", or auto" : ""}`;
  }
  return "";
}

/** " ms", "%" or " rows": a percent sits on the number, as tuios shows it. */
function withUnit(o: Option): string {
  if (!o.unit) return "";
  return o.unit === "%" ? "%" : ` ${o.unit}`;
}

function shownDefault(o: Option): string {
  if (o.default === "") return '""';
  return /^-?\d+$/.test(o.default) ? `${o.default}${withUnit(o)}` : o.default;
}

function matches(o: Option, terms: string[]) {
  if (terms.length === 0) return true;
  const hay = [o.path, o.description, o.section, values(o)]
    .join(" ")
    .toLowerCase();
  return terms.every((t) => hay.includes(t));
}

/** The set-config line for an option at its default, ready to edit. */
function setLine(o: Option) {
  const value = o.default === "" ? "''" : o.default;
  return `tuios set-config ${o.path} ${value}`;
}

function CopyLine({ o }: { o: Option }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(setLine(o)).then(
          () => {
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          },
          () => {},
        );
      }}
      aria-label={`Copy the set-config command for ${o.path}`}
      title={setLine(o)}
      className="shrink-0 rounded p-1 text-fd-muted-foreground hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

export function OptionExplorer() {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");
  const [type, setType] = useState<string>("all");
  const [showOld, setShowOld] = useState(false);
  const deferred = useDeferredValue(query);
  const inputId = useId();
  const sectionId = useId();
  const countId = useId();

  const groups = useMemo(() => {
    const terms = deferred.toLowerCase().split(/\s+/).filter(Boolean);
    const out = new Map<string, Option[]>();
    for (const o of options) {
      if (section !== "all" && o.section !== section) continue;
      if (type !== "all" && o.type !== type) continue;
      if (o.deprecated && !showOld) continue;
      if (!matches(o, terms)) continue;
      const list = out.get(o.section) ?? [];
      list.push(o);
      out.set(o.section, list);
    }
    return [...out];
  }, [deferred, section, type, showOld]);

  const shown = groups.reduce((n, [, list]) => n + list.length, 0);
  const total = options.filter((o) => showOld || !o.deprecated).length;

  return (
    <figure
      data-widget="option-explorer"
      className="not-prose my-8 overflow-hidden rounded-xl border border-fd-border bg-fd-card"
    >
      <div className="flex flex-col gap-3 border-fd-border border-b bg-fd-muted/40 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={inputId} className="sr-only">
            Filter options by name, description or value
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
              placeholder="Filter: border, theme, agents, motion..."
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
          <label htmlFor={sectionId} className="sr-only">
            Section
          </label>
          <select
            id={sectionId}
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="rounded-md border border-fd-border bg-fd-background px-2 py-1.5 font-mono text-fd-foreground text-xs focus:border-fd-primary focus:outline-none focus:ring-1 focus:ring-fd-primary"
          >
            <option value="all">Every section</option>
            {sections.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <fieldset className="flex flex-wrap gap-1.5">
            <legend className="sr-only">Type</legend>
            {["all", ...TYPES].map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={type === t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-full border px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary",
                  type === t
                    ? "border-fd-primary bg-fd-primary/15 text-fd-foreground"
                    : "border-fd-border text-fd-muted-foreground hover:text-fd-foreground",
                )}
              >
                {t === "all" ? "Every type" : t}
              </button>
            ))}
          </fieldset>
          <label className="ms-auto inline-flex cursor-pointer items-center gap-1.5 font-mono text-fd-muted-foreground text-xs">
            <input
              type="checkbox"
              checked={showOld}
              onChange={(e) => setShowOld(e.target.checked)}
              className="accent-fd-primary"
            />
            Show old keys
          </label>
        </div>
      </div>

      <p
        id={countId}
        aria-live="polite"
        className="border-fd-border border-b px-4 py-2 font-mono text-fd-muted-foreground text-xs"
      >
        {shown} of {total} options
      </p>

      <div className="max-h-[36rem] overflow-y-auto">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <BrandMark size={40} />
            <p className="text-fd-muted-foreground text-sm">
              Tilly found no option for that. Some tables, such as
              [keybindings], [hosts] and [hooks], are set in the file: see{" "}
              <a className="underline" href="/docs/configuration">
                Configuration
              </a>
              .
            </p>
          </div>
        ) : (
          groups.map(([name, list]) => (
            <section key={name} aria-labelledby={`opt-${name}`}>
              {/* Not a heading, as in the keybinding explorer: two dozen
                  section titles inside one figure would crowd the outline. */}
              <div
                id={`opt-${name}`}
                className="sticky top-0 z-10 border-fd-border border-b bg-fd-card/95 px-4 py-2 font-semibold text-fd-foreground text-sm backdrop-blur"
              >
                {name}
              </div>
              <ul className="divide-y divide-fd-border/60">
                {list.map((o) => (
                  <li key={o.path} className="flex gap-3 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <code className="break-all font-mono text-fd-foreground text-sm">
                          {o.path}
                        </code>
                        {dated[o.path] ? <Since config={o.path} /> : null}
                        <span className="rounded border border-fd-border px-1.5 font-mono text-[0.6875rem] text-fd-muted-foreground">
                          {o.type}
                        </span>
                        {o.deprecated ? (
                          <span className="rounded border border-amber-500/50 px-1.5 font-mono text-[0.6875rem] text-amber-600 dark:text-amber-400">
                            old key
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-fd-foreground text-sm">
                        {o.description}
                      </p>
                      <p className="mt-1 font-mono text-fd-muted-foreground text-xs">
                        default {shownDefault(o)}
                        {values(o) ? <> · {values(o)}</> : null}
                      </p>
                      {o.deprecated ? (
                        <p className="mt-1 text-amber-700 text-xs dark:text-amber-400">
                          {o.deprecated}
                        </p>
                      ) : null}
                    </div>
                    <CopyLine o={o} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
      <figcaption className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-xs">
        Read from <code>{data.source}</code>, with Linux defaults. The copy
        button gives the <code>tuios set-config</code> line at the default. Your
        own values: <code>tuios list-options</code> in a session.
      </figcaption>
    </figure>
  );
}
