# A pane made after the client attached, so it gets the agent link.
# Not part of the shot.
WaitFor panes 1 10s
RenameWindow "first"
Action split_vertical
Sleep 600ms
RenameWindow "deploy"
CloseWindow "first"
Sleep 600ms
Focus "deploy"
Run "clear"
Sleep 4500ms
