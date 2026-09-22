import type { TOCItemType } from "fumadocs-core/toc";
import { InlineTOC } from "fumadocs-ui/components/inline-toc";
import { ArrowLeft, ArrowRight, Text } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { TOCItems } from "@/components/toc/default";
import { TOCProvider, TOCScrollArea } from "@/components/toc/index";
import { cn } from "@/lib/cn";
import { formatPostDate } from "@/lib/source";

export interface ArticleLink {
  url: string;
  title: string;
}

export interface ArticleLayoutProps {
  back: { href: string; label: string };
  title: string;
  description?: string;
  date: string;
  author: string;
  minutes: number;
  toc: TOCItemType[];
  /** Small label shown before the date, such as a version tag. */
  eyebrow?: ReactNode;
  /** The entry above this one in the index (newer). */
  newer?: ArticleLink;
  /** The entry below this one in the index (older). */
  older?: ArticleLink;
  children: ReactNode;
}

/**
 * The page around a blog post or a release note: a header, a reading column
 * about 70 characters wide, an outline in the right margin on wide screens (a
 * collapsible one above the text on narrow screens), and links to the entries
 * either side of it.
 */
export function ArticleLayout({
  back,
  title,
  description,
  date,
  author,
  minutes,
  toc,
  eyebrow,
  newer,
  older,
  children,
}: ArticleLayoutProps) {
  const outline = toc.filter((item) => item.depth <= 3);
  const showOutline = outline.length >= 3;

  return (
    <TOCProvider toc={outline}>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 pt-8 pb-20 md:px-6 md:pt-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,44rem)_minmax(0,1fr)]">
        <div className="max-xl:hidden" />

        <article className="min-w-0">
          <Link
            href={back.href}
            className="group inline-flex items-center gap-1.5 font-mono text-fd-muted-foreground text-sm transition-colors hover:text-fd-foreground"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            {back.label}
          </Link>

          <header className="mt-8 mb-10 border-fd-border border-b pb-8">
            <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-fd-muted-foreground text-xs">
              {eyebrow}
              <time dateTime={date}>{formatPostDate(date)}</time>
              <span aria-hidden="true">·</span>
              <span>{minutes} min read</span>
            </p>
            <h1 className="font-bold text-3xl text-fd-foreground leading-tight md:text-[2.5rem]">
              {title}
            </h1>
            {description ? (
              <p className="mt-5 text-fd-muted-foreground text-lg leading-relaxed">
                {description}
              </p>
            ) : null}
            <p className="mt-6 flex items-center gap-2.5 text-sm">
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-fd-primary/15 font-mono font-semibold text-fd-primary text-xs">
                {initials(author)}
              </span>
              <span className="text-fd-foreground">{author}</span>
            </p>
          </header>

          {showOutline ? (
            <InlineTOC items={outline} className="mb-10 xl:hidden">
              <span className="inline-flex items-center gap-2 text-sm">
                <Text className="size-4 text-fd-muted-foreground" />
                On this page
              </span>
            </InlineTOC>
          ) : null}

          <div className="prose article-prose max-w-none">{children}</div>

          {newer || older ? (
            <nav
              aria-label="More"
              className="mt-16 grid gap-3 border-fd-border border-t pt-8 sm:grid-cols-2"
            >
              {older ? (
                <NeighbourLink link={older} direction="older" />
              ) : (
                <span className="max-sm:hidden" />
              )}
              {newer ? <NeighbourLink link={newer} direction="newer" /> : null}
            </nav>
          ) : null}
        </article>

        <aside className="max-xl:hidden">
          {showOutline ? (
            <div className="sticky top-24 flex max-h-[calc(100dvh-8rem)] flex-col">
              <p className="inline-flex items-center gap-1.5 font-mono text-fd-muted-foreground text-sm">
                <Text className="size-4" />
                On this page
              </p>
              <TOCScrollArea>
                <TOCItems />
              </TOCScrollArea>
            </div>
          ) : null}
        </aside>
      </div>
    </TOCProvider>
  );
}

function NeighbourLink({
  link,
  direction,
}: {
  link: ArticleLink;
  direction: "older" | "newer";
}) {
  const newer = direction === "newer";
  return (
    <Link
      href={link.url}
      className={cn(
        "group flex flex-col gap-1.5 rounded-lg border border-fd-border p-4 transition-colors hover:border-fd-primary/50 hover:bg-fd-accent/30",
        newer && "sm:items-end sm:text-right",
      )}
    >
      <span className="inline-flex items-center gap-1.5 font-mono text-fd-muted-foreground text-xs">
        {newer ? null : <ArrowLeft className="size-3" />}
        {newer ? "Newer" : "Older"}
        {newer ? <ArrowRight className="size-3" /> : null}
      </span>
      <span className="font-medium text-fd-foreground leading-snug group-hover:text-fd-primary">
        {link.title}
      </span>
    </Link>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
