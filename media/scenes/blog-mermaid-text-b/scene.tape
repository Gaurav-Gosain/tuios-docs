# Text drawings: a gantt chart above a pie chart.
WaitFor panes 1 10s
RenameWindow "gantt"
Run "clear"
Sleep 300ms
Run "tuios mermaid -f text gantt.mmd"
Sleep 800ms
Action split_horizontal
Sleep 400ms
RenameWindow "pie"
Run "clear"
Sleep 300ms
Run "tuios mermaid -f text pie.mmd"
Sleep 4800ms
Action screenshot_screen
Sleep 1500ms
