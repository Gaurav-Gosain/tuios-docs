import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/article/article-layout";
import {
  blogSource,
  getBlogPageImage,
  getBlogPosts,
  getReadingMinutes,
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

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      type: "article",
      publishedTime: page.data.date,
      images: getBlogPageImage(page).url,
    },
  };
}
