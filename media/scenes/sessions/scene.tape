# Sessions: three sessions on one daemon, and the switcher over them.
WaitFor panes 1 10s
Run "tuios new -d web --cwd ~/project/web && tuios new -d store --cwd ~/project/internal/store && clear"
Sleep 1500ms
Run "git log --oneline"
Sleep 400ms
Action split_vertical
Sleep 400ms
Run "git status --short"
Sleep 4500ms
Press "ctrl+b S"
Sleep 1200ms
Action screenshot_screen
Sleep 1500ms
