import { absoluteUrl, site } from "@/lib/site";

type Thing = Record<string, unknown>;

/**
 * Structured data for search engines, as a JSON-LD script. The "<" escape
 * keeps a title that contains "</script>" from closing the tag early.
 */
export function JsonLd({ data }: { data: Thing | Thing[] }) {
  const json = JSON.stringify(
    Array.isArray(data)
      ? { "@context": "https://schema.org", "@graph": data }
      : { "@context": "https://schema.org", ...data },
  ).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized JSON with "<" escaped, not markup
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/** A Person for an author name, with a profile link when it is the maintainer. */
export function personLd(name: string = site.author.name) {
  return name === site.author.name
    ? { "@type": "Person", name, url: site.author.url }
    : { "@type": "Person", name };
}

export const publisherLd = {
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl("/brand/mark-512.png"),
  },
} as const;

/** A BreadcrumbList from the home page down to the current page. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
