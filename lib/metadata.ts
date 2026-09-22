import type { Metadata } from "next";
import { feeds, site } from "./site";

/**
 * The feed links for the head. Next.js replaces `alternates` as a whole when a
 * page sets its own canonical URL, so every page carries these again through
 * pageMetadata rather than inheriting them from the root layout.
 */
export const feedAlternates = {
  "application/rss+xml": [
    { url: feeds.blog.rss, title: feeds.blog.title },
    { url: feeds.releases.rss, title: feeds.releases.title },
  ],
  "application/atom+xml": [
    { url: feeds.blog.atom, title: feeds.blog.title },
    { url: feeds.releases.atom, title: feeds.releases.title },
  ],
};

/**
 * Metadata for one page: title, description, canonical URL, feed links, and
 * the Open Graph and Twitter cards. `title` is the bare page title; the root
 * layout's template adds the site name to the document title, and the cards get
 * the bare title because the site name is already shown beside them.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = site.image,
  article,
  cardTitle = title ?? site.title,
}: {
  title?: string;
  description: string;
  path: string;
  image?: string;
  article?: { publishedTime: string; author: string; section?: string };
  /** The title on the cards, when the bare page title says too little. */
  cardTitle?: string;
}): Metadata {
  const images = [{ url: image, width: 1200, height: 630, alt: cardTitle }];

  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: path,
      types: feedAlternates,
    },
    openGraph: {
      title: cardTitle,
      description,
      url: path,
      siteName: site.name,
      locale: "en_GB",
      images,
      ...(article
        ? {
            type: "article",
            publishedTime: article.publishedTime,
            authors: [article.author],
            ...(article.section ? { section: article.section } : {}),
          }
        : { type: "website" }),
    },
    twitter: {
      card: "summary_large_image",
      title: cardTitle,
      description,
      images,
    },
  };
}
