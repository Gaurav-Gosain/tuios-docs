/**
 * Pages that moved. A page that was published once is linked from feeds,
 * posts and search results, so removing it would turn those links into 404s.
 * Each entry maps the old path to the new one, both without a trailing slash.
 */
export const MOVED: Record<string, string> = {
  // The notes on unreleased work since v0.7.0 became the v0.8.0 notes.
  "/releases/since-v0-7-0": "/releases/v0-8-0",
};

/**
 * The path a request for pathname should be sent to, or null when the page
 * has not moved. It covers the page with or without a trailing slash, its
 * .html file and its markdown twin (.md), which goes to the new page's twin.
 */
export function movedTo(pathname: string): string | null {
  if (pathname.endsWith(".md")) {
    const target = MOVED[pathname.slice(0, -".md".length)];
    return target ? `${target}.md` : null;
  }
  let page = pathname;
  if (page.endsWith(".html")) page = page.slice(0, -".html".length);
  if (page.length > 1 && page.endsWith("/")) page = page.slice(0, -1);
  return MOVED[page] ?? null;
}
