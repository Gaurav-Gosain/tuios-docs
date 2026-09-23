"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  clearKeyDebug,
  environmentLines,
  formatKeyDebug,
  formatRow,
  keyDebugEnabled,
  keyDebugRows,
  subscribeKeyDebug,
  watchWindow,
} from "@/lib/learn/keydebug";

const empty: never[] = [];

/**
 * The key log for /learn?debug=keys: a drawer at the bottom left that lists
 * the last key events and copies them as text. Renders nothing without the
 * flag.
 */
export function KeyDebugPanel() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!keyDebugEnabled()) return;
    setOn(true);
    return watchWindow();
  }, []);
  if (!on) return null;
  return createPortal(<Drawer />, document.body);
}

function Drawer() {
  const rows = useSyncExternalStore(
    subscribeKeyDebug,
    keyDebugRows,
    () => empty,
  );
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState<"" | "yes" | "failed">("");

  const copy = async () => {
    const text = formatKeyDebug();
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // Older browsers, or no clipboard permission: select and copy.
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      area.remove();
    }
    setCopied(ok ? "yes" : "failed");
    setTimeout(() => setCopied(""), 1800);
  };

  // Buttons keep focus where it was, so the terminal keeps getting the keys.
  const keepFocus = (e: React.MouseEvent) => e.preventDefault();
  const button =
    "rounded border border-white/20 px-2 py-0.5 text-[11px] text-white/90 hover:bg-white/10";
  const start = rows[0]?.at ?? 0;

  return (
    <div
      data-learn-debug=""
      className="fixed bottom-3 left-3 z-[1000] max-w-[calc(100vw-2rem)] font-mono text-[11px] text-white/90"
    >
      {open ? (
        <div className="flex max-h-[45vh] w-[640px] max-w-full flex-col overflow-hidden rounded-lg border border-white/15 bg-[#11111b]/95 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-2 border-white/10 border-b px-2 py-1.5">
            <span className="font-bold tracking-wider">KEY LOG</span>
            <span className="text-white/50">{rows.length} events</span>
            <span className="flex-1" />
            <button
              type="button"
              className={button}
              onMouseDown={keepFocus}
              onClick={copy}
            >
              {copied === "yes"
                ? "Copied"
                : copied === "failed"
                  ? "Copy failed"
                  : "Copy"}
            </button>
            <button
              type="button"
              className={button}
              onMouseDown={keepFocus}
              onClick={clearKeyDebug}
            >
              Clear
            </button>
            <button
              type="button"
              className={button}
              onMouseDown={keepFocus}
              onClick={() => setOpen(false)}
              aria-label="Hide the key log"
            >
              Hide
            </button>
          </div>
          <div className="overflow-auto px-2 py-1.5">
            <pre className="whitespace-pre text-white/50 leading-snug">
              {environmentLines().slice(2, 8).join("\n")}
            </pre>
            <pre className="mt-1.5 whitespace-pre leading-snug">
              {rows.length
                ? rows.map((r) => formatRow(r, start)).join("\n")
                : "Press a key in the terminal. Then Copy, and paste the text back."}
            </pre>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="rounded-md border border-white/20 bg-[#11111b]/95 px-2.5 py-1 text-white/90 shadow-lg"
          onMouseDown={keepFocus}
          onClick={() => setOpen(true)}
        >
          key log ({rows.length})
        </button>
      )}
    </div>
  );
}
