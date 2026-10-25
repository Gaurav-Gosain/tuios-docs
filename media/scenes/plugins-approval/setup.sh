#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# A native plugin that asks for read and write, linked and enabled before
# tuios starts. A linked plugin is not approved, so the client asks in the
# approval dialog when it attaches. The dialog ignores what a tape presses,
# so the shot is the dialog itself.
cp -r "$MEDIA/scenes/plugins/fixtures-plugin" ~/notes
sed -i '0,/^id = .*/s//id = "example.notes"/; s/^name = .*/name = "Notes"/; s/^description = "List the panes of every session."/description = "Keep notes beside your panes."/; s/^grants = .*/grants = ["read", "write"]/; s/^title = .*/title = "Notes"/; s/^description = "Show every pane, and try to type into one"/description = "Open the notes"/' ~/notes/tuios-plugin.toml
tuios plugins link ~/notes >/dev/null
tuios plugins enable example.notes >/dev/null
