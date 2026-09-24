#!/usr/bin/env bash
# Rebuild public/tilly/tilly.glb from tilly.py.
#
# Needs Blender 4.2 or newer on PATH (or BLENDER=/path/to/blender) and bun.
# Blender builds and exports the model, then gltf-transform welds it and
# compresses the geometry with meshopt, which three.js decodes with the
# small decoder in three/examples/jsm/libs.
#
#   assets/tilly-3d/build.sh [path/to/save/tilly.blend]
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
blender="${BLENDER:-blender}"
gltf=(bunx --bun @gltf-transform/cli@4.5.0)
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

"$blender" -b --factory-startup -P "$here/tilly.py" -- "$tmp/raw.glb" ${1:+"$1"}
"${gltf[@]}" weld "$tmp/raw.glb" "$tmp/weld.glb"
"${gltf[@]}" dedup "$tmp/weld.glb" "$tmp/dedup.glb"
"${gltf[@]}" meshopt "$tmp/dedup.glb" "$root/public/tilly/tilly.glb" --level medium
ls -l "$root/public/tilly/tilly.glb"
