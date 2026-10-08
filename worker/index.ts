/**
 * The Worker that serves the site from Workers static assets and negotiates
 * each page between HTML and its markdown twin, following the
 * acceptmarkdown.com Cloudflare Workers recipe. The build writes both side by
 * side (out/docs/sessions.html and out/docs/sessions.md, see
 * scripts/export-markdown.mjs), and wrangler.jsonc sets run_worker_first so
 * every page, markdown twin and clip request reaches this code before the
 * assets. Other files (chunks, fonts, images) never reach it.
 *
 * - Accept prefers text/markdown: the twin, as text/markdown.
 * - Accept prefers text/html, or says nothing: the page, with a Link header
 *   naming its twin.
 * - Accept refuses both: 406.
 * Every page response carries Vary: Accept.
 *
 * Before any of that, a request to a moved host (tuios.gaurav.zip,
 * www.tuios.dev) gets a 301 to the same path on https://tuios.dev. See
 * redirect.ts. Then a page that moved gets a 301 to its new path (see
 * moved.ts), and a release clip is served from the MEDIA bucket (see
 * media.ts). A page request for its first bytes, which Next's link prefetch
 * sends, gets a 206 with just those bytes (see range.ts).
 */

import { mediaKey, serveMedia } from "./media";
import { movedTo } from "./moved";
import {
  appendVary,
  isPagePath,
  markdownPath,
  preferredType,
  quality,
} from "./negotiate";
import { answerPrefixRange } from "./range";
import { hostRedirect } from "./redirect";

// MEDIA is optional: until the R2 bucket is bound, a clip path falls through
// to the assets, which answer 404, and the page shows the clip's poster.
type Env = { ASSETS: Fetcher; MEDIA?: R2Bucket };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const hostMoved = hostRedirect(request);
    if (hostMoved) return hostMoved;

    const url = new URL(request.url);
    const moved = movedTo(url.pathname);
    if (moved) {
      const target = new URL(url);
      target.pathname = moved;
      return Response.redirect(target.toString(), 301);
    }
    const key = mediaKey(url.pathname);
    if (key && env.MEDIA) return serveMedia(request, env.MEDIA, key);
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

    const html = await env.ASSETS.fetch(htmlAssetRequest(url, request));
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
    // Next's link prefetch asks for the first 64 bytes. See range.ts.
    return answerPrefixRange(request, res);
  },
};

/**
 * The request to hand the assets for a page. With html_handling set to
 * auto-trailing-slash, the assets answer /x.html with a redirect to /x. A URL
 * that names the .html file must serve it as it stands (Google's site
 * verification file is fetched that way and does not follow the redirect), so
 * such a request asks for /x, which the assets resolve to x.html, and the
 * client keeps its URL.
 */
function htmlAssetRequest(url: URL, request: Request) {
  if (!url.pathname.endsWith(".html")) return request;
  const bare = new URL(url);
  bare.pathname = url.pathname.slice(0, -".html".length) || "/";
  if (bare.pathname.endsWith("/index")) {
    bare.pathname = bare.pathname.slice(0, -"index".length);
  }
  return new Request(bare, request);
}

function notAcceptable(body: string) {
  return new Response(`Not Acceptable\n\n${body}`, {
    status: 406,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Vary: "Accept",
    },
  });
}
