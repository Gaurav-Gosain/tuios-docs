#!/usr/bin/env bash
# Uploads the featured mentions to the tuios-media R2 bucket, which the
# Worker serves at /in-the-wild/feed (see worker/wild.ts).
#
#   scripts/upload-in-the-wild.sh <public.json>
#   scripts/upload-in-the-wild.sh <public.json> --local   # wrangler dev's bucket
#
# <public.json> is what `hearsay publish` writes: the featured items only.
# The script refuses a file that still carries private fields (relevance,
# reason, files, first_seen, last_seen), so a full feed cannot go up by
# mistake. Uploading again replaces the file.
#
# wrangler must reach the account that owns the tuios-media bucket. When
# CLOUDFLARE_API_TOKEN in the shell belongs to another account, run it with
# that variable unset so wrangler uses its own login.
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <public.json> [--local]" >&2
  exit 2
fi
file=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
where=--remote
[[ ${2:-} == --local ]] && where=--local
worker_dir="$(cd "$(dirname "$0")/../worker" && pwd)"

bun -e '
const f = JSON.parse(await Bun.file(process.argv[1]).text());
if (f.version !== 1 || !Array.isArray(f.items)) throw new Error("not a version 1 feed");
const priv = ["relevance", "reason", "files", "first_seen", "last_seen"];
for (const it of f.items) {
  const bad = priv.filter((k) => k in it);
  if (bad.length) throw new Error(`item ${it.id} still has ${bad.join(", ")}. Run hearsay publish first.`);
}
console.log(`${f.items.length} featured items`);
' "$file"

cd "$worker_dir"
bunx wrangler r2 object put "tuios-media/mentions/featured.json" \
  --file "$file" --content-type "application/json; charset=utf-8" "$where"
