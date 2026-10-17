import { MessageSquarePlus } from "lucide-react";
import type { Metadata } from "next";
import { Gallery } from "@/components/gallery/gallery";
import { breadcrumbLd, JsonLd } from "@/components/json-ld";
import { Since } from "@/components/mdx/since";
import { DISCUSSION_URL, parseFeed } from "@/lib/gallery/feed";
import seed from "@/lib/gallery/gallery-seed.json";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site";

const description =
  "Setups that people share for tuios: a screenshot of each, with the config and theme to copy.";

export const metadata: Metadata = pageMetadata({
  title: "Gallery",
  cardTitle: "The tuios gallery: setups from the community",
  description,
  path: "/gallery",
});

export default function GalleryPage() {
  const entries = parseFeed(seed);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-24 md:px-6 md:pt-20">
      <JsonLd
        data={[
          {
            "@type": "CollectionPage",
            name: "tuios gallery",
            description,
            url: absoluteUrl("/gallery"),
            inLanguage: "en",
          },
          breadcrumbLd([
            { name: "tuios", path: "/" },
            { name: "Gallery", path: "/gallery" },
          ]),
        ]}
      />
      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="mb-3 font-mono text-fd-primary text-sm">
            Community setups
          </p>
          <h1 className="font-bold text-3xl text-fd-foreground md:text-4xl">
            Gallery
          </h1>
          <p className="mt-4 text-fd-muted-foreground text-lg leading-relaxed">
            Setups that people share in the tuios discussions. Each entry has a
            screenshot and its config. Run the command on an entry to try its
            look. The command adds the look as a separate file and does not
            change your config.toml.
          </p>
          <p className="mt-3 text-fd-muted-foreground text-sm leading-relaxed">
            Post a screenshot and your config as a comment. Your entry appears
            here after a review. To share without a gallery entry, write{" "}
            <code className="rounded bg-fd-muted px-1 py-0.5 font-mono text-fd-foreground text-xs">
              no gallery
            </code>{" "}
            in your comment.
          </p>
        </div>
        <a
          href={DISCUSSION_URL}
          target="_blank"
          rel="noopener"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-fd-primary px-4 py-2.5 font-medium text-fd-primary-foreground text-sm transition-opacity hover:opacity-90 md:self-auto"
        >
          <MessageSquarePlus className="size-4" />
          Show us your setup
        </a>
      </header>
      <Gallery seed={entries} badge={<Since feature="look-apply" />} />
    </div>
  );
}
