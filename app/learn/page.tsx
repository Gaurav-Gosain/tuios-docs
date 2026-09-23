import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { LearnApp } from "@/components/learn/learn-app";
import { tracks } from "@/lib/learn/tracks";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl, site } from "@/lib/site";

const description =
  "A hands-on tour of tuios that runs in your browser: the real app, a pretend shell, and keys you press yourself. Tracks for beginners and tmux users. Nothing to install.";

export const metadata: Metadata = pageMetadata({
  title: "Learn tuios in 5 minutes",
  cardTitle: "Learn tuios in 5 minutes, in your browser",
  description,
  path: "/learn",
  image: "/og/learn/image.png",
});

export default function LearnPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@type": "Course",
            name: "Learn tuios",
            description,
            url: absoluteUrl("/learn"),
            inLanguage: "en",
            isAccessibleForFree: true,
            provider: {
              "@type": "Organization",
              name: site.name,
              url: site.url,
            },
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "online",
              courseWorkload: "PT5M",
            },
            hasPart: tracks.map((t) => ({
              "@type": "LearningResource",
              name: t.title,
              description: t.blurb,
              timeRequired: `PT${t.minutes}M`,
            })),
          },
        ]}
      />
      <LearnApp />
      <noscript>
        <p className="mx-auto max-w-xl px-4 py-10 text-center">
          Learn tuios runs the real app in your browser and needs JavaScript.
          The <a href="/docs/getting-started">getting started guide</a> covers
          the same ground.
        </p>
      </noscript>
    </>
  );
}
