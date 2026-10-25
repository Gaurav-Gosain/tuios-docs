# The focused border per mode. Window mode first, then terminal mode.
WaitFor panes 1 10s
RenameWindow "shell"
Run "git log --oneline"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "notes"
Run "git status --short"
Sleep 600ms
Press "ctrl+b esc"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
Press "i"
# Wait out the screenshot's message and the mode message.
Sleep 5500ms
Action screenshot_screen
Sleep 1500ms
