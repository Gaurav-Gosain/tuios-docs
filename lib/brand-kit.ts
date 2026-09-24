import { readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { allBrandFiles, termsText } from "./brand";
import { zip } from "./zip";

/**
 * The brand kit zip and file sizes, read from public/ at build time. Server
 * only: the brand page and the zip route call these during the static export.
 */

function publicPath(path: string) {
  return join(process.cwd(), "public", path);
}

/** The kit as zip bytes: TERMS.txt, the brand files, and the icons folder. */
export function buildBrandKit() {
  const entries = allBrandFiles().map((file) => ({
    name: `tuios-brand-kit/${file.path.startsWith("/brand/") ? "" : "icons/"}${basename(file.path)}`,
    data: new Uint8Array(readFileSync(publicPath(file.path))),
  }));
  entries.unshift({
    name: "tuios-brand-kit/TERMS.txt",
    data: new TextEncoder().encode(termsText()),
  });
  return zip(entries);
}

/** A byte count as "4 KB" or "1.2 MB". */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** The size of a file under public/, formatted. */
export function fileSize(path: string) {
  return formatBytes(statSync(publicPath(path)).size);
}
