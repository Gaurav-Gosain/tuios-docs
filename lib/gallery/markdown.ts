import { absoluteUrl } from "../site";
import { DISCUSSION_URL, FEED_PATH } from "./feed";

/**
 * The /gallery page as markdown, for agents and other tools. The entries
 * change every hour, so the twin names the feed instead of copying it.
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
    `The full list is JSON at ${absoluteUrl(FEED_PATH)}.`,
  ];
  return `${lines.join("\n")}\n`;
}
