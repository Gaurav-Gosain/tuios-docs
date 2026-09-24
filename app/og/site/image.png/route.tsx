import { ogImage } from "@/lib/og";

export const revalidate = false;

/** The social card for the landing page and any page without its own. */
export function GET() {
  return ogImage({
    kind: "Terminal UI Operating System",
    title: "A terminal window manager that knows what your agents are doing.",
    description:
      "Panes, tiling and nine workspaces inside the terminal you already use, with sessions that keep running when you detach.",
  });
}
