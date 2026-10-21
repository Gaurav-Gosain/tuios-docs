# The agent pane opens a surface. Its button types into the shell pane, so
# tuios asks the person first. After y, the command runs there.
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
Sleep 2000ms
Action next_window
Sleep 300ms
Action next_window
Sleep 800ms
Press "l"
Sleep 2500ms
Press "y"
Sleep 3000ms
