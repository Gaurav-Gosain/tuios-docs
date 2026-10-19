import type { Metadata } from "next";
import { WildViewer } from "@/components/in-the-wild/wild-viewer";
import { breadcrumbLd, JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site";

const description =
  "Videos, articles, newsletters and projects about tuios, picked by the maintainer.";

export const metadata: Metadata = pageMetadata({
  title: "tuios in the wild",
  cardTitle: "tuios in the wild: videos, articles and projects",
  description,
  path: "/in-the-wild",
});

export default function InTheWildPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-24 md:px-6 md:pt-20">
      <JsonLd
        data={[
          {
            "@type": "CollectionPage",
            name: "tuios in the wild",
            description,
            url: absoluteUrl("/in-the-wild"),
            inLanguage: "en",
          },
          breadcrumbLd([
            { name: "tuios", path: "/" },
            { name: "In the wild", path: "/in-the-wild" },
          ]),
        ]}
      />
      <header className="mb-8 max-w-2xl">
        <p className="mb-3 font-mono text-fd-primary text-sm">Mentions</p>
        <h1 className="font-bold text-3xl text-fd-foreground md:text-4xl">
          In the wild
        </h1>
        <p className="mt-4 text-fd-muted-foreground text-lg leading-relaxed">
          Videos, articles, newsletters and projects about tuios. The list below
          is a terminal app running in your browser. Press <kbd>j</kbd> and{" "}
          <kbd>k</kbd> to move, <kbd>/</kbd> to search and <kbd>o</kbd> to open
          a link. Press <kbd>?</kbd> for every key.
        </p>
        <p className="mt-3 text-fd-muted-foreground text-sm leading-relaxed">
          The viewer is{" "}
          <a
            href="https://github.com/Gaurav-Gosain/hearsay"
            target="_blank"
            rel="noopener"
            className="text-fd-foreground underline underline-offset-2"
          >
            hearsay
          </a>
          . The marks you set stay in this browser. Know a mention that is not
          here?{" "}
          <a
            href="https://github.com/Gaurav-Gosain/tuios/issues"
            target="_blank"
            rel="noopener"
            className="text-fd-foreground underline underline-offset-2"
          >
            Open an issue
          </a>
          .
        </p>
      </header>
      <WildViewer />
      <noscript>
        <p className="mt-6 text-fd-muted-foreground">
          This page runs a terminal app and needs JavaScript.
        </p>
      </noscript>
    </div>
  );
}
