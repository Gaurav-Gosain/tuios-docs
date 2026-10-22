import type { Metadata } from "next";
import { LostShell } from "@/components/eggs/lost-shell";
import { SiteLayout } from "@/components/layout/site";
import { blogSource, releasesSource, source } from "@/lib/source";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

// The pages outside the three collections, as the shell lists them.
const TOP = ["/learn", "/gallery", "/brand", "/in-the-wild"];

/**
 * The 404 page: a tuios pane with a small shell in it. `ls` lists the real
 * pages of the site and `cd` opens one. Plain links sit under it.
 */
export default function NotFound() {
  const urls = [
    ...source.getPages().map((p) => p.url),
    ...blogSource.getPages().map((p) => p.url),
    ...releasesSource.getPages().map((p) => p.url),
    ...TOP,
  ];
  return (
    <SiteLayout>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10 sm:py-16">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-fd-muted-foreground">
          This page does not exist. The pane below is a small shell: type{" "}
          <code>ls</code> to list the pages and <code>cd</code> to open one.
        </p>
        <LostShell urls={urls} />
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
    </SiteLayout>
  );
}
