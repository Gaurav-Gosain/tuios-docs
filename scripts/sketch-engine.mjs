// Copies a sketch browser build into public/sketch-playground so the sketch
// playground (/docs/libraries/sketch/playground) can run it.
//
//   bun scripts/sketch-engine.mjs <build-dir>
//
// <build-dir> is what tuios's cmd/sketch-wasm/build.sh writes: sketch.wasm.gz,
// sketch.wasm.br, wasm_exec.js and manifest.json. The deploy workflow runs it
// after building sketch at the tuios commit in sketch-playground/TUIOS_REF,
// and it works the same on a local build.
//
// It works like scripts/learn-engine.mjs. The files go under
// public/sketch-playground/engine/<hash>/ with lib/sketch/worker.js, named by
// the hash of the gzipped wasm and the worker, so they can be cached forever.
// public/sketch-playground/engine.json names that folder and is the one file
// the page fetches first. The Worker answers <folder>/sketch.wasm with the
// brotli or the gzip twin (worker/engine.ts).
//
// The engine is not under /sketch: that path is the Go import path
// tuios.dev/sketch, and worker/goimport.ts answers everything below it.
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
  console.error("usage: bun scripts/sketch-engine.mjs <build-dir>");
  process.exit(2);
}

const build = JSON.parse(
  await readFile(path.join(src, "manifest.json"), "utf8"),
);
const files = ["sketch.wasm.gz", "sketch.wasm.br", "wasm_exec.js"];
const worker = path.resolve("lib/sketch/worker.js");

const hash = createHash("sha256")
  .update(await readFile(path.join(src, "sketch.wasm.gz")))
  .update(await readFile(worker))
  .digest("hex")
  .slice(0, 12);
const root = path.resolve("public/sketch-playground");
const dir = path.join(root, "engine", hash);

await rm(path.join(root, "engine"), { recursive: true, force: true });
await mkdir(dir, { recursive: true });

const sizes = {};
for (const name of files) {
  await copyFile(path.join(src, name), path.join(dir, name));
  sizes[name] = (await stat(path.join(dir, name))).size;
  if (sizes[name] > LIMIT) {
    throw new Error(`${name} is ${sizes[name]} bytes, over the 25 MiB limit`);
  }
}
await copyFile(worker, path.join(dir, "worker.js"));

const manifest = {
  base: `/sketch-playground/engine/${hash}/`,
  worker: "worker.js",
  wasm: "sketch.wasm",
  wasmEncoded: "sketch.wasm",
  gz: "sketch.wasm.gz",
  gzipBytes: sizes["sketch.wasm.gz"],
  brotliBytes: sizes["sketch.wasm.br"],
  rawBytes: build.wasm?.raw ?? 0,
  commit: build.commit ?? "",
};
await writeFile(
  path.join(root, "engine.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(
  `sketch engine ${hash}: ${(manifest.brotliBytes / 1e6).toFixed(2)} MB brotli, ${(manifest.gzipBytes / 1e6).toFixed(2)} MB gzip`,
);
