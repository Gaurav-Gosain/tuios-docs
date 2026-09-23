/**
 * The Worker that serves the site from Workers static assets and negotiates
 * each page between HTML and its markdown twin, following the
 * acceptmarkdown.com Cloudflare Workers recipe. The build writes both side by
 * side (out/docs/sessions.html and out/docs/sessions.md, see
 * scripts/export-markdown.mjs), and wrangler.jsonc sets run_worker_first so
 * every request reaches this code before the assets.
 *
 * - Accept prefers text/markdown: the twin, as text/markdown.
 * - Accept prefers text/html, or says nothing: the page, with a Link header
 *   naming its twin.
 * - Accept refuses both: 406.
 * Every page response carries Vary: Accept.
 */
import {
  appendVary,
  isPagePath,
  markdownPath,
  preferredType,
  quality,
} from "./negotiate";

type Env = { ASSETS: Fetcher };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (
      (request.method !== "GET" && request.method !== "HEAD") ||
      !isPagePath(url.pathname)
    ) {
      return env.ASSETS.fetch(request);
    }

    const accept = request.headers.get("accept");
    const chosen = preferredType(accept);
    if (chosen === null) {
      return notAcceptable("Available: text/html, text/markdown\n");
    }

    const twin = new URL(url);
    twin.pathname = markdownPath(url.pathname);

    if (chosen === "text/markdown") {
      const md = await env.ASSETS.fetch(new Request(twin, request));
      if (md.status === 200) {
        const res = new Response(md.body, md);
        res.headers.set("Content-Type", "text/markdown; charset=utf-8");
        res.headers.set("Vary", appendVary(res.headers.get("Vary")));
        return res;
      }
      // No twin for this page. HTML is served only if the client still
      // accepts it; "text/markdown, text/html;q=0" does not.
      if (quality(accept, "text/html") === 0) {
        return notAcceptable(
          "This page has no markdown version, and HTML is not acceptable.\n",
        );
      }
    }

    const html = await env.ASSETS.fetch(request);
    const res = new Response(html.body, html);
    res.headers.set("Vary", appendVary(res.headers.get("Vary")));
    if (res.headers.get("content-type")?.includes("text/html")) {
      const head = await env.ASSETS.fetch(
        new Request(twin, { method: "HEAD" }),
      );
      if (head.status === 200) {
        const link = `<${twin.pathname}>; rel="alternate"; type="text/markdown"`;
        const existing = res.headers.get("Link");
        res.headers.set("Link", existing ? `${existing}, ${link}` : link);
      }
    }
    return res;
  },
};

function notAcceptable(body: string) {
  return new Response(`Not Acceptable\n\n${body}`, {
    status: 406,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Vary: "Accept",
    },
  });
}
