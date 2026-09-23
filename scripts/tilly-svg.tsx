// Writes public/learn/tilly.svg from the Tilly component, so the file other
// tools use (the launch videos, slides) is the same drawing as the page.
//
//   bun scripts/tilly-svg.tsx
//
// The file has ids on its layers (tilly-body, tilly-eyes-open, tilly-arm-left
// and so on) and carries the idle animations: the bob, the blink, the cursor
// and the focus border hopping between the panes.
import { writeFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";
import { TillyFigure } from "../components/learn/tilly-figure";

const markup = renderToStaticMarkup(
  <TillyFigure standalone title="Tilly, the tuios mascot" />,
);
const out = new URL("../public/learn/tilly.svg", import.meta.url);
await writeFile(out, `${markup}\n`);
console.log(`wrote ${out.pathname}`);
