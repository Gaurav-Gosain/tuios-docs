"use client";

import { Check, Copy } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import type { GalleryLook } from "@/lib/gallery/feed";

/** The command that applies an entry's look. */
export function applyCommand(look: GalleryLook) {
  return `tuios look apply tuios.dev/r/${look.id}`;
}

/**
 * The apply command of a card, with a copy button, a short note on what it
 * does, and the keys the look left out. badge is the version badge of the
 * feature, made on the server (see app/gallery/page.tsx).
 */
export function ApplyCommand({
  look,
  badge,
}: {
  look: GalleryLook;
  badge?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const command = applyCommand(look);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      // No clipboard access. The command can be selected by hand.
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1 rounded-md border border-fd-border bg-fd-secondary/50 py-1 ps-2.5 pe-1">
        <code className="min-w-0 flex-1 break-words font-mono text-[12px] text-fd-foreground leading-snug">
          <span className="select-none text-fd-muted-foreground">$ </span>
          {command}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy the command"}
          title="Copy the command"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
        >
          {copied ? (
            <Check className="size-3.5 text-fd-primary" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>
      <p className="text-[12px] text-fd-muted-foreground leading-snug">
        Adds the look as a separate file. Run{" "}
        <code className="font-mono">tuios look remove</code> to undo it.
        {badge}
      </p>
      {look.leftCount > 0 ? (
        <p className="text-[12px] text-fd-muted-foreground leading-snug">
          {leftText(look)}
        </p>
      ) : null}
    </div>
  );
}

/** "2 keys left out: hooks, shell", naming at most the names the feed has. */
export function leftText(look: GalleryLook) {
  const n = look.leftCount;
  const head = `${n} ${n === 1 ? "key" : "keys"} left out`;
  if (look.left.length === 0) return `${head}.`;
  const more = n - look.left.length;
  return `${head}: ${look.left.join(", ")}${more > 0 ? ` and ${more} more` : ""}.`;
}
