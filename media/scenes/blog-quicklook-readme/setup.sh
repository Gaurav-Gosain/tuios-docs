#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# A README written the way projects on GitHub write theirs, and a picture
# beside it for quick look to draw.
mkdir -p docs
cp "$MEDIA/scenes/blog-quicklook-readme/README.md" README.md
cp "$MEDIA/scenes/blog-quicklook-readme/tilly.png" docs/tilly.png
