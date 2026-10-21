# A script owns a surface. It runs once on open. Then the person presses r on
# the surface, and the script answers the event with a second run.
WaitFor panes 1 10s
RenameWindow "shell"
Run "clear"
Sleep 400ms
Run "./release.sh"
Sleep 5500ms
Action next_window
Sleep 300ms
Press "r"
Sleep 200ms
# Focus goes back to the shell. A focused surface shows the host cursor at
# the left edge of its pane, which is a tuios bug, not part of the surface.
Action next_window
Sleep 5500ms
