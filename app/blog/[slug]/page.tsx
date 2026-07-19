import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  blogSource,
  formatPostDate,
  getBlogPageImage,
  getBlogPosts,
} from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = blogSource.getPage([params.slug]);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Link
        href="/blog"
        className="text-fd-muted-foreground text-sm no-underline hover:text-fd-foreground"
      >
        Back to the blog
      </Link>

      <header className="mt-6 mb-10 border-fd-border border-b pb-8">
        <h1 className="mb-3 font-bold text-3xl text-fd-foreground md:text-4xl">
          {page.data.title}
        </h1>
        <p className="mb-4 text-base text-fd-muted-foreground leading-relaxed">
          {page.data.description}
        </p>
        <p className="m-0 text-fd-muted-foreground text-sm">
          {page.data.author}
          <span aria-hidden="true"> / </span>
          <time dateTime={page.data.date}>
            {formatPostDate(page.data.date)}
          </time>
        </p>
      </header>

      <div className="prose">
        <MDX components={getMDXComponents()} />
      </div>
    </main>
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
