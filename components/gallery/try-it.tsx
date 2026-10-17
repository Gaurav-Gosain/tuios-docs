"use client";

import { Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { GalleryEntry } from "@/lib/gallery/feed";

/**
 * "Try it": the entry's look on the real tuios, in the browser. The press is
 * the start: nothing loads before it. Then the look file comes from
 * /r/<id>.toml, smol-toml reads it, and the live demo stage of the docs
 * (components/docs/live-demo-stage.tsx) boots the /learn engine and runs the
 * look as setup commands:
 *
 * - `set` for each key of the look, by its config path;
 * - `themeJSON` for a [theme] the look carries, last, so its theme wins.
 *
 * Only look keys go to `set` (see lib/gallery/try-plan.ts). A key the look
 * left out, a glyph set, and a theme on an engine without themeJSON are
 * listed as not applied instead.
 *
 * The dialog is a chunk of its own (try-it-dialog.tsx), so this file is only
 * the button.
 */

const TryItDialog = dynamic(
  () => import("./try-it-dialog").then((m) => m.TryItDialog),
  { ssr: false },
);

export function TryItButton({ entry }: { entry: GalleryEntry }) {
  const [open, setOpen] = useState(false);
  if (!entry.look) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-fd-foreground text-xs transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-fd-primary"
      >
        <Play className="size-3.5" aria-hidden="true" />
        Try it
      </button>
      {open ? (
        <TryItDialog
          entry={entry}
          look={entry.look}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
