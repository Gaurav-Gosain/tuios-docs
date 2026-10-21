# Two panes. Not part of the shots.
WaitFor panes 1 10s
RenameWindow "shell"
Run "clear"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "notes"
Run "clear"
Sleep 1500ms
