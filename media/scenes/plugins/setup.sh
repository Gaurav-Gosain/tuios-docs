#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# A native plugin that asks for read, installed from a folder before the
# client attaches. Install is refused inside a pane, so it cannot run in the
# tape. The install records the approval only when a daemon runs to confirm
# that it runs outside every pane, so start one first. Without it the plugin
# waits for the approval dialog.
cp -r "$MEDIA/scenes/plugins/fixtures-plugin" ~/panes
tuios start-server >/dev/null
tuios plugins install ~/panes --yes >/dev/null
