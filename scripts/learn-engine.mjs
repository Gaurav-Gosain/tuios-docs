// Copies a tuios browser build into public/learn so the /learn page can run it.
//
//   bun scripts/learn-engine.mjs <build-dir>
//
// <build-dir> is what tuios's cmd/tuios-wasm/build.sh writes: tuios.wasm.gz,
// wasm_exec.js, webterm.js, webterm.css, xterm.css, fonts/ and manifest.json,
// and webterm-vtgl.js when tuios's sip ships the vtgl renderer as its own
// file. The page loads that one only for ?renderer=vtgl, so it is copied but
// not counted in totalBytes.
// The deploy workflow runs it after building tuios at the ref in
// learn/TUIOS_REF, and it works the same on a local build.
//
// Only the compressed wasm ships: the raw file is over the 25 MiB limit on
// one Workers static asset, so build.sh does not keep it. tuios.wasm.br and
// tuios.wasm.gz go side by side. The Worker answers <folder>/tuios.wasm with
// the brotli one, or the gzip one for a browser without brotli (see
// worker/engine.ts). A host without the Worker has no tuios.wasm, and the
// page then fetches the .gz and unpacks it itself (see lib/learn/runtime.ts).
//
// The font names come from the build's manifest.json and go into engine.json
// for the page to use. They are sip's WOFF2 files.
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
    new RegExp(`^fonts/[^/]*-${face}\\.woff2$`).test(f),
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

const vtgl = built.includes("webterm-vtgl.js") ? "webterm-vtgl.js" : undefined;
// A build from before build.sh wrote the brotli file has only the gzip one.
const brotli = built.includes("tuios.wasm.br") ? "tuios.wasm.br" : undefined;

const gz = await readFile(path.join(src, "tuios.wasm.gz"));
const hash = createHash("sha256").update(gz).digest("hex").slice(0, 12);
const root = path.resolve("public/learn");
const dir = path.join(root, "engine", hash);

await rm(path.join(root, "engine"), { recursive: true, force: true });
await mkdir(path.join(dir, "fonts"), { recursive: true });

/** Copies a build file into the engine folder, and returns its size. */
async function ship(name) {
  await copyFile(path.join(src, name), path.join(dir, name));
  const { size } = await stat(path.join(dir, name));
  if (size > LIMIT) {
    throw new Error(`${name} is ${size} bytes, over the 25 MiB asset limit`);
  }
  return size;
}

let totalBytes = 0;
for (const name of files) totalBytes += await ship(name);
const brotliBytes = brotli ? await ship(brotli) : 0;
// A browser with brotli downloads the brotli file in place of the gzip one.
if (brotli) totalBytes += brotliBytes - gz.length;

const manifest = {
  base: `/learn/engine/${hash}/`,
  wasm: "tuios.wasm.gz",
  wasmBytes: gz.length,
  /** The size of the raw wasm, which the page counts its download against. */
  wasmRawBytes: build.wasm?.raw ?? 0,
  /** Everything the page downloads to run tuios, for the size it quotes. */
  totalBytes,
  fonts,
  ref: build.commit ?? "",
};
if (brotli) {
  /** The name the Worker answers with the brotli or the gzip file. */
  manifest.wasmEncoded = "tuios.wasm";
  manifest.brotliBytes = brotliBytes;
}
if (vtgl) {
  await copyFile(path.join(src, vtgl), path.join(dir, vtgl));
  const { size } = await stat(path.join(dir, vtgl));
  if (size > LIMIT) {
    throw new Error(`${vtgl} is ${size} bytes, over the 25 MiB asset limit`);
  }
  manifest.vtgl = vtgl;
}
await writeFile(
  path.join(root, "engine.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(
  `learn engine ${hash} from ${manifest.ref.slice(0, 8)}: wasm ${(gz.length / 1e6).toFixed(1)} MB gzipped${brotli ? `, ${(brotliBytes / 1e6).toFixed(1)} MB brotli` : ""}, ${(totalBytes / 1e6).toFixed(1)} MB in all`,
);
