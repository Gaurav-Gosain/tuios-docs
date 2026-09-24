import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/article/article-layout";
import {
  breadcrumbLd,
  JsonLd,
  personLd,
  publisherLd,
} from "@/components/json-ld";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site";
import {
  blogSource,
  getBlogPageImage,
  getBlogPosts,
  getReadingMinutes,
  getWordCount,
} from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = blogSource.getPage([params.slug]);
  if (!page) notFound();

  const MDX = page.data.body;
  const posts = getBlogPosts();
  const index = posts.findIndex((post) => post.url === page.url);
  const newer = index > 0 ? posts[index - 1] : undefined;
  const older = index >= 0 ? posts[index + 1] : undefined;
  const words = await getWordCount(page);

  return (
    <ArticleLayout
      back={{ href: "/blog", label: "All posts" }}
      title={page.data.title}
      description={page.data.description}
      date={page.data.date}
      author={page.data.author}
      minutes={await getReadingMinutes(page)}
      toc={page.data.toc}
      newer={newer && { url: newer.url, title: newer.data.title }}
      older={older && { url: older.url, title: older.data.title }}
    >
      <JsonLd
        data={[
          {
            "@type": "BlogPosting",
            headline: page.data.title,
            description: page.data.description,
            datePublished: page.data.date,
            url: absoluteUrl(page.url),
            mainEntityOfPage: absoluteUrl(page.url),
            image: absoluteUrl(getBlogPageImage(page).url),
            inLanguage: "en",
            wordCount: words,
            author: personLd(page.data.author),
            publisher: publisherLd,
            isPartOf: {
              "@type": "Blog",
              name: "tuios engineering blog",
              url: absoluteUrl("/blog"),
            },
          },
          breadcrumbLd([
            { name: "tuios", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: page.data.title, path: page.url },
          ]),
        ]}
      />
      <MDX components={getMDXComponents()} />
    </ArticleLayout>
  );
}

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slugs[0] }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = blogSource.getPage([params.slug]);
  if (!page) notFound();

  return pageMetadata({
    title: page.data.title,
    description: page.data.description ?? "",
    path: page.url,
    image: getBlogPageImage(page).url,
    article: {
      publishedTime: page.data.date,
      author: page.data.author,
      section: "Engineering blog",
    },
  });
}
