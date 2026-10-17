# A shell whose tmux is the shim. Not part of the clip.
WaitFor panes 1 10s
RenameWindow "lead"
Run "tuios tmux-shim"
Sleep 800ms
Run "clear"
Sleep 400ms
