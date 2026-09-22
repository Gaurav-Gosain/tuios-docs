import { renderRss } from "@/lib/feed";
import { getBlogFeed } from "@/lib/feeds";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  return new Response(renderRss(await getBlogFeed("rss")), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
