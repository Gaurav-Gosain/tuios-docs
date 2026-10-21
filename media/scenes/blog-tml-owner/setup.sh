#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# The document and the shell script that owns it.
cp "$MEDIA/scenes/blog-tml-owner/release.tml" release.tml
cp "$MEDIA/scenes/blog-tml-owner/release.sh" release.sh
chmod +x release.sh
