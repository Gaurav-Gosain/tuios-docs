/**
 * The short look links of the gallery. `tuios look apply tuios.dev/r/<id>`
 * downloads /r/<id>.toml, and a person who opens /r/<id> in a browser lands
 * on the entry's card.
 *
 *   /r/<digits>.toml  -> MEDIA gallery/look/<digits>.toml (the sync writes it)
 *   /r/<name>.toml    -> the asset /gallery-seed/<name>.look.toml (a seed)
 *   /r/<id>           -> 302 to /gallery#look-<id>
 *
 * Only these generated files are reachable, and only by an id of the shape
 * the sync and the seed script give: a comment ID of digits, or a seed name
 * that starts with a letter. Anything else under /r/ is a 404. The file is
 * served as plain text with nosniff, whatever the bucket or the assets say
 * its type is.
 */

import type { MediaBucket } from "./media";

const LOOK_CACHE = "public, max-age=300";

export type LookRoute =
  | { kind: "bucket"; key: string }
  | { kind: "asset"; path: string }
  | { kind: "card"; id: string }
  | { kind: "missing" };

/** The route of a /r/ path, or null when the path is not under /r/. */
export function lookRoute(pathname: string): LookRoute | null {
  if (!pathname.startsWith("/r/")) return null;
  const rest = pathname.slice(3);
  const file = /^(\d{1,12}|[a-z][a-z0-9-]{0,39})\.toml$/.exec(rest);
  if (file) {
    const id = file[1];
    return /^\d+$/.test(id)
      ? { kind: "bucket", key: `gallery/look/${id}.toml` }
      : { kind: "asset", path: `/gallery-seed/${id}.look.toml` };
  }
  const card = /^(\d{1,12}|[a-z][a-z0-9-]{0,39})$/.exec(rest);
  if (card) return { kind: "card", id: card[1] };
  return { kind: "missing" };
}

function textHeaders(cache: string) {
  return new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": cache,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'",
  });
}

function notFound() {
  return new Response("Not Found\n", {
    status: 404,
    headers: textHeaders("public, max-age=60"),
  });
}

/** Answers a /r/ request. */
export async function serveLook(
  request: Request,
  route: LookRoute,
  env: { ASSETS: Fetcher; MEDIA?: MediaBucket },
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed\n", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }
  if (route.kind === "missing") return notFound();
  if (route.kind === "card") {
    const target = new URL(request.url);
    target.pathname = "/gallery";
    target.search = "";
    target.hash = `look-${route.id}`;
    return Response.redirect(target.toString(), 302);
  }
  let body: string | null = null;
  if (route.kind === "bucket") {
    if (!env.MEDIA) return notFound();
    const found = await env.MEDIA.get(route.key);
    if (found && "body" in found) body = await new Response(found.body).text();
  } else {
    const asset = new URL(request.url);
    asset.pathname = route.path;
    asset.search = "";
    const res = await env.ASSETS.fetch(new Request(asset, { method: "GET" }));
    if (res.status === 200) body = await res.text();
  }
  if (body === null) return notFound();
  const headers = textHeaders(LOOK_CACHE);
  if (request.method === "HEAD") {
    headers.set(
      "Content-Length",
      String(new TextEncoder().encode(body).length),
    );
    return new Response(null, { headers });
  }
  return new Response(body, { headers });
}
