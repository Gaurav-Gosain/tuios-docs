/**
 * Facts about the site used by metadata, structured data, feeds and the
 * sitemap. Keep them in one place so a canonical URL and a feed link can never
 * disagree about the host.
 */
export const site = {
  url: "https://tuios.gaurav.zip",
  name: "TUIOS",
  title: "TUIOS: a window manager for your terminal",
  description:
    "TUIOS is a terminal window manager with vim-style keys, tiling, nine workspaces, and sessions that keep running when you detach.",
  image: "/og/site/image.png",
  repository: "https://github.com/Gaurav-Gosain/tuios",
  author: {
    name: "Gaurav Gosain",
    url: "https://github.com/Gaurav-Gosain",
  },
} as const;

/** The feeds, linked from the head of every page and from the index pages. */
export const feeds = {
  blog: {
    title: "TUIOS engineering blog",
    rss: "/blog/rss.xml",
    atom: "/blog/atom.xml",
  },
  releases: {
    title: "TUIOS releases",
    rss: "/releases/rss.xml",
    atom: "/releases/atom.xml",
  },
} as const;

/** An absolute URL on the site for a path such as "/docs". */
export function absoluteUrl(path: string) {
  return new URL(path, site.url).toString();
}
