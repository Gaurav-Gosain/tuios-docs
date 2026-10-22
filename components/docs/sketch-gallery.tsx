import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import type { CSSProperties, ReactNode } from "react";
import { LibShot } from "@/components/docs/lib-shot";
import shots from "@/lib/libshots.json";
import drawings from "@/lib/sketch-text.json";

/**
 * A run of one style in a text drawing: the ANSI colour (-1 is the default
 * text colour, else 0 to 15), 1 for bold, and the text.
 */
type Run = [number, number, string];

type Drawing = {
  title: string;
  cols: number;
  rows: number;
  wide: boolean;
  lines: Run[][];
};

const all = drawings as unknown as Record<string, Drawing>;

// The characters that every common mono face draws at one cell: Latin,
// punctuation, arrows, box drawing, blocks and shapes. Any other character can
// come from a fallback face with another advance, such as braille in a line
// chart, so it is boxed to its cell width and the columns stay in line.
const covered = /^[ -ÿıŒœ -⁯←-⇿─-◿]$/u;

// East Asian wide and fullwidth characters take two cells, as sketch/text
// counts them.
const wide =
  /^[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꀀ-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦\u{1f300}-\u{1faff}\u{20000}-\u{3fffd}]$/u;

function cells(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let plain = "";
  let i = 0;
  for (const ch of text) {
    if (covered.test(ch)) {
      plain += ch;
      continue;
    }
    if (plain) {
      out.push(plain);
      plain = "";
    }
    out.push(
      <span key={`${key}-${i++}`} className={wide.test(ch) ? "sk-c2" : "sk-c1"}>
        {ch}
      </span>,
    );
  }
  if (plain) out.push(plain);
  return out;
}

/**
 * The text drawing of a gallery diagram, as `tuios mermaid --format text`
 * prints it. scripts/gen-library-shots.sh writes the drawings into
 * lib/sketch-text.json with the pinned sketch. The colours are the 16 ANSI
 * colours sketch/text writes, shown in the site's terminal palette. The text
 * is real text: a reader can select and copy it.
 */
export function SketchText({
  id,
  label,
  note = false,
}: {
  id: string;
  label?: string;
  note?: boolean;
}) {
  const d = all[id];
  if (!d) {
    throw new Error(
      `<SketchText id="${id}" />: no such drawing. Run scripts/gen-library-shots.sh sketch.`,
    );
  }
  // The width at which the drawing fits at full size: its columns at the
  // widest mono advance in the font stack (0.62 em) at 12.5 px, plus the
  // padding. Under it the drawing shrinks to fit, and the Full size toggle
  // shows. Over it the toggle would change nothing, so it hides.
  const fits = Math.ceil(d.cols * 0.62 * 12.5 + 32);
  const scope = `sk-${id.replace(/[^a-z0-9-]/gi, "")}`;
  return (
    <div className="sk-wrap not-prose min-w-0" data-sk={scope}>
      <style>{`@container sk (min-width: ${fits}px) { [data-sk="${scope}"] .sk-full { display: none; } }`}</style>
      <section
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a region that scrolls must be reachable by keyboard
        tabIndex={0}
        aria-label={label ?? `${d.title} as text`}
        className="sk-text overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
        style={{ "--sk-cols": d.cols } as CSSProperties}
      >
        <label className="sk-full">
          <input type="checkbox" />
          Full size
        </label>
        <pre style={{ minWidth: `${d.cols}ch` }}>
          {d.lines.map((line, y) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: the lines are fixed at build time
            <span key={y} className="sk-line">
              {line.map(([fg, bold, text], x) => {
                const k = `${y}-${x}`;
                const cls = [fg >= 0 ? `sk-${fg}` : "", bold ? "sk-b" : ""]
                  .filter(Boolean)
                  .join(" ");
                return cls ? (
                  <span key={k} className={cls}>
                    {cells(text, k)}
                  </span>
                ) : (
                  <span key={k}>{cells(text, k)}</span>
                );
              })}
              {"\n"}
            </span>
          ))}
        </pre>
      </section>
      {note ? (
        <p className="sk-note">
          {d.wide
            ? `${d.cols} columns, ${d.rows} rows. No layout fits in 80 columns, so it is drawn at its full width. It shrinks to fit the page. Select Full size to read it at full size.`
            : `${d.cols} columns, ${d.rows} rows, drawn for 80 columns.`}
        </p>
      ) : null}
    </div>
  );
}

/**
 * One diagram type of the gallery: the picture, the text drawing and the
 * source, in tabs. All the tabs on a page share one group, so a reader who
 * picks Text sees every diagram as text, and the choice is kept.
 *
 * children is the source, as an <include> of
 * tools/libshots/snippets/sketch-types/ID.mmd.
 */
export function SketchType({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const name = `sketch/types/${id}`;
  const entry = (shots as Record<string, { alt?: string; title?: string }>)[
    name
  ];
  if (!entry) {
    throw new Error(`<SketchType id="${id}" />: no picture ${name}.`);
  }
  return (
    <Tabs
      groupId="sketch-view"
      persist
      items={["Picture", "Text", "Source"]}
      className="sk-tabs"
    >
      <Tab>
        <LibShot
          name={name}
          alt={entry.alt ?? entry.title ?? id}
          className="my-0"
        />
      </Tab>
      <Tab>
        <SketchText id={id} note />
      </Tab>
      <Tab className="sk-source">{children}</Tab>
    </Tabs>
  );
}
