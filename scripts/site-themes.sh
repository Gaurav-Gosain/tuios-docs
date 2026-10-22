#!/usr/bin/env bash
# site-themes.sh: write lib/site-themes/themes.json, every theme tuios ships,
# for the theme picker of the site.
#
#   scripts/site-themes.sh
#
# The tuios commit is in tools/themes/TUIOS_REF. The program in
# tools/themes/main.go imports internal/theme, which only code inside the
# tuios module may import. So the script copies tuios at that commit out of
# the module cache and builds the program inside the copy.
#
# Needs: Go.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

ref=$(tr -d '[:space:]' < tools/themes/TUIOS_REF)
dir=$(GOWORK=off GOFLAGS=-mod=mod go mod download -json "github.com/Gaurav-Gosain/tuios@$ref" |
  sed -n 's/^[[:space:]]*"Dir": "\(.*\)",$/\1/p')
if [[ -z "$dir" ]]; then
  echo "site-themes: could not download tuios at $ref" >&2
  exit 1
fi

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# An empty config folder and an empty Omarchy folder: only the themes tuios
# ships are registered, never the custom or Omarchy themes of this machine.
mkdir -p "$work/config" "$work/omarchy"
cp -r "$dir" "$work/tuios"
chmod -R u+w "$work/tuios"
mkdir -p "$work/tuios/cmd/site-themes"
cp tools/themes/main.go "$work/tuios/cmd/site-themes/main.go"

(cd "$work/tuios" && GOWORK=off GOFLAGS=-mod=readonly go build -o "$work/themes" ./cmd/site-themes)

mkdir -p lib/site-themes
XDG_CONFIG_HOME="$work/config" SWATCH_OMARCHY_DIR="$work/omarchy" \
  "$work/themes" "$ref" lib/site-themes/themes.json
