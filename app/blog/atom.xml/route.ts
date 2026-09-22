import { renderAtom } from "@/lib/feed";
import { getBlogFeed } from "@/lib/feeds";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  return new Response(renderAtom(await getBlogFeed("atom")), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
