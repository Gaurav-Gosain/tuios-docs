# Quick look on README.md: ctrl+b f finds the file and selects it in the
# rail, and space opens quick look on it.
WaitFor panes 1 10s
RenameWindow "notes"
Run "clear"
Sleep 800ms
Press "ctrl+b f"
Sleep 800ms
Press "R E A D M E"
Sleep 1200ms
Press "enter"
Sleep 1500ms
Press "space"
Sleep 3000ms
Action screenshot_screen
Sleep 1500ms
