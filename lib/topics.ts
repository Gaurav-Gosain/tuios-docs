/**
 * The topics a blog post can carry in its `tags` frontmatter. The blog index
 * links to a page per topic, in this order. A tag that is not listed here
 * fails the build, so a typo cannot make a topic page of its own.
 */
export const topics = [
  {
    slug: "rendering",
    title: "Rendering",
    blurb: "What tuios draws, and the bugs that put the wrong thing on screen.",
  },
  {
    slug: "testing",
    title: "Testing",
    blurb: "Fuzzers, end-to-end tests, and tests that could not fail.",
  },
  {
    slug: "performance",
    title: "Performance",
    blurb: "Profiles, benchmarks, memory and binary size.",
  },
  {
    slug: "agents",
    title: "Agents",
    blurb: "How tuios follows the coding agents in its panes.",
  },
  {
    slug: "sessions",
    title: "Sessions",
    blurb: "The daemon, its clients, and panes on other machines.",
  },
  {
    slug: "input",
    title: "Input",
    blurb: "Keys, mouse and links.",
  },
  {
    slug: "releases",
    title: "Releases",
    blurb: "Posts about a release.",
  },
] as const;

export type Topic = (typeof topics)[number];

export function findTopic(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

/** The topics of a post, in the order of `topics`. Throws on an unknown tag. */
export function topicsOf(tags: readonly string[], where: string): Topic[] {
  for (const tag of tags) {
    if (!findTopic(tag)) {
      throw new Error(
        `${where}: unknown topic "${tag}". Add it to lib/topics.ts or fix the tag.`,
      );
    }
  }
  return topics.filter((t) => tags.includes(t.slug));
}
