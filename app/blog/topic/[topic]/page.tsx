import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostList, TopicNav } from "@/components/article/post-list";
import { breadcrumbLd, JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/metadata";
import { getBlogPosts, getReadingMinutes } from "@/lib/source";
import { findTopic, topics } from "@/lib/topics";

export const dynamicParams = false;

export function generateStaticParams() {
  return topics.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic: slug } = await props.params;
  const topic = findTopic(slug);
  if (!topic) notFound();
  return pageMetadata({
    title: `${topic.title}: engineering blog`,
    description: topic.blurb,
    path: `/blog/topic/${topic.slug}`,
  });
}

export default async function TopicPage(props: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await props.params;
  const topic = findTopic(slug);
  if (!topic) notFound();
  const all = getBlogPosts();
  const posts = await Promise.all(
    all
      .filter((post) => post.data.tags.includes(topic.slug))
      .map(async (post) => ({
        post,
        minutes: await getReadingMinutes(post),
      })),
  );
  const path = `/blog/topic/${topic.slug}`;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-14 pb-20 md:px-6 md:pt-20">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "tuios", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: topic.title, path },
          ]),
        ]}
      />
      <header className="mb-12 max-w-2xl">
        <Link
          href="/blog"
          className="group mb-6 inline-flex items-center gap-1.5 font-mono text-fd-muted-foreground text-sm transition-colors hover:text-fd-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          All posts
        </Link>
        <p className="mb-3 font-mono text-fd-primary text-sm">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
        <h1 className="font-bold text-3xl text-fd-foreground md:text-4xl">
          {topic.title}
        </h1>
        <p className="mt-4 text-fd-muted-foreground text-lg leading-relaxed">
          {topic.blurb}
        </p>
        <TopicNav posts={all} current={topic.slug} />
      </header>

      <PostList items={posts} />
    </div>
  );
}
