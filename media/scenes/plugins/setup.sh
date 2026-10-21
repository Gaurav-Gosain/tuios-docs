#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# A native plugin that asks for read, installed from a folder before tuios
# starts. Install is refused inside a pane, so it cannot run in the tape.
cp -r "$MEDIA/scenes/plugins/fixtures-plugin" ~/panes
tuios plugins install ~/panes --yes >/dev/null
