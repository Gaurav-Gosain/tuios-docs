"use client";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  applyTheme,
  OPEN_EVENT,
  readStored,
  writeStored,
} from "@/lib/site-themes/store";

// The picker and the theme data are one chunk that loads on the first open.
const ThemePicker = lazy(() => import("./theme-picker"));

/**
 * Mounted once in the root layout. It opens the picker when anything sends
 * OPEN_EVENT (the header button, Ctrl+B t), and it brings a saved theme up to
 * date when the site's palettes have changed since it was saved.
 */
export function ThemeHost() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    const saved = readStored();
    if (!saved) return;
    // Only a reader with a saved theme pays for the data, once, when the
    // page is idle. A theme that is gone, or now derives differently, is
    // replaced or dropped.
    const run = () =>
      Promise.all([
        import("@/lib/site-themes/themes.json"),
        import("@/lib/site-themes/derive"),
      ]).then(([data, d]) => {
        const raw = (data.default.themes as { id: string }[]).find(
          (t) => t.id === saved.id,
        ) as Parameters<typeof d.deriveTheme>[0] | undefined;
        const now = readStored();
        if (!now || now.id !== saved.id) return;
        if (!raw) {
          writeStored(null);
          applyTheme(null, now.dark);
          return;
        }
        const t = d.deriveTheme(raw);
        const css = d.themeCss(t);
        if (css === now.css) return;
        writeStored({ ...now, css, dark: t.dark, name: t.name });
        applyTheme({ id: t.id, css }, t.dark);
      });
    const idle = window.requestIdleCallback ?? ((f) => setTimeout(f, 1500));
    idle(() => void run());
  }, []);

  if (!open) return null;
  return (
    <Suspense fallback={null}>
      <ThemePicker onClose={() => setOpen(false)} />
    </Suspense>
  );
}
