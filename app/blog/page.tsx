import type { Metadata } from "next";
import Link from "next/link";
import { formatPostDate, getBlogPosts } from "@/lib/source";

export const metadata: Metadata = {
  title: "Engineering blog",
  description:
    "Notes on building TUIOS and the tools around it: fuzzing a terminal harness, profiling a renderer, and the diagnoses that turned out to be wrong.",
};

export default function BlogIndex() {
  const posts = getBlogPosts();

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
      <header className="mb-12">
        <h1 className="mb-4 font-bold text-3xl text-fd-foreground md:text-4xl">
          Engineering blog
        </h1>
        <p className="text-base text-fd-muted-foreground leading-relaxed">
          Longer write-ups on how TUIOS and its sibling tools were built,
          measured and fixed. Every number here came out of a run that can be
          repeated from the repository.
        </p>
      </header>

      <ul className="flex list-none flex-col gap-4 p-0">
        {posts.map((post) => (
          <li key={post.url}>
            <Link
              href={post.url}
              className="block rounded-lg border border-fd-border bg-fd-card p-6 no-underline transition-colors hover:border-fd-primary/50 hover:bg-fd-accent/40 focus-visible:outline-2 focus-visible:outline-fd-primary focus-visible:outline-offset-2"
            >
              <time
                dateTime={post.data.date}
                className="text-fd-muted-foreground text-xs uppercase tracking-wide"
              >
                {formatPostDate(post.data.date)}
              </time>
              <h2 className="mt-2 mb-2 font-semibold text-fd-foreground text-xl">
                {post.data.title}
              </h2>
              <p className="m-0 text-fd-muted-foreground text-sm leading-relaxed">
                {post.data.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
