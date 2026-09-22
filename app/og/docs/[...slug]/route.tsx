import { notFound } from "next/navigation";
import { ogImage } from "@/lib/og";
import { getPageImage, source } from "@/lib/source";

export const revalidate = false;

export async function GET(
  _req: Request,
  props: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await props.params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return ogImage({
    kind: "Docs",
    title: page.data.title,
    description: page.data.description,
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
