import { Rss } from "lucide-react";

const linkClass =
  "text-fd-foreground underline decoration-fd-primary/50 underline-offset-4 hover:decoration-fd-primary";

/**
 * Links to a section's RSS and Atom feeds. Plain anchors, not next/link: the
 * feeds are XML files, not pages the client router can render.
 */
export function FeedLinks({ rss, atom }: { rss: string; atom: string }) {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-fd-muted-foreground text-sm">
      <Rss aria-hidden="true" className="size-4 text-fd-primary" />
      <span>Subscribe:</span>
      <a href={rss} className={linkClass} type="application/rss+xml">
        RSS
      </a>
      <span aria-hidden="true">/</span>
      <a href={atom} className={linkClass} type="application/atom+xml">
        Atom
      </a>
    </p>
  );
}
