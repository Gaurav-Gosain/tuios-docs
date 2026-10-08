import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatShortDate, type getBlogPosts } from "@/lib/source";
import { type Topic, topics, topicsOf } from "@/lib/topics";

type Post = ReturnType<typeof getBlogPosts>[number];

export interface PostListItem {
  post: Post;
  minutes: number;
}

/** The topics of a post, read from its `tags` frontmatter. */
export function postTopics(post: Post): Topic[] {
  return topicsOf(post.data.tags ?? [], post.url);
}

/**
 * The rows of the blog index: date, reading time and topics on the left,
 * title and description on the right.
 */
export function PostList({ items }: { items: PostListItem[] }) {
  return (
    <ol className="divide-y divide-fd-border border-fd-border border-y">
      {items.map(({ post, minutes }) => (
        <li key={post.url}>
          <Link
            href={post.url}
            className="group grid gap-x-8 gap-y-2 py-7 md:grid-cols-[9rem_1fr]"
          >
            <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-fd-muted-foreground text-xs md:flex-col md:gap-1 md:pt-1.5">
              <time dateTime={post.data.date}>
                {formatShortDate(post.data.date)}
              </time>
              <span>{minutes} min read</span>
              <span>
                {postTopics(post)
                  .map((t) => t.title)
                  .join(", ")}
              </span>
            </p>
            <div>
              <h2 className="font-semibold text-fd-foreground text-xl leading-snug transition-colors group-hover:text-fd-primary">
                {post.data.title}
              </h2>
              <p className="mt-2 text-fd-muted-foreground leading-relaxed">
                {post.data.description}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/**
 * Links to every topic page, with the number of posts in each. `current` is
 * the topic on screen, or undefined on the index.
 */
export function TopicNav({
  posts,
  current,
}: {
  posts: Post[];
  current?: string;
}) {
  const count = (slug: string) =>
    posts.filter((p) => (p.data.tags ?? []).includes(slug)).length;
  const links = [
    { href: "/blog", title: "All posts", n: posts.length, slug: undefined },
    ...topics.map((t) => ({
      href: `/blog/topic/${t.slug}`,
      title: t.title,
      n: count(t.slug),
      slug: t.slug as string | undefined,
    })),
  ];
  return (
    <nav aria-label="Topics" className="mt-6">
      <ul className="flex flex-wrap gap-2 font-mono text-xs">
        {links.map((l) => {
          const active = l.slug === current;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 transition-colors",
                  active
                    ? "border-fd-primary bg-fd-primary/10 text-fd-foreground"
                    : "border-fd-border text-fd-muted-foreground hover:border-fd-primary/50 hover:text-fd-foreground",
                )}
              >
                {l.title}
                <span className="text-fd-muted-foreground">{l.n}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
