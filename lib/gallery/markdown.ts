import { absoluteUrl } from "../site";
import { DISCUSSION_URL, FEED_PATH, parseFeed } from "./feed";
import seed from "./gallery-seed.json";

/**
 * The /gallery page as markdown, for agents and other tools. It lists the
 * seed entries, which ship with the site. The synced entries change every
 * hour, so the twin names the feed instead of copying it.
 */
export function galleryMarkdown(): string {
  const lines = [
    "# Gallery",
    "",
    `URL: ${absoluteUrl("/gallery")}`,
    "",
    "> Setups that people share for tuios: a screenshot of each, with the config and theme to copy.",
    "",
    `To add your setup, post a screenshot and your config as a comment on ${DISCUSSION_URL}. Your entry appears after a review. To share without a gallery entry, write "no gallery" in your comment.`,
    "",
    `The full list, with the entries from the discussion, is JSON at ${absoluteUrl(FEED_PATH)}.`,
  ];
  for (const entry of parseFeed(seed)) {
    lines.push("", `## @${entry.login}: ${entry.title ?? entry.id}`, "");
    lines.push(`Screenshot: ${absoluteUrl(entry.full)}`);
    for (const file of entry.files) {
      lines.push("", `${file.label}:`, "", "~~~~", file.text, "~~~~");
    }
  }
  return `${lines.join("\n")}\n`;
}
