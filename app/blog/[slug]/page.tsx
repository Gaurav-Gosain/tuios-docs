import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/article/article-layout";
import { postTopics } from "@/components/article/post-list";
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
  const topics = postTopics(page);
  // The post's first tag is its main topic. The section at the end lists up
  // to three other posts on it, those that share more tags first, then the
  // newest. A topic with no other post gives way to the next tag.
  const tags: readonly string[] = page.data.tags;
  const others = posts.filter((p) => p.url !== page.url);
  const main = topics
    .slice()
    .sort((a, b) => tags.indexOf(a.slug) - tags.indexOf(b.slug))
    .find((t) =>
      others.some((p) => (p.data.tags as readonly string[]).includes(t.slug)),
    );
  const related = main
    ? others
        .filter((p) => (p.data.tags as readonly string[]).includes(main.slug))
        .map((p) => ({
          p,
          shared: p.data.tags.filter((t) => tags.includes(t)).length,
        }))
        .sort((a, b) => b.shared - a.shared)
        .slice(0, 3)
        .map(({ p }) => ({
          url: p.url,
          title: p.data.title,
          date: p.data.date,
        }))
    : [];

  return (
    <ArticleLayout
      back={{ href: "/blog", label: "All posts" }}
      eyebrow={
        topics.length > 0 ? (
          <>
            <span className="flex gap-2">
              {topics.map((t) => (
                <Link
                  key={t.slug}
                  href={`/blog/topic/${t.slug}`}
                  className="text-fd-primary underline-offset-4 hover:underline"
                >
                  {t.title}
                </Link>
              ))}
            </span>
            <span aria-hidden="true">·</span>
          </>
        ) : undefined
      }
      title={page.data.title}
      description={page.data.description}
      date={page.data.date}
      author={page.data.author}
      minutes={await getReadingMinutes(page)}
      toc={page.data.toc}
      newer={newer && { url: newer.url, title: newer.data.title }}
      older={older && { url: older.url, title: older.data.title }}
      related={
        main
          ? {
              heading: `More on ${main.title}`,
              href: `/blog/topic/${main.slug}`,
              links: related,
            }
          : undefined
      }
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
            keywords: topics.map((t) => t.title).join(", "),
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
      {/* Long test and function names in inline code must wrap on a phone
          rather than widen the page. */}
      <div className="contents [&_:not(pre)>code]:[overflow-wrap:anywhere]">
        <MDX components={getMDXComponents()} />
      </div>
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
