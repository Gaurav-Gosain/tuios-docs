"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { installMethods as methods } from "@/lib/install-methods";

/** Install commands, one tab per package manager, each with a copy button. */
export function InstallTabs({ className }: { className?: string }) {
  const [active, setActive] = useState<(typeof methods)[number]["id"]>("brew");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const method = methods.find((m) => m.id === active) ?? methods[0];

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(method.command);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be refused; the command is still selectable.
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-fd-border bg-fd-card text-left shadow-sm",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label="Install method"
        className="flex overflow-x-auto border-fd-border border-b [scrollbar-width:none]"
      >
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={m.id === active}
            onClick={() => {
              setActive(m.id);
              setCopied(false);
            }}
            className={cn(
              "shrink-0 border-b-2 px-3.5 py-2 font-mono text-xs transition-colors",
              m.id === active
                ? "border-fd-primary text-fd-foreground"
                : "border-transparent text-fd-muted-foreground hover:text-fd-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 py-1.5 pr-1.5 pl-4">
        <pre className="m-0 min-w-0 flex-1 overflow-x-auto border-0 bg-transparent py-2 text-sm shadow-none [scrollbar-width:thin]">
          <code>
            <span className="select-none text-fd-muted-foreground">$ </span>
            {method.command}
          </code>
        </pre>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy command"}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
        >
          {copied ? (
            <Check className="size-4 text-emerald-500" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}
