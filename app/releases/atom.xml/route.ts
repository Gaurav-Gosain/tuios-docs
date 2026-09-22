import { renderAtom } from "@/lib/feed";
import { getReleasesFeed } from "@/lib/feeds";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  return new Response(renderAtom(await getReleasesFeed("atom")), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
