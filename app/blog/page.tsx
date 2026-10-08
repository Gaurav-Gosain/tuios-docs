import type { Metadata } from "next";
import { FeedLinks } from "@/components/article/feed-links";
import { PostList, TopicNav } from "@/components/article/post-list";
import { breadcrumbLd, JsonLd, personLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl, feeds } from "@/lib/site";
import { getBlogPosts, getReadingMinutes } from "@/lib/source";

export const metadata: Metadata = pageMetadata({
  title: "Engineering blog",
  description:
    "Notes on building tuios and the tools around it: fuzzing a terminal harness, profiling a renderer, and the diagnoses that turned out to be wrong.",
  path: "/blog",
});

export default async function BlogIndex() {
  const posts = await Promise.all(
    getBlogPosts().map(async (post) => ({
      post,
      minutes: await getReadingMinutes(post),
    })),
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-14 pb-20 md:px-6 md:pt-20">
      <JsonLd
        data={[
          {
            "@type": "Blog",
            name: feeds.blog.title,
            description: metadata.description,
            url: absoluteUrl("/blog"),
            inLanguage: "en",
            author: personLd(),
            blogPost: posts.map(({ post }) => ({
              "@type": "BlogPosting",
              headline: post.data.title,
              url: absoluteUrl(post.url),
              datePublished: post.data.date,
            })),
          },
          breadcrumbLd([
            { name: "tuios", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />
      <header className="mb-12 max-w-2xl">
        <p className="mb-3 font-mono text-fd-primary text-sm">
          {posts.length} posts
        </p>
        <h1 className="font-bold text-3xl text-fd-foreground md:text-4xl">
          Engineering blog
        </h1>
        <p className="mt-4 text-fd-muted-foreground text-lg leading-relaxed">
          How tuios and the tools around it were built, measured and fixed.
          Every number comes from a run you can repeat from the repository.
        </p>
        <FeedLinks rss={feeds.blog.rss} atom={feeds.blog.atom} />
        <TopicNav posts={posts.map(({ post }) => post)} />
      </header>

      <PostList items={posts} />
    </div>
  );
}
