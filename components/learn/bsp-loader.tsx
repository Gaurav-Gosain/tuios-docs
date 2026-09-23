"use client";

import { RotateCw } from "lucide-react";
import { useMemo } from "react";
import type { EngineStatus } from "@/lib/learn/runtime";

type Rect = { x: number; y: number; w: number; h: number };

const SPLITS = 8;
const COLORS = [
  "#bb9af7",
  "#7aa2f7",
  "#9ece6a",
  "#7dcfff",
  "#f7768e",
  "#e0af68",
  "#bb9af7",
  "#7aa2f7",
  "#9ece6a",
];

/**
 * The panes after `n` splits, the way tuios's BSP tiler does it: the newest
 * pane splits along its longer side, and the new half takes the focus.
 */
function layout(n: number, aspect: number): Rect[] {
  const panes: Rect[] = [{ x: 0, y: 0, w: 1, h: 1 }];
  let focus = 0;
  for (let i = 0; i < n; i++) {
    const p = panes[focus];
    const wide = p.w * aspect >= p.h;
    let a: Rect;
    let b: Rect;
    if (wide) {
      a = { ...p, w: p.w / 2 };
      b = { ...p, x: p.x + p.w / 2, w: p.w / 2 };
    } else {
      a = { ...p, h: p.h / 2 };
      b = { ...p, y: p.y + p.h / 2, h: p.h / 2 };
    }
    panes[focus] = a;
    // Alternate which half keeps splitting, so the pattern spirals.
    panes.push(b);
    focus = i % 3 === 2 ? 0 : panes.length - 1;
  }
  return panes;
}

function mb(bytes: number) {
  return (bytes / 1e6).toFixed(1);
}

/**
 * A desktop of panes that splits once for every eighth of the download. When
 * the engine is ready the panes fade and the real terminal shows through.
 */
export function BspLoader({
  status,
  gone,
  aspect = 1.6,
  onRetry,
  compact,
}: {
  status: EngineStatus;
  gone: boolean;
  aspect?: number;
  onRetry?: () => void;
  compact?: boolean;
}) {
  const progress =
    status.phase === "ready"
      ? 1
      : status.total > 0
        ? Math.min(1, status.loaded / status.total)
        : 0;
  const splits = Math.min(SPLITS, Math.floor(progress * SPLITS));
  const all = useMemo(() => layout(SPLITS, aspect), [aspect]);
  const now = useMemo(() => layout(splits, aspect), [splits, aspect]);
  const failed = status.phase === "error" || status.phase === "missing";

  return (
    <div
      aria-hidden={gone}
      className={`absolute inset-0 z-10 bg-[#11111b] transition-opacity duration-500 ${gone ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <div
        className={`absolute inset-3 ${gone ? "bsp-collapse" : ""} motion-reduce:hidden`}
      >
        {all.map((_, i) => {
          const r = now[i];
          const shown = Boolean(r);
          const rect = r ?? now[0];
          const color = failed ? "#f7768e" : COLORS[i % COLORS.length];
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: panes are fixed slots
              key={i}
              className="bsp-pane"
              data-focus={i === now.length - 1 || undefined}
              style={
                {
                  left: `${rect.x * 100}%`,
                  top: `${rect.y * 100}%`,
                  width: `${rect.w * 100}%`,
                  height: `${rect.h * 100}%`,
                  opacity: shown ? 1 : 0,
                  "--pane": color,
                } as React.CSSProperties
              }
            >
              <div>
                {i === now.length - 1 ? (
                  <span className="bsp-cursor" />
                ) : (
                  <>
                    <div className="bsp-line" style={{ width: "46%" }} />
                    <div className="bsp-line" style={{ width: "30%" }} />
                    <div className="bsp-line" style={{ width: "38%" }} />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 pb-5">
        <div className="rounded-full border border-white/10 bg-[#11111b]/85 px-4 py-2 font-mono text-[#cdd6f4] text-xs shadow-lg backdrop-blur">
          {failed ? (
            <span className="inline-flex items-center gap-3">
              {status.phase === "missing"
                ? "The tuios engine is not built here yet."
                : "Could not load tuios."}
              {onRetry && status.phase === "error" ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1 text-[#bb9af7] hover:underline"
                >
                  <RotateCw className="size-3" /> Retry
                </button>
              ) : null}
            </span>
          ) : status.phase === "ready" ? (
            "starting tuios"
          ) : (
            <>
              loading tuios{" "}
              <span className="text-[#bb9af7]">
                {status.total
                  ? `${mb(status.loaded)} / ${mb(status.total)} MB`
                  : ""}
              </span>
            </>
          )}
        </div>
        {!compact ? (
          <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#bb9af7] to-[#7aa2f7] transition-[width] duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
