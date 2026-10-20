/**
 * Cleans an SVG from sketch before it goes into the page.
 *
 * sketch writes inert SVG and has tests that hold it to that. The playground
 * still treats each drawing as hostile, because a share link puts someone
 * else's Mermaid on tuios.dev. The SVG is parsed as XML into a document that
 * runs nothing, and a new tree is built from it with only what is on the
 * lists below. Anything else is left out: an element not on the list, with
 * its children; an attribute not on the list; an event attribute; a link; an
 * image; a style value that loads or runs anything.
 *
 * The lists are what sketch writes for the eight types it draws. They come
 * from pele's documentation corpus as sketch draws it
 * (sketch/testdata/golden) and from the element and attribute names in the
 * sketch source. sketch draws no links or images in the playground
 * (cmd/sketch-wasm turns them off), so <a> keeps only its children, and
 * <image> goes.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

/** Elements kept, with their children. */
const ELEMENTS = new Set([
  "svg",
  "g",
  "path",
  "rect",
  "circle",
  "ellipse",
  "polygon",
  "text",
  "tspan",
  "title",
  "desc",
]);

/** Elements dropped, but their children kept. */
const UNWRAP = new Set(["a"]);

/** Attributes kept on any kept element. */
const ATTRIBUTES = new Set([
  "aria-describedby",
  "aria-labelledby",
  "aria-roledescription",
  "class",
  "cx",
  "cy",
  "d",
  "data-icon",
  "data-id",
  "fill",
  "fill-opacity",
  "font-size",
  "font-style",
  "font-weight",
  "height",
  "id",
  "opacity",
  "points",
  "r",
  "role",
  "rx",
  "ry",
  "stroke",
  "stroke-dasharray",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-width",
  "style",
  "text-anchor",
  "transform",
  "viewBox",
  "width",
  "x",
  "y",
]);

/** Properties kept in a style attribute. */
const STYLE_PROPERTIES = new Set([
  "color",
  "direction",
  "fill",
  "fill-opacity",
  "font",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "height",
  "letter-spacing",
  "max-width",
  "opacity",
  "rx",
  "ry",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-opacity",
  "stroke-width",
  "text-transform",
  "word-spacing",
]);

/** A value that could load or run something. */
const UNSAFE_VALUE =
  /url\s*\(|expression\s*\(|javascript:|vbscript:|data:|@import|\\|<|>|image-set|-moz-binding|behavior/i;

/** A presentation attribute value that names something to fetch. */
const UNSAFE_ATTR = /url\s*\(|javascript:|data:/i;

function cleanStyle(style: string): string {
  const out: string[] = [];
  for (const decl of style.split(";")) {
    const at = decl.indexOf(":");
    if (at < 0) continue;
    const prop = decl.slice(0, at).trim().toLowerCase();
    const value = decl.slice(at + 1).trim();
    if (!value || UNSAFE_VALUE.test(value)) continue;
    // sketch's own custom properties: --_x and the --pele-* theme tokens.
    const custom = /^--(_[a-z]+|pele-[a-z0-9-]+)$/.test(prop);
    if (!custom && !STYLE_PROPERTIES.has(prop)) continue;
    out.push(`${prop}:${value}`);
  }
  return out.join(";");
}

function copy(from: Element, into: Element, doc: Document, depth: number) {
  if (depth > 64) return;
  for (const child of from.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      into.appendChild(doc.createTextNode(child.textContent ?? ""));
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const el = child as Element;
    if (el.namespaceURI !== SVG_NS) continue;
    const name = el.localName;
    if (UNWRAP.has(name)) {
      copy(el, into, doc, depth + 1);
      continue;
    }
    if (!ELEMENTS.has(name)) continue;
    const clean = doc.createElementNS(SVG_NS, name);
    copyAttributes(el, clean);
    copy(el, clean, doc, depth + 1);
    into.appendChild(clean);
  }
}

function copyAttributes(from: Element, to: Element) {
  let preserve = false;
  for (const attr of from.attributes) {
    // Namespaced attributes (xlink:href, xml:space) are left out. sketch
    // writes xml:space="preserve" on text; white-space: pre keeps its spaces.
    if (attr.namespaceURI) {
      preserve ||= attr.localName === "space" && attr.value === "preserve";
      continue;
    }
    const name = attr.name.toLowerCase();
    // Matched by its exact name: SVG names are case-sensitive (viewBox).
    if (!ATTRIBUTES.has(attr.name) || name.startsWith("on")) continue;
    if (name === "style") {
      const style = cleanStyle(attr.value);
      if (style) to.setAttribute("style", style);
      continue;
    }
    if (UNSAFE_ATTR.test(attr.value)) continue;
    to.setAttribute(attr.name, attr.value);
  }
  if (preserve) (to as SVGElement).style.whiteSpace = "pre";
}

/**
 * The SVG in source, cleaned, as an element of doc, or null when source is
 * not one SVG document.
 */
export function sanitizeSvg(
  source: string,
  doc: Document = document,
): SVGSVGElement | null {
  const parsed = new DOMParser().parseFromString(source, "image/svg+xml");
  const root = parsed.documentElement;
  if (
    !root ||
    root.localName !== "svg" ||
    root.namespaceURI !== SVG_NS ||
    parsed.getElementsByTagName("parsererror").length > 0
  ) {
    return null;
  }
  const svg = doc.createElementNS(SVG_NS, "svg") as SVGSVGElement;
  copyAttributes(root, svg);
  copy(root, svg, doc, 0);
  return svg;
}
