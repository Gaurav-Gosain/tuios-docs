#!/usr/bin/env bash
# docs-media.sh: make the screenshots and clips of tuios the docs pages show.
#
#   scripts/docs-media.sh                 # every scene under media/scenes
#   scripts/docs-media.sh layouts agents  # the named scenes
#
# Needs: a tuios build that knows [tape] show_status (TUIOS_BIN, else the
# tuios on PATH), python3, node, ffmpeg with libsvtav1 and libx264, ImageMagick
# and Chromium (CHROMIUM, else /usr/bin/chromium). Run `bun install` in media/
# once for the renderer.
#
# Each scene is a folder under media/scenes with a scene.json, a scene.tape
# and, if it needs them, setup.tape, setup.sh and config.toml. media/rig.py
# says what each file does. The tapes are the source: change the UI, run this
# again, and the media follow.
#
#   "kind": "shot"  The tape ends with `Action screenshot_screen`. Each name
#                   in "shots" becomes public/shots/NAME.webp (1600 wide) and
#                   NAME-800.webp. With "themes" naming a second, light theme,
#                   the scene runs again in it, and the files get -light.
#   "kind": "clip"  The take is drawn at 60 fps by media/render.mjs and
#                   encoded by media/encode.sh to public/clips/NAME.webm (AV1),
#                   NAME.mp4 (H.264) and the poster NAME.webp.
#   "kind": "still" A shot of the take's last frame, drawn as a clip is.
#                   For a screen with a glyph the font lacks.
#
# Every take runs against its own daemon in a throwaway HOME, never yours.
# Encodes run one at a time at nice 19 on cores 0 to 3.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
media=$root/media
build=$media/build
tuios=${TUIOS_BIN:-$(command -v tuios || true)}
[[ -x $tuios ]] || { echo "docs-media: set TUIOS_BIN or put tuios on PATH" >&2; exit 1; }
grep -qa 'tape.show_status' "$tuios" || {
  echo "docs-media: $tuios has no [tape] show_status. Build tuios from a newer commit." >&2
  exit 1
}
export TUIOS_BIN=$tuios
[[ -d $media/node_modules ]] || (cd "$media" && bun install)

run() { nice -n 19 taskset -c 0-3 "$@"; }

# The font every shot, poster and frame is drawn in. JetBrainsMono Nerd Font
# Mono when it is installed, else GeistMono Nerd Font Mono. Both are OFL.
# Set DOCS_MEDIA_FONT and DOCS_MEDIA_FONT_BOLD to other files to change it.
pick() { for f in "$@"; do [[ -f $f ]] && { echo "$f"; return; }; done; }
geist=$HOME/.local/share/fonts/GeistMonoNerdFont
jb=/usr/share/fonts/TTF
export DOCS_MEDIA_FONT=${DOCS_MEDIA_FONT:-$(pick "$jb/JetBrainsMonoNerdFontMono-Regular.ttf" "$geist/GeistMonoNerdFontMono-Regular.otf")}
export DOCS_MEDIA_FONT_BOLD=${DOCS_MEDIA_FONT_BOLD:-$(pick "$jb/JetBrainsMonoNerdFontMono-Bold.ttf" "$geist/GeistMonoNerdFontMono-Bold.otf")}
[[ -f $DOCS_MEDIA_FONT ]] || { echo "docs-media: no font file; set DOCS_MEDIA_FONT" >&2; exit 1; }
echo "docs-media: font $DOCS_MEDIA_FONT"

