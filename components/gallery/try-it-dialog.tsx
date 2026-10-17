"use client";

import { ChevronRight, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  entryTitle,
  type GalleryEntry,
  type GalleryLook,
} from "@/lib/gallery/feed";
import { type Plan, planLook } from "@/lib/gallery/try-plan";
import {
  type LookKey,
  sceneAfter,
  sceneBefore,
  undoLook,
} from "@/lib/gallery/try-scene";
import { runSetup, type TuiosInstance } from "@/lib/learn/runtime";

/**
 * The Try it dialog (see try-it.tsx). It is its own chunk, with the plan, the
 * stage and smol-toml behind it, so none of them loads before the press.
 *
 * The look goes on a small scene (lib/gallery/try-scene.ts) rather than an
 * empty desktop. Next look puts the following entry's look on the same
 * tuios: reset, the last look's keys back to their defaults, then the next
 * look and its scene. One tuios for the whole dialog, so stepping through
 * looks starts no new engine.
 */

const LiveDemoStage = dynamic(
  () =>
    import("@/components/docs/live-demo-stage").then((m) => m.LiveDemoStage),
  { ssr: false },
);

async function fetchLook(look: GalleryLook): Promise<Record<string, unknown>> {
  const { parse } = await import("smol-toml");
  const res = await fetch(`/r/${look.id}.toml`).catch(() => null);
  if (res?.ok) return parse(await res.text()) as Record<string, unknown>;
  throw new Error("The look file is not there.");
}

/** The look keys, the only paths the plan may set, with their defaults. */
async function lookKeys(): Promise<LookKey[]> {
  const { default: list } = await import("@/lib/gallery/look-keys.json");
  return list.keys;
}

/** A phone-sized screen, which gets the compact scene and a taller stage. */
function narrow() {
  return typeof window !== "undefined" && window.innerWidth < 640;
}

/** A look's plan, with the scene around it. */
type Staged = Plan & { title: string };

async function stage(entry: GalleryEntry, look: GalleryLook): Promise<Staged> {
  const [doc, keys] = await Promise.all([fetchLook(look), lookKeys()]);
  const plan = planLook(doc, look, new Set(keys.map((k) => k.path)));
  return {
    title: entryTitle(entry),
    skipped: plan.skipped,
    setup: [
      ...sceneBefore(keys),
      ...plan.setup,
      ...sceneAfter(doc, { compact: narrow() }),
    ],
  };
}

export function TryItDialog({
  entry,
  look,
  entries = [],
  onClose,
}: {
  entry: GalleryEntry;
  look: GalleryLook;
  /** The entries Next look steps through, in the gallery's order. */
  entries?: GalleryEntry[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // The first look's plan starts the stage. It stays as it is: the stage
  // runs it once, and a later look goes on the running tuios instead.
  const [first, setFirst] = useState<Staged | null>(null);
  const [current, setCurrent] = useState<Staged | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const tuios = useRef<TuiosInstance | null>(null);
  const [live, setLive] = useState(false);
  const [at, setAt] = useState(entry.id);

  useEffect(() => {
    ref.current?.showModal();
    let alive = true;
    stage(entry, look)
      .then((p) => {
        if (!alive) return;
        setFirst(p);
        setCurrent(p);
      })
      .catch(
        () => alive && setProblem("The look did not load. Try again later."),
      );
    return () => {
      alive = false;
    };
  }, [entry, look]);

  const withLooks = entries.filter((e) => e.look);
  const index = withLooks.findIndex((e) => e.id === at);
  const next =
    withLooks.length > 1 ? withLooks[(index + 1) % withLooks.length] : null;

  const onInstance = useCallback((t: TuiosInstance) => {
    tuios.current = t;
    setLive(true);
  }, []);

  // The focus goes to Next look, not into the terminal. The terminal takes
  // Tab and Escape, so from there the keyboard could not reach Next look or
  // close the dialog. A click on the terminal still types into it.
  const nextButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (live) nextButton.current?.focus();
  }, [live]);

  const showNext = useCallback(async () => {
    const t = tuios.current;
    if (!t || !next?.look || !current || busy) return;
    setBusy(true);
    try {
      const [p, keys] = await Promise.all([stage(next, next.look), lookKeys()]);
      await runSetup(t, [
        { command: "reset", wait: 60 },
        ...undoLook(current.setup, keys),
        ...p.setup,
      ]);
      setCurrent(p);
      setAt(next.id);
    } catch {
      setProblem("The next look did not load. Try again later.");
    } finally {
      setBusy(false);
    }
  }, [next, current, busy]);

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose],
  );

  const [engine, setEngine] = useState<string[] | null>(null);
  const onCommands = useCallback((c: string[]) => setEngine(c), []);
  // The commands the engine does not have are listed with the rest.
  const plan = current;
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

  const title = current?.title ?? entryTitle(entry);

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
        ) : first ? (
          <>
            <LiveDemoStage
              title={first.title}
              setup={first.setup}
              controls={[]}
              hint="The look applies to this tab only. Nothing is saved."
              onCommands={onCommands}
              onInstance={onInstance}
              focusTerminal={false}
              stageClassName="aspect-[4/5] w-full sm:aspect-[16/10]"
            />
            {next ? (
              <div className="mt-3 flex items-center gap-2 text-sm">
                {/* aria-disabled while a look loads, not disabled: a disabled
                    button drops the focus, and Enter must step through the
                    looks one after another. */}
                <button
                  ref={nextButton}
                  type="button"
                  disabled={!live}
                  aria-disabled={busy}
                  onClick={showNext}
                  className="inline-flex items-center gap-1 rounded-full border border-fd-border px-3 py-1 hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-fd-primary focus-visible:outline-offset-2 disabled:opacity-50 aria-disabled:opacity-50"
                >
                  Next look
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </button>
                <span className="min-w-0 truncate text-fd-muted-foreground">
                  {busy ? "Loading the look." : entryTitle(next)}
                </span>
              </div>
            ) : null}
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
