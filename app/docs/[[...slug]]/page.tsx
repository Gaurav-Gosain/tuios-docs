import { getPageImage, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from '@/components/layout/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import {
  breadcrumbLd,
  JsonLd,
  personLd,
  publisherLd,
} from '@/components/json-ld';
import { pageMetadata } from '@/lib/metadata';
import { absoluteUrl } from '@/lib/site';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const isIndex = page.slugs.length === 0;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <JsonLd
        data={[
          {
            '@type': 'TechArticle',
            headline: page.data.title,
            description: page.data.description,
            url: absoluteUrl(page.url),
            mainEntityOfPage: absoluteUrl(page.url),
            image: absoluteUrl(getPageImage(page).url),
            inLanguage: 'en',
            author: personLd(),
            publisher: publisherLd,
            isPartOf: {
              '@type': 'WebSite',
              name: 'TUIOS documentation',
              url: absoluteUrl('/docs'),
            },
            about: { '@type': 'SoftwareApplication', name: 'TUIOS' },
          },
          breadcrumbLd([
            { name: 'TUIOS', path: '/' },
            { name: 'Docs', path: '/docs' },
            ...(isIndex ? [] : [{ name: page.data.title, path: page.url }]),
          ]),
        ]}
      />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return pageMetadata({
    title: page.data.title,
    description: page.data.description ?? '',
    path: page.url,
    image: getPageImage(page).url,
    // "Introduction" alone says nothing in a link preview.
    cardTitle:
      page.slugs.length === 0 ? 'TUIOS documentation' : page.data.title,
  });
}
