/**
 * The path a page's markdown twin is served at: the page's URL with ".md"
 * added ("/docs/sessions.md", "/blog.md"), and "/index.md" for the home page.
 * scripts/export-markdown.mjs writes the files; pages link to them in the head.
 */
export function markdownPath(url: string) {
  return url === "/" ? "/index.md" : `${url.replace(/\/$/, "")}.md`;
}
