import { createHash } from "node:crypto";
import type { Code, Root } from "mdast";
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx";
import { SKIP, visit } from "unist-util-visit";

/**
 * The id of a ```mermaid block: a hash of its source. scripts/mermaid.mjs
 * draws each block under this id into lib/mermaid.json, and the page finds
 * the drawing by it. An edit to a block changes the id, so a block nobody
 * drew again fails the build instead of showing an old drawing.
 */
export function mermaidId(source: string): string {
  return createHash("sha256").update(source).digest("hex").slice(0, 12);
}

/**
 * Turns each ```mermaid block into <SketchDiagram id="…">, with the block
 * itself inside for the Source tab. The diagram is drawn by tuios.dev/sketch
 * ahead of time (scripts/mermaid.mjs), so the page ships the SVG and the text
 * drawing and runs no code to draw them.
 */
export function remarkSketchMermaid() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang !== "mermaid" || !parent || index === undefined) return;
      const element: MdxJsxFlowElement = {
        type: "mdxJsxFlowElement",
        name: "SketchDiagram",
        attributes: [
          { type: "mdxJsxAttribute", name: "id", value: mermaidId(node.value) },
        ],
        children: [node],
      };
      parent.children[index] = element;
      return [SKIP, index + 1];
    });
  };
}
