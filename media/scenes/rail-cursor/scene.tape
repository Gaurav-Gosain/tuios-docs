# The rail's cursor row. Three panes, then the keyboard moves to the rail
# and the cursor goes down to a pane row.
WaitFor panes 1 10s
RenameWindow "server"
Run "git log --oneline"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "tests"
Run "git status --short"
Sleep 400ms
Action split_horizontal
Sleep 400ms
RenameWindow "notes"
Run "ls internal/store"
Sleep 4500ms
Press "ctrl+b e"
Sleep 800ms
Press "j"
Sleep 400ms
Press "j"
Sleep 1500ms
Action screenshot_screen
Sleep 1500ms
