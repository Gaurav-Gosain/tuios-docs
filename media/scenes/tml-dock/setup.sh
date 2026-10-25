#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# The documents the tape shows. They are the ones the tml page draws with
# tools/libshots, so the page and the frames show the same thing.
cp "$MEDIA/../tools/libshots/scenes/tml/test-run.tml" test-run.tml
cp "$MEDIA/../tools/libshots/scenes/tml/confirm.tml" deploy.tml
