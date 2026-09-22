import { notFound } from "next/navigation";
import { ogImage } from "@/lib/og";
import {
  formatPostDate,
  getReleasePageImage,
  getReleases,
  releasesSource,
} from "@/lib/source";

export const revalidate = false;

export async function GET(
  _req: Request,
  props: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await props.params;
  const page = releasesSource.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return ogImage({
    kind: "Release notes",
    title: page.data.title,
    description: page.data.description,
    footer: formatPostDate(page.data.date),
  });
}

export function generateStaticParams() {
  return getReleases().map((page) => ({
    slug: getReleasePageImage(page).segments,
  }));
}
