#!/usr/bin/env bash
# Uploads a release's clips to the tuios-media R2 bucket, which the Worker
# serves at /releases/<version>/<name>.mp4 and .webm (see worker/media.ts).
#
#   scripts/upload-release-media.sh v0.8.0 ~/dev/tuios-media/releases/v0.8.0/site
#   scripts/upload-release-media.sh v0.8.0 <dir> --local   # wrangler dev's bucket
#
# <dir> holds the clips as the page names them: tiling.webm, tiling.mp4,
# tiling-vertical.mp4 and so on. Only .mp4 and .webm files are uploaded; the
# posters (.jpg) and captions (.vtt) belong in public/releases/<version>/.
# Run it from anywhere; it runs wrangler in worker/ so it reads that config.
# Uploading a file that is already there replaces it.
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <version, e.g. v0.8.0> <dir> [--local]" >&2
  exit 2
fi
version=$1
dir=$(cd "$2" && pwd)
where=--remote
[[ ${3:-} == --local ]] && where=--local

if [[ ! $version =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "version must look like v0.8.0, not $version" >&2
  exit 2
fi

bucket=tuios-media
max=$((300 * 1024 * 1024)) # wrangler r2 object put refuses larger files
worker_dir="$(cd "$(dirname "$0")/../worker" && pwd)"

shopt -s nullglob
files=("$dir"/*.mp4 "$dir"/*.webm)
if [[ ${#files[@]} -eq 0 ]]; then
  echo "no .mp4 or .webm files in $dir" >&2
  exit 1
fi

for file in "${files[@]}"; do
  name=$(basename "$file")
  if [[ ! $name =~ ^[a-z0-9][a-z0-9-]*\.(mp4|webm)$ ]]; then
    echo "skipping $name: the Worker serves only lowercase names like tiling-vertical.mp4" >&2
    continue
  fi
  size=$(wc -c <"$file" | tr -d ' ')
  if ((size > max)); then
    echo "$name is $size bytes, over wrangler's 300 MiB upload limit" >&2
    exit 1
  fi
  case $name in
  *.mp4) type=video/mp4 ;;
  *.webm) type=video/webm ;;
  esac
  echo "$name ($((size / 1024 / 1024)) MiB)"
  (cd "$worker_dir" && bunx wrangler r2 object put "$bucket/releases/$version/$name" \
    --file "$file" --content-type "$type" "$where")
done
