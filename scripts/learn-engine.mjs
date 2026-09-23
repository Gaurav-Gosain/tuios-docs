// Copies a tuios browser build into public/learn so the /learn page can run it.
//
//   bun scripts/learn-engine.mjs <build-dir>
//
// <build-dir> is what tuios's cmd/tuios-wasm/build.sh writes: tuios.wasm.gz,
// wasm_exec.js, webterm.js, webterm.css, xterm.css, fonts/ and manifest.json.
// The deploy workflow runs it after building tuios at the ref in
// learn/TUIOS_REF, and it works the same on a local build.
//
// Only the gzipped wasm ships. The raw file is about 27 MB and Workers static
// assets refuse any file over 25 MiB, so build.sh does not keep it. The page
// fetches the .gz and unpacks it with DecompressionStream (see
// lib/learn/runtime.ts).
//
// The fonts are woff2 or ttf depending on the tools build.sh found, so their
// names come from the build's manifest.json and go into engine.json for the
// page to use.
//
// The files go under public/learn/engine/<hash>/, named by the hash of the
// wasm, so they can be cached forever. public/learn/engine.json names that
// folder and is the one file the page fetches first.
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
  console.error("usage: bun scripts/learn-engine.mjs <build-dir>");
  process.exit(2);
}

const build = JSON.parse(
  await readFile(path.join(src, "manifest.json"), "utf8"),
);
const built = Object.keys(build.files ?? {});

/** The one font file in the build for a face, such as "Regular". */
function font(face) {
  const name = built.find((f) =>
    new RegExp(`^fonts/[^/]*-${face}\\.(woff2|ttf)$`).test(f),
  );
  if (!name) throw new Error(`the build has no ${face} font`);
  return name;
}

const fonts = { regular: font("Regular"), bold: font("Bold") };
const files = [
  "tuios.wasm.gz",
  "wasm_exec.js",
  "webterm.js",
  "webterm.css",
  "xterm.css",
  fonts.regular,
  fonts.bold,
];

const gz = await readFile(path.join(src, "tuios.wasm.gz"));
const hash = createHash("sha256").update(gz).digest("hex").slice(0, 12);
const root = path.resolve("public/learn");
const dir = path.join(root, "engine", hash);

await rm(path.join(root, "engine"), { recursive: true, force: true });
await mkdir(path.join(dir, "fonts"), { recursive: true });

let totalBytes = 0;
for (const name of files) {
  await copyFile(path.join(src, name), path.join(dir, name));
  const { size } = await stat(path.join(dir, name));
  if (size > LIMIT) {
    throw new Error(`${name} is ${size} bytes, over the 25 MiB asset limit`);
  }
  totalBytes += size;
}

const manifest = {
  base: `/learn/engine/${hash}/`,
  wasm: "tuios.wasm.gz",
  wasmBytes: gz.length,
  /** Everything the page downloads to run tuios, for the size it quotes. */
  totalBytes,
  fonts,
  ref: build.commit ?? "",
};
await writeFile(
  path.join(root, "engine.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(
  `learn engine ${hash} from ${manifest.ref.slice(0, 8)}: wasm ${(gz.length / 1e6).toFixed(1)} MB gzipped, ${(totalBytes / 1e6).toFixed(1)} MB in all`,
);
