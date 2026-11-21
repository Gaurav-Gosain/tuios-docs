# One pane with hashes, paths, an address, a URL and an ID. Not part of the shot.
WaitFor panes 1 10s
RenameWindow "api"
Run "clear; git --no-pager log --oneline"
Sleep 400ms
Run "git status --short"
Sleep 400ms
Run "cat ~/health.log"
Sleep 4500ms
