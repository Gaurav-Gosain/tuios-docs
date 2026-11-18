# One pane with some history. Not part of the shots.
WaitFor panes 1 10s
RenameWindow "log"
Run "clear; git --no-pager log --stat --format='%h %s'"
Sleep 1500ms
