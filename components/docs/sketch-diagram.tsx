import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import type { ReactNode } from "react";
import { SketchAnchor } from "@/components/docs/sketch-anchor";
import {
  type Drawing,
  SketchTextDrawing,
} from "@/components/docs/sketch-gallery";
import diagrams from "@/lib/mermaid.json";

type Picture = { w: number; h: number; svg: string };

type Entry = {
  type: string;
  wide: Picture;
  narrow?: Picture;
  text: Omit<Drawing, "title">;
};

const all = diagrams as unknown as Record<string, Entry>;

// Under this share of the wide layout's width, the narrow layout shows
// instead: the wide one would draw its text at less than 70% of its size.
const SWITCH = 0.7;

/**
 * A ```mermaid block of a page, drawn by tuios.dev/sketch. The remark plugin
 * in lib/remark-sketch-mermaid.ts puts each block in one of these, and
 * scripts/mermaid.mjs draws it ahead of the build into lib/mermaid.json. The
 * page ships the SVG and runs no code to draw it.
 *
 * The SVG takes its colours from the --pele-* tokens that app/global.css sets
 * from the site theme. A diagram can carry a second layout for a narrow
 * column, where a flowchart that runs across turns to run down; a container
 * query picks it, so the choice is made before the first paint.
 *
 * The Picture, Text and Source tabs share their group with the sketch
 * gallery, and the panels share one grid cell, so a switch moves nothing on
 * the page (see .sk-tabs in app/global.css).
 *
 * children is the block itself, for the Source tab.
 */
export function SketchDiagram({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const d = all[id];
  if (!d) {
    throw new Error(
      `A mermaid block (id ${id}) has no drawing. Run bun run mermaid.`,
    );
  }
  const scope = `skd-${id}`;
  const svg = (p: Picture, className: string) => (
    <div
      className={className}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sketch drew this SVG at build time from a block in this repository's own MDX, never from reader input.
      dangerouslySetInnerHTML={{ __html: p.svg }}
    />
  );
  return (
    <Tabs
      groupId="sketch-view"
      persist
      items={["Picture", "Text", "Source"]}
      className="sk-tabs"
    >
      <Tab>
        <figure className="skd not-prose my-0 min-w-0" data-skd={scope}>
          {d.narrow ? (
            <style>{`@container skd (max-width: ${Math.floor(d.wide.w * SWITCH)}px) { [data-skd="${scope}"] .skd-wide { display: none; } [data-skd="${scope}"] .skd-narrow { display: block; } }`}</style>
          ) : null}
          {svg(d.wide, "skd-wide")}
          {d.narrow ? svg(d.narrow, "skd-narrow") : null}
        </figure>
      </Tab>
      <Tab>
        <SketchTextDrawing
          drawing={d.text}
          scope={`sk-m${id}`}
          label="The diagram as text"
          note
        />
      </Tab>
      <Tab className="sk-source">{children}</Tab>
      <SketchAnchor />
    </Tabs>
  );
}
