"use client";

import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryEntry, GalleryLook } from "@/lib/gallery/feed";
import { type Plan, planLook } from "@/lib/gallery/try-plan";

/**
 * The Try it dialog (see try-it.tsx). It is its own chunk, with the plan, the
 * stage and smol-toml behind it, so none of them loads before the press.
 */

const LiveDemoStage = dynamic(
  () =>
    import("@/components/docs/live-demo-stage").then((m) => m.LiveDemoStage),
  { ssr: false },
);

async function fetchLook(look: GalleryLook): Promise<Record<string, unknown>> {
  const urls = [`/r/${look.id}.toml`];
  // The dev server has no Worker; a seed's file is a static asset there.
  if (!/^\d+$/.test(look.id)) urls.push(`/gallery-seed/${look.id}.look.toml`);
  const { parse } = await import("smol-toml");
  for (const url of urls) {
    const res = await fetch(url).catch(() => null);
    if (res?.ok) return parse(await res.text()) as Record<string, unknown>;
  }
  throw new Error("The look file is not there.");
}

/** The look key paths, the only paths the plan may set. */
async function lookKeyPaths(): Promise<Set<string>> {
  const { default: list } = await import("@/lib/gallery/look-keys.json");
  return new Set(list.keys.map((k) => k.path));
}

export function TryItDialog({
  entry,
  look,
  onClose,
}: {
  entry: GalleryEntry;
  look: GalleryLook;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    ref.current?.showModal();
    let live = true;
    Promise.all([fetchLook(look), lookKeyPaths()])
      .then(([doc, keys]) => live && setPlan(planLook(doc, look, keys)))
      .catch(
        () => live && setProblem("The look did not load. Try again later."),
      );
    return () => {
      live = false;
    };
  }, [look]);

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose],
  );

  const [engine, setEngine] = useState<string[] | null>(null);
  const onCommands = useCallback((c: string[]) => setEngine(c), []);
  // The commands the engine does not have are listed with the rest.
  const skipped = [
    ...(plan?.skipped ?? []),
    ...(engine
      ? [
          ...new Set(
            plan?.setup.flatMap((s) => ("command" in s ? [s.command] : [])),
          ),
        ]
          .filter((c) => !engine.includes(c))
          .map((c) =>
            c === "themeJSON"
              ? "the theme (this browser build has no themeJSON)"
              : `${c} (not in this browser build)`,
          )
      : []),
  ];

  const title = entry.title ?? `@${entry.login}'s setup`;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape closes a modal dialog natively
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={onClick}
      aria-label={`Try ${title} in the browser`}
      className="m-auto max-h-[94dvh] w-[min(72rem,96vw)] overflow-y-auto rounded-xl border border-fd-border bg-fd-background p-0 text-fd-foreground shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3 border-fd-border border-b px-4 py-3">
        <p className="min-w-0 truncate font-medium text-sm">
          Try {title} in the browser
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="p-4">
        {problem ? (
          <p className="text-fd-muted-foreground text-sm">{problem}</p>
        ) : plan ? (
          <>
            <LiveDemoStage
              title={title}
              setup={plan.setup}
              controls={[]}
              hint="The look applies to this tab only. Nothing is saved."
              onCommands={onCommands}
            />
            {skipped.length > 0 ? (
              <p className="mt-2 text-fd-muted-foreground text-xs">
                Not applied here: {skipped.join(", ")}.
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-fd-muted-foreground text-sm">Loading the look.</p>
        )}
      </div>
    </dialog>
  );
}
