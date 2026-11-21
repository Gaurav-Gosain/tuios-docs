# The agent pane plays three turns. Not part of the shot.
WaitFor panes 1 10s
RenameWindow "api"
Run "~/turns.sh"
WaitFor text "Three turns" 40s
Sleep 1500ms
Action split_vertical
Sleep 600ms
RenameWindow "shell"
Run "clear"
Sleep 400ms
