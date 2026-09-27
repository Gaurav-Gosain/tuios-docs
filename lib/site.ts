/**
 * Facts about the site used by metadata, structured data, feeds and the
 * sitemap. Keep them in one place so a canonical URL and a feed link can never
 * disagree about the host.
 */
export const site = {
  url: "https://tuios.dev",
  name: "tuios",
  title:
    "tuios: a terminal window manager that knows what your agents are doing",
  description:
    "tuios is a terminal window manager with tiling, sessions that keep running when you detach, and one Inbox for what the coding agents in your panes are waiting on.",
  image: "/og/site/image.png",
  repository: "https://github.com/Gaurav-Gosain/tuios",
  /** The repository this site is built from: brand and site questions go here. */
  docsRepository: "https://github.com/Gaurav-Gosain/tuios-docs",
  author: {
    name: "Gaurav Gosain",
    url: "https://github.com/Gaurav-Gosain",
  },
} as const;

/** The feeds, linked from the head of every page and from the index pages. */
export const feeds = {
  blog: {
    title: "tuios engineering blog",
    rss: "/blog/rss.xml",
    atom: "/blog/atom.xml",
  },
  releases: {
    title: "tuios releases",
    rss: "/releases/rss.xml",
    atom: "/releases/atom.xml",
  },
} as const;

/** An absolute URL on the site for a path such as "/docs". */
export function absoluteUrl(path: string) {
  return new URL(path, site.url).toString();
}

/**
 * The site's first origin. It now redirects every path to site.url, see
 * worker/redirect.ts.
 */
export const legacyOrigin = "https://tuios.gaurav.zip";
