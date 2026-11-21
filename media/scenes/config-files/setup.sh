#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# A config in four files: shared.toml from the dotfiles, two config.d files
# for this machine, and config.toml, which the rig writes.
dir=$XDG_CONFIG_HOME/tuios
mkdir -p "$dir/config.d"
cat >"$dir/shared.toml" <<'TOML'
# Shared by every machine, from the dotfiles repository.
[appearance]
border_style = "thick"
window_title_position = "bottom"
TOML
cat >"$dir/config.d/10-dock.toml" <<'TOML'
[appearance]
dock_workspace_tabs = true
TOML
cat >"$dir/config.d/50-hints.toml" <<'TOML'
[hints]
all_panes = true
TOML
