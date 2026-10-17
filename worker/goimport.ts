/**
 * The vanity import paths of the Go libraries, tuios.dev/<name>. Each library
 * is its own Go module in a folder of the tuios repository, so the go-import
 * meta tag names that folder in its fourth field, which the go command reads
 * from Go 1.25 on. A module in a folder is tagged with the folder as a prefix,
 * such as progstatus/v0.1.0.
 *
 * - A request with ?go-get=1 for a library path, or for any package below it,
 *   gets a small HTML page with the go-import and go-source meta tags.
 * - Any other request for those paths is redirected to the library's docs
 *   page, so a person who follows an import path lands on its documentation.
 *
 * The module proxy caches each version it has fetched, so once a version is
 * in proxy.golang.org, only GOPROXY=direct users depend on this answer.
 */

/** The repository that holds every library. */
export const repository = "https://github.com/Gaurav-Gosain/tuios";

/** The host of the import paths. */
export const importHost = "tuios.dev";

/**
 * Each library: the last element of its import path, and the folder in the
 * repository that holds its go.mod. A module path is permanent once
 * published, so an entry is never renamed or removed.
 */
export const LIBRARIES: Readonly<Record<string, { dir: string }>> = {
  progstatus: { dir: "progstatus" },
  shot: { dir: "shot" },
  swatch: { dir: "swatch" },
  vt: { dir: "vt" },
};

/** The library a path belongs to, or null when it is not a library path. */
export function libraryFor(pathname: string): string | null {
  const first = pathname.split("/")[1] ?? "";
  return Object.hasOwn(LIBRARIES, first) ? first : null;
}

/** The meta tags the go command and pkg.go.dev read for a library. */
export function goImportMeta(name: string): string {
  const { dir } = LIBRARIES[name];
  const prefix = `${importHost}/${name}`;
  const tree = `${repository}/tree/main/${dir}`;
  const blob = `${repository}/blob/main/${dir}`;
  return [
    `<meta name="go-import" content="${prefix} git ${repository} ${dir}">`,
    `<meta name="go-source" content="${prefix} ${tree} ${tree}{/dir} ${blob}{/dir}/{file}#L{line}">`,
  ].join("\n");
}

/** The docs page a library path redirects a person to. */
export function docsPath(name: string): string {
  return `/docs/libraries/${name}`;
}

/**
 * The answer for a library path, or null when the request is not for one.
 * Only GET and HEAD are answered: the go command uses GET.
 */
export function goImport(request: Request): Response | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const url = new URL(request.url);
  const name = libraryFor(url.pathname);
  if (name === null) return null;

  if (url.searchParams.get("go-get") === "1") {
    const page = `<!DOCTYPE html>
<html>
<head>
${goImportMeta(name)}
<meta http-equiv="refresh" content="0; url=${docsPath(name)}">
</head>
<body>
<a href="${docsPath(name)}">${importHost}/${name}</a>
</body>
</html>
`;
    return new Response(request.method === "HEAD" ? null : page, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const target = new URL(url);
  target.pathname = docsPath(name);
  target.search = "";
  return Response.redirect(target.toString(), 302);
}
