"use client";
import { usePathname } from "next/navigation";
import { lazy, Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SiteKeys } from "@/components/eggs/site-keys";
import { ThemeHost } from "@/components/site-themes/theme-host";

const LostShell = lazy(() =>
  import("@/components/eggs/lost-shell").then((m) => ({
    default: m.LostShell,
  })),
);

/**
 * The site's client extras, as one component in the root layout: the theme
 * picker, the site keys, and the shell of the 404 page.
 *
 * The 404 page (app/not-found.tsx) has no client component of its own. Next
 * keeps the not-found page in the root layout, and a client component there
 * gets a chunk group that every page loads. So the page renders an empty
 * pane, and this mounts the shell into it.
 */
export function SiteExtras() {
  const pathname = usePathname();
  const [pane, setPane] = useState<HTMLElement | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: look again on each navigation
  useEffect(() => {
    setPane(document.querySelector<HTMLElement>("[data-lost-shell]"));
  }, [pathname]);

  return (
    <>
      <ThemeHost />
      <SiteKeys />
      {pane &&
        createPortal(
          <Suspense fallback={null}>
            <LostShell />
          </Suspense>,
          pane,
        )}
    </>
  );
}