# rig SCENE_DIR ARGS...: run media/rig.py on one scene.
#
# With "hostname" or "short_home" in scene.json, the take runs in its own
# user, UTS and mount namespaces:
#
# - The host name is the scene's "hostname", or demo, so a screen that
#   names the machine does not show yours.
# - A tmpfs covers /home, with your own home moved back in place, and the
#   take's HOME is /home/demo. A path on the screen, such as the restore
#   divider, then reads /home/demo/project and names no folder of yours.
#
# The outer user namespace maps you to root, which may set the name and
# mount. The inner one maps you back to your own uid, so tuios sees the same
# user as outside.
rig() {
  local host short
  host=$(jq -r '.hostname // empty' "$1/scene.json")
  short=$(jq -r '.short_home // false' "$1/scene.json")
  if [[ -z $host && $short != true ]]; then
    python3 "$media/rig.py" "$@"
    return
  fi
  local stage
  stage=$(mktemp -d)
  unshare --user --map-root-user --uts --mount bash -c '
    set -e
    mount --make-rprivate /
    mount --bind "$HOME" "$4"
    mount -t tmpfs -o mode=755 tmpfs /home
    mkdir -p "$HOME" /home/demo
    mount --move "$4" "$HOME"
    hostname "$0"
    exec unshare --user --map-user="$1" --map-group="$2" env RIG_HOME=/home/demo python3 "$3/rig.py" "${@:5}"' \
    "${host:-demo}" "$(id -u)" "$(id -g)" "$media" "$stage" "$@"
  rmdir "$stage"
}

webp() { # SRC.png DEST.webp WIDTH
  run magick "$1" -resize "$3x" -strip -define webp:method=6 -quality 82 "$2"
}

shot_scene() { # NAME
  local name=$1 dir=$media/scenes/$1 theme suffix shot
  local themes
  mapfile -t themes < <(jq -r '.themes // ["catppuccin_mocha"] | .[]' "$dir/scene.json")
  for theme in "${themes[@]}"; do
    suffix=
    [[ $theme == *latte* || $theme == *light* || $theme == *day* ]] && suffix=-light
    rig "$dir" "$build/$name$suffix" --theme "$theme"
    for shot in $(jq -r '.shots[]' "$dir/scene.json"); do
      webp "$build/$name$suffix/$shot.png" "$root/public/shots/$shot$suffix.webp" 1600
      webp "$build/$name$suffix/$shot.png" "$root/public/shots/$shot$suffix-800.webp" 800
      echo "shot: public/shots/$shot$suffix.webp"
    done
  done
}

clip_scene() { # NAME
  local name=$1 dir=$media/scenes/$1
  local font max
  font=$(jq -r '.font // 18' "$dir/scene.json")
  max=$(jq -r '.max // 12' "$dir/scene.json")
  rig "$dir" "$build/$name"
  node "$media/render.mjs" "$build/$name" "$build/$name/master.mkv" --font "$font" --max "$max"
  mkdir -p "$root/public/clips"
  bash "$media/encode.sh" "$build/$name/master.mkv" "$root/public/clips/$name"
  echo "clip: public/clips/$name.webm"
}

still_scene() { # NAME
  # A shot drawn by the clip renderer: the take's last frame, drawn by
  # xterm.js. Use it when the screen has a glyph the font lacks, because
  # Chromium falls back to a system font for it and screenshot_screen does not.
  local name=$1 dir=$media/scenes/$1 shot font
  font=$(jq -r '.font // 28' "$dir/scene.json")
  shot=$(jq -r '.still' "$dir/scene.json")
  rig "$dir" "$build/$name"
  node "$media/render.mjs" "$build/$name" "$build/$name/master.mkv" --font "$font" --pre 0 --max 60
  run ffmpeg -v error -y -sseof -0.1 -i "$build/$name/master.mkv" -frames:v 1 -update 1 "$build/$name/$shot.png"
  webp "$build/$name/$shot.png" "$root/public/shots/$shot.webp" 1600
  webp "$build/$name/$shot.png" "$root/public/shots/$shot-800.webp" 800
  echo "shot: public/shots/$shot.webp"
}

scenes=("$@")
if ((${#scenes[@]} == 0)); then
  for d in "$media"/scenes/*/; do scenes+=("$(basename "$d")"); done
fi
for name in "${scenes[@]}"; do
  kind=$(jq -r '.kind' "$media/scenes/$name/scene.json")
  case $kind in
  shot) shot_scene "$name" ;;
  clip) clip_scene "$name" ;;
  still) still_scene "$name" ;;
  *) echo "docs-media: $name: unknown kind $kind" >&2; exit 1 ;;
  esac
done

du -ch "$root"/public/shots/* "$root"/public/clips/* 2>/dev/null | tail -1
