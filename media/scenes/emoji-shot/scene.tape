# One pane that prints emoji sequences, shot with tuios's own renderer.
WaitFor panes 1 10s
RenameWindow "emoji"
Run "clear; ~/emoji"
Sleep 2000ms
Action screenshot_screen
Sleep 1500ms
