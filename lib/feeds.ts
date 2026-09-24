import { type Feed, toFeedItem } from "./feed";
import { feeds } from "./site";
import { getBlogPosts, getReleases } from "./source";

/** The blog feed: every post, newest first, with its full text. */
export async function getBlogFeed(format: "rss" | "atom"): Promise<Feed> {
  return {
    title: feeds.blog.title,
    description:
      "Long engineering posts about building tuios: bugs, measurements, and the diagnoses that turned out to be wrong.",
    path: "/blog",
    feedPath: feeds.blog[format],
    items: await Promise.all(getBlogPosts().map(toFeedItem)),
  };
}

/** The releases feed: every release note, newest first, with its full text. */
export async function getReleasesFeed(format: "rss" | "atom"): Promise<Feed> {
  return {
    title: feeds.releases.title,
    description: "What changed in each release of tuios.",
    path: "/releases",
    feedPath: feeds.releases[format],
    items: await Promise.all(getReleases().map(toFeedItem)),
  };
}
