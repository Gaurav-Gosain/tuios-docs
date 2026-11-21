# A worktree session on feat/retry, with a new file in it. Not part of the shot.
WaitFor panes 1 10s
RenameWindow "shell"
Run "tuios worktree new feat/retry --detach"
Sleep 2500ms
Run "cp ~/retry.go \"$(git worktree list | awk 'END{print $1}')/internal/store/\" && clear"
Sleep 4500ms
