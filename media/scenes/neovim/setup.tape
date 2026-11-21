# Neovim with two splits across the top, and a shell under it. Not part
# of the shot.
WaitFor panes 1 10s
RenameWindow "edit"
Run "nvim -O cmd/api/main.go internal/store/store.go"
Sleep 1500ms
Action split_horizontal
Sleep 600ms
RenameWindow "shell"
Run "clear; git --no-pager log --oneline --stat -3"
Sleep 600ms
Focus "edit"
Sleep 4500ms
