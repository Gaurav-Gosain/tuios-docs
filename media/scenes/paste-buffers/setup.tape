# Two panes with short output. Not part of the shots.
WaitFor panes 1 10s
RenameWindow "log"
Run "clear; git --no-pager log --format='%h %<(26,trunc)%s'"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "shell"
Run "clear; ls"
Sleep 1500ms
Run "tuios set-buffer 'go test ./...'; tuios set-buffer 'git push origin main'; tuios set-buffer 'https://tuios.dev/docs'; clear; ls"
Sleep 1500ms
