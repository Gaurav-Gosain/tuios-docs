# One pane with the command explorer open. Not part of the shot.
WaitFor panes 1 10s
RenameWindow "shell"
Run "clear; tuios help -i"
Sleep 2000ms
