import { notFound } from "next/navigation";
import { ogImage } from "@/lib/og";
import {
  blogSource,
  formatPostDate,
  getBlogPageImage,
  getBlogPosts,
} from "@/lib/source";

export const revalidate = false;

export async function GET(
  _req: Request,
  props: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await props.params;
  const page = blogSource.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return ogImage({
    kind: "Blog",
    title: page.data.title,
    description: page.data.description,
    footer: `${page.data.author}, ${formatPostDate(page.data.date)}`,
  });
}

export function generateStaticParams() {
  return getBlogPosts().map((page) => ({
    slug: getBlogPageImage(page).segments,
  }));
}
