import type { Metadata } from "next";
import { BrandLockup } from "@/components/brand";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/**
 * The 404 page: a tuios pane with a small shell in it. `ls` lists the real
 * pages of the site and `cd` opens one. Plain links sit under it.
 *
 * Next keeps the not-found page in the root layout, so every page loads what
 * it imports. That is why it has no site layout and no client component:
 * SiteExtras (components/site-extras.tsx) finds the empty pane and mounts the
 * shell into it. The shell loads the page list from /api/pages.json.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8 sm:py-14">
      <a href="/" aria-label="tuios home" className="mb-4 w-fit">
        <BrandLockup size={26} />
      </a>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-fd-muted-foreground">
        This page does not exist. The pane below is a small shell: type{" "}
        <code>ls</code> to list the pages and <code>cd</code> to open one.
      </p>
      {/* The shell mounts here. The empty pane keeps its place meanwhile. */}
      <div
        data-lost-shell=""
        className="min-h-[19.25rem] sm:min-h-[21.25rem]"
      />
      <p className="text-sm text-fd-muted-foreground">
        Or go to the{" "}
        <a className="underline" href="/docs">
          docs
        </a>
        , the{" "}
        <a className="underline" href="/">
          home page
        </a>{" "}
        or the{" "}
        <a className="underline" href="/blog">
          blog
        </a>
        .
      </p>
    </main>
  );
}
