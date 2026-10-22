import { blogSource, releasesSource, source } from "@/lib/source";

export const dynamic = "force-static";
export const revalidate = false;

// The pages outside the three collections.
const TOP = ["/learn", "/gallery", "/brand", "/in-the-wild"];

/**
 * Every page of the site, as a list of paths. The shell on the 404 page
 * (components/eggs/lost-shell.tsx) loads it to list and open pages. It is a
 * file of its own so the list is not in the payload of every page.
 */
export function GET() {
  const urls = [
    ...source.getPages().map((p) => p.url),
    ...blogSource.getPages().map((p) => p.url),
    ...releasesSource.getPages().map((p) => p.url),
    ...TOP,
  ];
  return Response.json(urls);
}
