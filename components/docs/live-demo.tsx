"use client";

import { Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { SetupCommand } from "@/lib/learn/types";

/**
 * The stage loads only after the press: its chunk holds the learn runtime,
 * the terminal and the /learn styles, and it fetches the engine itself.
 */
const LiveDemoStage = dynamic(
  () => import("./live-demo-stage").then((m) => m.LiveDemoStage),
  { ssr: false },
);

/** A button under the live tuios that runs one page command. */
export type LiveDemoControl = {
  label: string;
  command: string;
  args?: string[];
};

/**
 * The real tuios, compiled to WebAssembly, in a docs page. It is the engine
 * of /learn, with the fake shell in every pane.
 *
 * Nothing loads before the reader presses Start: no script of the stage, no
 * engine.json, no wasm. Until then the frame shows `poster`, a picture of
 * tuios made by scripts/docs-media.sh. The engine files are the ones /learn
 * loads, from the same content-hashed folder, so a reader who has been to
 * /learn has them in the browser cache already, and the other way round.
 *
 * `setup` runs once the first frame is drawn, as a /learn lesson's setup
 * does. `controls` are buttons under the stage that run page commands, so
 * the demo also works on a phone with no keyboard.
 */
export function LiveDemo({
  title,
  poster,
  posterWidth,
  posterHeight,
  setup,
  controls = [],
  hint,
}: {
  title: string;
  poster: string;
  posterWidth: number;
  posterHeight: number;
  setup: SetupCommand[];
  controls?: LiveDemoControl[];
  hint?: string;
}) {
  const [started, setStarted] = useState(false);

  return (
    <figure className="not-prose my-6">
      {started ? (
        <LiveDemoStage
          title={title}
          setup={setup}
          controls={controls}
          hint={hint}
        />
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-fd-border bg-[#11111b]">
          {/* biome-ignore lint/performance/noImgElement: a static export has no image optimizer, and the poster is already a sized WebP file */}
          <img
            src={poster}
            alt=""
            width={posterWidth}
            height={posterHeight}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full opacity-40"
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-black/75 px-5 py-4 text-center backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="inline-flex items-center gap-2 rounded-full bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground shadow-lg transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-fd-primary focus-visible:outline-offset-2"
              >
                <Play className="size-4" aria-hidden="true" />
                {title}
              </button>
              <p className="max-w-sm text-sm text-white/80">
                Runs the real tuios in this page. It downloads about 15 MB once.
                Learn tuios uses the same download.
              </p>
            </div>
          </div>
        </div>
      )}
    </figure>
  );
}
