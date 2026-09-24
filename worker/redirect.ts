/**
 * The site moved from tuios.gaurav.zip to tuios.dev. Both hosts, and
 * www.tuios.dev, are custom domains on this Worker, and every request to a
 * host other than the canonical one is answered here with a permanent
 * redirect to the same path and query on the canonical origin. Nothing is
 * excluded: pages, their .md and .txt twins, feeds, the sitemap, robots.txt,
 * llms.txt, OG images and the /learn engine all move, so an old link of any
 * kind lands on the same resource.
 *
 * Plain http on the canonical host is redirected to https the same way, since
 * the tuios.dev zone does not force https on its own.
 *
 * Hosts that are not listed, such as localhost under wrangler dev, are served
 * as they are.
 */
import { site } from "../lib/site";

/** The origin every other host redirects to, such as https://tuios.dev. */
export const canonicalOrigin = new URL(site.url).origin;

const canonicalHost = new URL(site.url).hostname;

/** Hosts that answer only with a redirect to the canonical origin. */
export const redirectHosts: ReadonlySet<string> = new Set([
  "tuios.gaurav.zip",
  "www.tuios.dev",
]);

/**
 * The permanent redirect for a request to a moved host or for plain http on
 * the canonical host, or null when the Worker should serve the request.
 */
export function hostRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const moved = redirectHosts.has(host);
  const insecure = host === canonicalHost && url.protocol === "http:";
  if (!moved && !insecure) return null;
  const target = `${canonicalOrigin}${url.pathname}${url.search}`;
  return new Response(null, {
    status: 301,
    headers: {
      Location: target,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
