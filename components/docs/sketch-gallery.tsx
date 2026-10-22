import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import type { CSSProperties, ReactNode } from "react";
import { LibShot } from "@/components/docs/lib-shot";
import { SketchAnchor } from "@/components/docs/sketch-anchor";
import shots from "@/lib/libshots.json";
import drawings from "@/lib/sketch-text.json";

/**
 * A run of one style in a text drawing: the ANSI colour (-1 is the default
 * text colour, else 0 to 15), 1 for bold, the text, and the ANSI colour of
 * the cell ground when there is one.
 */
type Run = [number, number, string] | [number, number, string, number];

type Drawing = {
  title: string;
  cols: number;
  rows: number;
  wide: boolean;
  lines: Run[][];
};

const all = drawings as unknown as Record<string, Drawing>;

// The characters that every common mono face draws at one cell: Latin,
// punctuation, arrows, box drawing and shapes. Any other character can come
// from a fallback face with another advance, so it is boxed to its cell
// width and the columns stay in line.
const covered =
  /^[ -\u00ff\u0131\u0152\u0153\u2000-\u206f\u2190-\u21ff\u2500-\u257f\u25a0-\u25ff]$/u;

// East Asian wide and fullwidth characters take two cells, as sketch/text
// counts them.
const wide =
  /^[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꀀ-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦\u{1f300}-\u{1faff}\u{20000}-\u{3fffd}]$/u;

// Block elements (U+2580 to U+259F), the diagonals ╱ ╲ ╳ and braille are
// drawn by the page, not by the font: a font draws each one as its own glyph, and the edges of
// glyphs side by side leave seams, while a face that lacks them takes them
// from a fallback face of another width. A run of one block is one box with
// a background, as wide as the run and as tall as the line, so blocks meet
// across cells and from line to line. The characters stay in the box, clear,
// so the drawing still copies as text.
const isBlock = (cp: number) =>
  (cp >= 0x2580 && cp <= 0x259f) || (cp >= 0x2571 && cp <= 0x2573);
const isBraille = (cp: number) => cp > 0x2800 && cp <= 0x28ff;

// The dots of a braille cell by bit: column, row.
const brailleDots: [number, number][] = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 1],
  [1, 2],
  [0, 3],
  [1, 3],
];

// braille is the background of a braille cell: a round dot for each bit.
function braille(cp: number): CSSProperties {
  const layers: string[] = [];
  const bits = cp - 0x2800;
  for (let b = 0; b < 8; b++) {
    if (bits & (1 << b)) {
      const [x, y] = brailleDots[b];
      layers.push(
        `radial-gradient(circle at ${x ? 72 : 28}% ${12.5 + y * 25}%, var(--sk-c) 0.12em, transparent 0.135em)`,
      );
    }
  }
  return { backgroundImage: layers.join(",") };
}

function cells(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const chars = Array.from(text);
  let plain = "";
  let i = 0;
  // A run of plain text is a box as wide as its cells too: a face whose
  // advance is not exactly 1ch would move every cell after it off the grid.
  const flush = () => {
    if (plain) {
      out.push(
        <span
          key={`${key}-${i++}`}
          className="sk-t"
          style={{ width: `${Array.from(plain).length}ch` }}
        >
          {plain}
        </span>,
      );
      plain = "";
    }
  };
  for (let k = 0; k < chars.length; k++) {
    const ch = chars[k];
    const cp = ch.codePointAt(0) ?? 0;
    if (isBlock(cp)) {
      // A run of the same block, or one quadrant: its layers are placed in
      // one cell.
      let n = 1;
      if (cp < 0x2596) {
        while (chars[k + n] === ch) n++;
      }
      flush();
      out.push(
        <span
          key={`${key}-${i++}`}
          className={`sk-k sk-k${cp.toString(16)}`}
          style={{ width: `${n}ch` }}
        >
          {ch.repeat(n)}
        </span>,
      );
      k += n - 1;
      continue;
    }
    if (isBraille(cp)) {
      flush();
      out.push(
        <span key={`${key}-${i++}`} className="sk-k" style={braille(cp)}>
          {ch}
        </span>,
      );
      continue;
    }
    if (covered.test(ch)) {
      plain += ch;
      continue;
    }
    flush();
    out.push(
      <span key={`${key}-${i++}`} className={wide.test(ch) ? "sk-c2" : "sk-c1"}>
        {ch}
      </span>,
    );
  }
  flush();
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
              {line.map(([fg, bold, text, bg], x) => {
                const k = `${y}-${x}`;
                const cls = [
                  fg >= 0 ? `sk-${fg}` : "",
                  bold ? "sk-b" : "",
                  bg !== undefined && bg >= 0 ? `sk-g${bg}` : "",
                ]
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
 * picks Text sees every diagram as text, and the choice is kept. The panels
 * share one grid cell, so a figure is as tall as the taller of its picture
 * and its text drawing whichever tab shows, and a switch moves nothing on
 * the page. The source scrolls inside that height.
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
      <SketchAnchor />
    </Tabs>
  );
}
