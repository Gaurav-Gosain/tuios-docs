# One pane with the deploy summary. Not part of the shot.
WaitFor panes 1 10s
RenameWindow "deploy"
Run "clear; ~/deploy.sh"
Sleep 4500ms
