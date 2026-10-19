// Copies a hearsay browser build into public/in-the-wild so the /in-the-wild
// page can run it.
//
//   bun scripts/in-the-wild-engine.mjs <build-dir>
//
// <build-dir> is what hearsay's wasm/build.sh writes: hearsay.wasm.gz and
// hearsay.wasm.br, wasm_exec.js, webterm.js, webterm.css, xterm.css and
// fonts/. The deploy workflow runs it after building hearsay at the commit in
// in-the-wild/HEARSAY_REF, and it works the same on a local build.
//
// It works like scripts/learn-engine.mjs. The files go under
// public/in-the-wild/engine/<hash>/, named by the hash of the gzipped wasm,
// so they can be cached forever. public/in-the-wild/engine.json names that
// folder and is the one file the page fetches first. The Worker answers
// <folder>/hearsay.wasm with the brotli or the gzip twin (worker/engine.ts).
// The build's own index.html and any mentions.json in it are not copied:
// the page is app/in-the-wild, and the feed comes from /in-the-wild/feed.
import { createHash } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const LIMIT = 25 * 1024 * 1024;

const src = process.argv[2];
if (!src) {
  console.error("usage: bun scripts/in-the-wild-engine.mjs <build-dir>");
  process.exit(2);
}

const fonts = {
  regular: "fonts/JetBrainsMonoNerdFontMono-Regular.woff2",
  bold: "fonts/JetBrainsMonoNerdFontMono-Bold.woff2",
};
const files = [
  "hearsay.wasm.gz",
  "hearsay.wasm.br",
  "wasm_exec.js",
  "webterm.js",
  "webterm.css",
  "xterm.css",
  fonts.regular,
  fonts.bold,
];

const gz = await readFile(path.join(src, "hearsay.wasm.gz"));
const hash = createHash("sha256").update(gz).digest("hex").slice(0, 12);
const root = path.resolve("public/in-the-wild");
const dir = path.join(root, "engine", hash);

await rm(path.join(root, "engine"), { recursive: true, force: true });
await mkdir(path.join(dir, "fonts"), { recursive: true });

const sizes = {};
for (const name of files) {
  await copyFile(path.join(src, name), path.join(dir, name));
  const { size } = await stat(path.join(dir, name));
  if (size > LIMIT) {
    throw new Error(`${name} is ${size} bytes, over the 25 MiB asset limit`);
  }
  sizes[name] = size;
}

const ref = process.env.HEARSAY_REF ?? "";
const manifest = {
  base: `/in-the-wild/engine/${hash}/`,
  wasm: "hearsay.wasm.gz",
  wasmEncoded: "hearsay.wasm",
  wasmBytes: sizes["hearsay.wasm.gz"],
  brotliBytes: sizes["hearsay.wasm.br"],
  fonts,
  ref,
};
await writeFile(
  path.join(root, "engine.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(
  `in-the-wild engine ${hash}: wasm ${(manifest.wasmBytes / 1e6).toFixed(1)} MB gzipped, ${(manifest.brotliBytes / 1e6).toFixed(1)} MB brotli`,
);
