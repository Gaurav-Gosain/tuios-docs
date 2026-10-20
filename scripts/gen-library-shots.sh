#!/usr/bin/env bash
# gen-library-shots.sh: draw the pictures of the library pages
# (content/docs/libraries) from real code, with tools/libshots.
#
#   scripts/gen-library-shots.sh            # every library
#   scripts/gen-library-shots.sh tml loom   # the named libraries
#
# Writes public/libs/LIB/NAME.webp (dark theme) and NAME-light.webp (light
# theme), lib/libshots.json (the size of each picture) and
# tools/libshots/snippets (the code the pages show next to a picture).
#
# Needs: Go, ImageMagick (magick) and fontconfig (fc-match). The pictures use
# the monospace face in LIBSHOTS_FONT and LIBSHOTS_BOLD_FONT, else the one
# fc-match finds for LIBSHOTS_FAMILY. The face must have the box-drawing,
# block and braille glyphs: the program refuses a picture with a glyph the
# face lacks.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

family=${LIBSHOTS_FAMILY:-JetBrainsMono Nerd Font Mono}
regular=${LIBSHOTS_FONT:-$(fc-match -f '%{file}' "$family:style=Regular")}
bold=${LIBSHOTS_BOLD_FONT:-$(fc-match -f '%{file}' "$family:style=Bold")}

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# vet compiles the example programs too, such as the Bubble Tea one that
# the loom page shows in full.
(cd tools/libshots && GOWORK=off go vet ./... && GOWORK=off go build -o "$work/libshots" .)
"$work/libshots" -out "$work/png" -font "$regular" -bold "$bold" "$@"

# The pictures of the drawn libraries are made again from nothing, so a
# picture that was dropped leaves no file.
if [[ $# -eq 0 ]]; then
  rm -rf public/libs
else
  for lib in "$@"; do rm -rf "public/libs/$lib"; done
fi

# Lossless WebP keeps every glyph edge and is about half the size of PNG.
find "$work/png" -name '*.png' -print0 | while IFS= read -r -d '' png; do
  rel=${png#"$work/png/"}
  dst=public/libs/${rel%.png}.webp
  mkdir -p "$(dirname "$dst")"
  magick "$png" -define webp:lossless=true -define webp:method=6 "$dst"
done
echo "gen-library-shots: wrote $(find "$work/png" -name '*.png' | wc -l) files under public/libs"

# The manifest in the style the lint step checks.
if [[ -x node_modules/.bin/biome ]]; then
  node_modules/.bin/biome format --write lib/libshots.json >/dev/null
fi
