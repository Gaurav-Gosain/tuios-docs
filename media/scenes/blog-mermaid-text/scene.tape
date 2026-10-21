# Text drawings: a state diagram and an XY chart, side by side.
WaitFor panes 1 10s
RenameWindow "state"
Run "clear"
Sleep 300ms
Run "tuios mermaid -f text state.mmd"
Sleep 800ms
Action split_vertical
Sleep 400ms
RenameWindow "xychart"
Run "clear"
Sleep 300ms
Run "tuios mermaid -f text xy.mmd"
Sleep 4800ms
Action screenshot_screen
Sleep 1500ms
