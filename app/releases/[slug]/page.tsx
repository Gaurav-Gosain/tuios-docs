import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/article/article-layout";
import { ReleaseTag } from "@/components/article/release-tag";
import {
  getReadingMinutes,
  getReleasePageImage,
  getReleases,
  getReleaseTag,
  releasesSource,
} from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = releasesSource.getPage([params.slug]);
  if (!page) notFound();

  const MDX = page.data.body;
  const releases = getReleases();
  const index = releases.findIndex((release) => release.url === page.url);
  const newer = index > 0 ? releases[index - 1] : undefined;
  const older = index >= 0 ? releases[index + 1] : undefined;
  const tag = getReleaseTag(page);
  const latestTagged = releases.find((release) => getReleaseTag(release));

  return (
    <ArticleLayout
      back={{ href: "/releases", label: "All releases" }}
      title={page.data.title}
      description={page.data.description}
      date={page.data.date}
      author={page.data.author}
      minutes={await getReadingMinutes(page)}
      toc={page.data.toc}
      eyebrow={
        <ReleaseTag
          tag={tag}
          title={page.data.title}
          latest={latestTagged?.url === page.url}
        />
      }
      newer={newer && { url: newer.url, title: newer.data.title }}
      older={older && { url: older.url, title: older.data.title }}
    >
      <MDX components={getMDXComponents()} />
    </ArticleLayout>
  );
}

export function generateStaticParams() {
  return getReleases().map((release) => ({ slug: release.slugs[0] }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = releasesSource.getPage([params.slug]);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      type: "article",
      publishedTime: page.data.date,
      images: getReleasePageImage(page).url,
    },
  };
}
