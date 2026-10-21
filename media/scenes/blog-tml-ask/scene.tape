# The question tuios asks before an agent's surface types into a pane.
WaitFor panes 1 10s
RenameWindow "agent"
Run "clear"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "shell"
Run "clear"
Sleep 600ms
Action next_window
Sleep 400ms
Run "tuios tml show review.tml --pane"
Sleep 4800ms
Action next_window
Sleep 300ms
Action next_window
Sleep 800ms
Press "l"
Sleep 1500ms
Action screenshot_screen
Sleep 1500ms
