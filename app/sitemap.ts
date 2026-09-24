import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/site";
import { getBlogPosts, getDocsInSidebarOrder, getReleases } from "@/lib/source";

export const dynamic = "force-static";

function lastModified(date: string | undefined) {
  return date ? new Date(`${date}T00:00:00Z`) : undefined;
}

/**
 * Every page on the site. Posts and release notes carry the date from their
 * frontmatter. Docs pages have no date, and a date taken from git would be
 * wrong on the shallow checkout the deploy builds from, so they carry none.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts();
  const releases = getReleases();
  const newest = [posts[0]?.data.date, releases[0]?.data.date]
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);

  return [
    {
      // The bare origin, the same form Next.js writes into the home page's
      // canonical link.
      url: site.url,
      lastModified: lastModified(newest),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/learn"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/brand"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...getDocsInSidebarOrder().map(({ page }) => ({
      url: absoluteUrl(page.url),
      changeFrequency: "weekly" as const,
      priority: page.slugs.length === 0 ? 0.9 : 0.8,
    })),
    {
      url: absoluteUrl("/blog"),
      lastModified: lastModified(posts[0]?.data.date),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(post.url),
      lastModified: lastModified(post.data.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    {
      url: absoluteUrl("/releases"),
      lastModified: lastModified(releases[0]?.data.date),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...releases.map((release) => ({
      url: absoluteUrl(release.url),
      lastModified: lastModified(release.data.date),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
