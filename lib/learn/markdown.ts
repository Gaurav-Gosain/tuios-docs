import { absoluteUrl } from "@/lib/site";
import { sequenceLabel } from "./keys";
import { tracks } from "./tracks";

/**
 * The markdown twin of /learn: every track and its steps as text, for agents
 * and anyone who wants the keys without the page.
 */
export function learnMarkdown() {
  const lines = [
    "# Learn tuios",
    "",
    `URL: ${absoluteUrl("/learn")}`,
    "",
    "> A hands-on tour that runs the real tuios in the browser, with a pretend shell. Each track is a list of steps: press the keys, and the page checks what tuios did.",
  ];
  for (const track of tracks) {
    lines.push(
      "",
      `## ${track.title}`,
      "",
      `${track.blurb} For: ${track.audience}. About ${track.minutes} minutes.`,
      "",
    );
    for (const step of track.steps) {
      const note = step.explainer ? step.explainer.body : (step.note ?? "");
      lines.push(
        `- **${step.title}**: \`${sequenceLabel(step.keys)}\`${note ? `. ${note}` : ""}`,
      );
    }
  }
  return `${lines.join("\n")}\n`;
}
