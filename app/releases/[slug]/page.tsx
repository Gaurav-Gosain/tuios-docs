import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/article/article-layout";
import { ReleaseTag } from "@/components/article/release-tag";
import {
  breadcrumbLd,
  JsonLd,
  personLd,
  publisherLd,
} from "@/components/json-ld";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site";
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
      <JsonLd
        data={[
          {
            "@type": "TechArticle",
            headline: page.data.title,
            description: page.data.description,
            datePublished: page.data.date,
            url: absoluteUrl(page.url),
            mainEntityOfPage: absoluteUrl(page.url),
            image: absoluteUrl(getReleasePageImage(page).url),
            inLanguage: "en",
            author: personLd(page.data.author),
            publisher: publisherLd,
            about: {
              "@type": "SoftwareApplication",
              name: "TUIOS",
              ...(tag ? { softwareVersion: tag.replace(/^v/, "") } : {}),
            },
          },
          breadcrumbLd([
            { name: "TUIOS", path: "/" },
            { name: "Releases", path: "/releases" },
            { name: page.data.title, path: page.url },
          ]),
        ]}
      />
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

  return pageMetadata({
    title: page.data.title,
    description: page.data.description ?? "",
    path: page.url,
    image: getReleasePageImage(page).url,
    article: {
      publishedTime: page.data.date,
      author: page.data.author,
      section: "Releases",
    },
  });
}
