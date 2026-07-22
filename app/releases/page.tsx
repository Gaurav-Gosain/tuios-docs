import type { Metadata } from "next";
import Link from "next/link";
import { formatPostDate, getReleases } from "@/lib/source";

export const metadata: Metadata = {
  title: "Releases",
  description:
    "What changed in each tagged release of TUIOS, with the interactive figures that show the fixes rather than describe them.",
};

export default function ReleasesIndex() {
  const releases = getReleases();

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
      <header className="mb-12">
        <h1 className="mb-4 font-bold text-3xl text-fd-foreground md:text-4xl">
          Releases
        </h1>
        <p className="text-base text-fd-muted-foreground leading-relaxed">
          What shipped in each release, written up with figures you can poke at.
          Every claim here maps to a change on main.
        </p>
      </header>

      <ul className="flex list-none flex-col gap-4 p-0">
        {releases.map((release) => (
          <li key={release.url}>
            <Link
              href={release.url}
              className="block rounded-lg border border-fd-border bg-fd-card p-6 no-underline transition-colors hover:border-fd-primary/50 hover:bg-fd-accent/40 focus-visible:outline-2 focus-visible:outline-fd-primary focus-visible:outline-offset-2"
            >
              <time
                dateTime={release.data.date}
                className="text-fd-muted-foreground text-xs uppercase tracking-wide"
              >
                {formatPostDate(release.data.date)}
              </time>
              <h2 className="mt-2 mb-2 font-semibold text-fd-foreground text-xl">
                {release.data.title}
              </h2>
              <p className="m-0 text-fd-muted-foreground text-sm leading-relaxed">
                {release.data.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
