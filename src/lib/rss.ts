import { Feed } from "feed";
import { source } from "@/lib/source";

const baseUrl = "https://tuios.gaurav.zip";

export function getRSS() {
  const feed = new Feed({
    title: "TUIOS Documentation",
    id: `${baseUrl}/docs`,
    link: `${baseUrl}/docs`,
    language: "en",
    copyright: "All rights reserved 2025, Gaurav Gosain",
    description: "A modern terminal window manager with vim-like controls",
  });

  for (const page of source.getPages()) {
    feed.addItem({
      id: page.url,
      title: page.data.title,
      description: page.data.description,
      link: `${baseUrl}${page.url}`,
      date: new Date(page.data.lastModified ?? Date.now()),

      author: [
        {
          name: "Gaurav Gosain",
        },
      ],
    });
  }

  return feed.rss2();
}
