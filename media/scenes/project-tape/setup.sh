#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# The project's tape: the log, a web server for the stylesheet and a
# watch on the work tree, in three panes of a session named notes.
cat >.tuios.tape <<'TAPE'
# .tuios.tape
Session "notes"
Require "python3"

RenameWindow "code"
Run "git --no-pager log --oneline"

Split vertical
RenameWindow "serve"
Run "python3 -m http.server 8080 -d web"

Split horizontal
RenameWindow "watch"
Run "watch -n 2 git status --short"

Focus "code"
TAPE
