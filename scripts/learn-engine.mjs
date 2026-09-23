// Copies a tuios browser build into public/learn so the /learn page can run it.
//
//   bun scripts/learn-engine.mjs <build-dir>
//
// <build-dir> is what tuios's cmd/tuios-wasm/build.sh writes: tuios.wasm,
// wasm_exec.js, webterm.js, webterm.css, xterm.css and fonts/. The deploy
// workflow runs it after building tuios at the ref in learn/TUIOS_REF, and it
// works the same on a local build.
//
// Only a gzipped wasm ships. The raw file is about 35 MB and Workers static
// assets refuse any file over 25 MiB. The page fetches the .gz and unpacks it
// with DecompressionStream (see lib/learn/runtime.ts).
//
// The files go under public/learn/engine/<hash>/, named by the hash of the
// wasm, so they can be cached forever. public/learn/engine.json names that
// folder and is the one file the page fetches first.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
  copyFile,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const LIMIT = 25 * 1024 * 1024;

const src = process.argv[2];
if (!src) {
  console.error("usage: bun scripts/learn-engine.mjs <build-dir>");
  process.exit(2);
}

const root = path.resolve("public/learn");
const wasm = await readFile(path.join(src, "tuios.wasm"));
const hash = createHash("sha256").update(wasm).digest("hex").slice(0, 12);
const dir = path.join(root, "engine", hash);

await rm(path.join(root, "engine"), { recursive: true, force: true });
await mkdir(path.join(dir, "fonts"), { recursive: true });

const gz = gzipSync(wasm, { level: 9 });
await writeFile(path.join(dir, "tuios.wasm.gz"), gz);

const files = ["wasm_exec.js", "webterm.js", "webterm.css", "xterm.css"];
const fonts = [
  "JetBrainsMonoNerdFontMono-Regular.ttf",
  "JetBrainsMonoNerdFontMono-Bold.ttf",
];
for (const name of files) {
  await copyFile(path.join(src, name), path.join(dir, name));
}
for (const name of fonts) {
  await copyFile(path.join(src, "fonts", name), path.join(dir, "fonts", name));
}

for (const name of [
  "tuios.wasm.gz",
  ...files,
  ...fonts.map((f) => `fonts/${f}`),
]) {
  const { size } = await stat(path.join(dir, name));
  if (size > LIMIT) {
    throw new Error(`${name} is ${size} bytes, over the 25 MiB asset limit`);
  }
}

const refFile = path.resolve("learn/TUIOS_REF");
const ref = existsSync(refFile) ? (await readFile(refFile, "utf8")).trim() : "";
const manifest = {
  base: `/learn/engine/${hash}/`,
  wasm: "tuios.wasm.gz",
  wasmBytes: gz.length,
  ref,
};
await writeFile(
  path.join(root, "engine.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(
  `learn engine ${hash}: wasm ${(wasm.length / 1e6).toFixed(1)} MB, gzipped ${(gz.length / 1e6).toFixed(1)} MB`,
);
