# Lock mode: two panes in terminal mode. The mode pill shows the lock.
WaitFor panes 1 10s
RenameWindow "shell"
Run "git log --oneline"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "notes"
Run "git status --short"
Sleep 4500ms
Action screenshot_screen
# Wait out the screenshot's own message, so the next shot has a clean dock.
Sleep 5500ms
# The leader unlocks for one action. The pill shows the open lock, and the
# which-key panel lists the leader menu.
Press "ctrl+b"
Sleep 1500ms
Action screenshot_screen
Sleep 1500ms
