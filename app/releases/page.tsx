import type { Metadata } from "next";
import Link from "next/link";
import { FeedLinks } from "@/components/article/feed-links";
import { ReleaseTag } from "@/components/article/release-tag";
import { breadcrumbLd, JsonLd } from "@/components/json-ld";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl, feeds } from "@/lib/site";
import {
  formatShortDate,
  getReadingMinutes,
  getReleases,
  getReleaseTag,
} from "@/lib/source";

export const metadata: Metadata = pageMetadata({
  title: "Releases",
  description:
    "What changed in each release of tuios, with interactive figures for the fixes.",
  path: "/releases",
});

export default async function ReleasesIndex() {
  const all = getReleases();
  const latestTagged = all.find((release) => getReleaseTag(release));
  const releases = await Promise.all(
    all.map(async (release) => ({
      release,
      tag: getReleaseTag(release),
      minutes: await getReadingMinutes(release),
    })),
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-14 pb-20 md:px-6 md:pt-20">
      <JsonLd
        data={[
          {
            "@type": "CollectionPage",
            name: "tuios releases",
            description: metadata.description,
            url: absoluteUrl("/releases"),
            inLanguage: "en",
            hasPart: releases.map(({ release }) => ({
              "@type": "TechArticle",
              headline: release.data.title,
              url: absoluteUrl(release.url),
              datePublished: release.data.date,
            })),
          },
          breadcrumbLd([
            { name: "tuios", path: "/" },
            { name: "Releases", path: "/releases" },
          ]),
        ]}
      />
      <header className="mb-12 max-w-2xl">
        <p className="mb-3 font-mono text-fd-primary text-sm">
          {latestTagged
            ? `Latest release: ${getReleaseTag(latestTagged)}`
            : "Changelog"}
        </p>
        <h1 className="font-bold text-3xl text-fd-foreground md:text-4xl">
          Releases
        </h1>
        <p className="mt-4 text-fd-muted-foreground text-lg leading-relaxed">
          What shipped in each release, with figures you can try in the page.
          Binaries are on{" "}
          <a
            href="https://github.com/Gaurav-Gosain/tuios/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fd-foreground underline decoration-fd-primary/50 underline-offset-4 hover:decoration-fd-primary"
          >
            GitHub
          </a>
          .
        </p>
        <FeedLinks rss={feeds.releases.rss} atom={feeds.releases.atom} />
      </header>

      <ol className="relative">
        {releases.map(({ release, tag, minutes }, index) => (
          <li
            key={release.url}
            className="relative grid gap-x-8 md:grid-cols-[9rem_1fr]"
          >
            <p className="flex items-center gap-3 pt-1 font-mono text-fd-muted-foreground text-xs md:flex-col md:items-start md:gap-1 md:pt-7">
              <time dateTime={release.data.date}>
                {formatShortDate(release.data.date)}
              </time>
              <span>{minutes} min read</span>
            </p>
            <div className="relative border-fd-border pb-8 pl-6 md:border-l md:pt-6 md:pb-10 max-md:border-l max-md:pt-3">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-4.5 -left-[5px] size-2.5 rounded-full border-2 md:top-8",
                  tag
                    ? "border-fd-primary bg-fd-background"
                    : "border-fd-muted-foreground border-dashed bg-fd-background",
                  index === 0 && "bg-fd-primary",
                )}
              />
              <Link href={release.url} className="group block">
                <ReleaseTag
                  tag={tag}
                  title={release.data.title}
                  latest={latestTagged?.url === release.url}
                  className="mb-3"
                />
                <h2 className="font-semibold text-fd-foreground text-xl leading-snug transition-colors group-hover:text-fd-primary">
                  {release.data.title}
                </h2>
                <p className="mt-2 text-fd-muted-foreground leading-relaxed">
                  {release.data.description}
                </p>
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
