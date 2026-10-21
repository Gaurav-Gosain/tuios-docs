#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# A native plugin that asks for admin, in a folder. The tape tries to give
# it admin from a pane, first as is, then with every TUIOS_ variable cut.
cp -r "$MEDIA/scenes/blog-plugins-admin/fixtures-plugin" ~/layout
