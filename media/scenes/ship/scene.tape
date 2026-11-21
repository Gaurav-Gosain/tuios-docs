# Commit the work in the worktree, then merge it into main.
Run "tuios ship commit -s project-feat-retry -m 'Retry a busy store open'"
Sleep 1500ms
Run "tuios ship merge -s project-feat-retry"
Sleep 1500ms
Run "git --no-pager log --oneline -3"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
