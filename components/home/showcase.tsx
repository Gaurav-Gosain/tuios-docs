"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The landing page's picture of tuios: four whole-screen captures taken by
 * tuios itself (the screenshot_screen action, drawn by internal/shot) of one
 * demo session. A tab list switches between them.
 */

const SHOTS = [
  {
    id: "panes",
    label: "Panes",
    src: "/shots/overview.webp",
    alt: "tuios with four tiled panes: a git diff, a Go file, test output and a build. The sidebar lists the session, its files and four agents with their states.",
    text: "Tiled panes, a sidebar of sessions and files, and every agent's state at a glance: working, waiting on you, done or failed.",
    href: "/docs/layout-modes",
    more: "Layouts",
  },
  {
    id: "inbox",
    label: "Inbox",
    src: "/shots/inbox.webp",
    alt: "The tuios Inbox listing an approval marked risky, a question and an errored agent, with the reason the approval is risky.",
    text: "One Inbox for everything your agents wait on. A command that matches a risk rule says why, and needs a second press to allow.",
    href: "/docs/agent-inbox",
    more: "The Inbox",
  },
  {
    id: "review",
    label: "Review",
    src: "/shots/review.webp",
    alt: "The tuios review view: a file list on the left and a highlighted diff on the right, with keys for notes, hunks and files.",
    text: "Read what an agent changed without leaving the session, leave notes on lines or hunks, and send them back to it.",
    href: "/docs/agent-inbox#reviewing-an-agents-changes",
    more: "Review",
  },
  {
    id: "settings",
    label: "Settings",
    src: "/shots/settings.webp",
    alt: "The tuios settings page searched for theme. The Theme row carries a dot because it differs from the default.",
    text: "Every option is on one searchable page. A dot marks what you changed from the default, and changes apply at once.",
    href: "/docs/configuration",
    more: "Configuration",
  },
] as const;

export function Showcase() {
  const [index, setIndexState] = useState(0);
  const [seen, setSeen] = useState<number[]>([0]);
  const setIndex = (i: number) => {
    setIndexState(i);
    setSeen((prev) => (prev.includes(i) ? prev : [...prev, i]));
  };
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const shot = SHOTS[index];

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % SHOTS.length;
    else if (e.key === "ArrowLeft")
      next = (index - 1 + SHOTS.length) % SHOTS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = SHOTS.length - 1;
    else return;
    e.preventDefault();
    setIndex(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="What tuios looks like"
        className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg border border-fd-border bg-fd-card p-1"
      >
        {SHOTS.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${s.id}`}
            aria-selected={i === index}
            aria-controls={`${base}-panel`}
            tabIndex={i === index ? 0 : -1}
            onClick={() => setIndex(i)}
            onKeyDown={onKeyDown}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 font-mono text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary",
              i === index
                ? "bg-fd-primary text-fd-primary-foreground"
                : "text-fd-muted-foreground hover:text-fd-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${base}-panel`}
        aria-labelledby={`${base}-tab-${shot.id}`}
        className="mt-5"
      >
        <div className="overflow-hidden rounded-xl border border-fd-border bg-[#1e1e2e] shadow-2xl shadow-fd-primary/10">
          <a
            href={shot.src}
            target="_blank"
            rel="noopener"
            className="relative block aspect-[1600/996] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary focus-visible:ring-inset"
          >
            {SHOTS.map((s, i) =>
              // Only the shots someone has opened are in the page, so the
              // first visit downloads one image. A viewed one stays mounted,
              // so going back to it does not flash.
              seen.includes(i) ? (
                // biome-ignore lint/performance/noImgElement: a static export has no image optimizer, and these are already sized WebP files
                <img
                  key={s.id}
                  src={s.src}
                  srcSet={`${s.src.replace(".webp", "-800.webp")} 800w, ${s.src} 1600w`}
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  alt={i === index ? s.alt : ""}
                  aria-hidden={i === index ? undefined : true}
                  width={1600}
                  height={996}
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className={cn(
                    "absolute inset-0 block h-full w-full transition-opacity duration-300 motion-reduce:transition-none",
                    i === index ? "opacity-100" : "opacity-0",
                  )}
                />
              ) : null,
            )}
            <span className="sr-only"> (opens the full size image)</span>
          </a>
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-center text-fd-muted-foreground text-sm leading-relaxed">
          {shot.text}{" "}
          <Link
            href={shot.href}
            className="whitespace-nowrap text-fd-foreground underline decoration-fd-primary/50 underline-offset-4 hover:decoration-fd-primary"
          >
            {shot.more}
          </Link>
        </p>
      </div>
    </div>
  );
}
