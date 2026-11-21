# Two panes with short output. Not part of the shot.
WaitFor panes 1 10s
RenameWindow "api"
Run "clear; git --no-pager log --oneline"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "shell"
Run "clear; git status --short"
Sleep 4500ms
