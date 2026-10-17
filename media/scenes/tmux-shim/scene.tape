# tmux shim: tmux commands from a pane open and list tuios panes.
Sleep 600ms
Run "tmux split-window -h 'git log --oneline; exec bash'"
Sleep 1500ms
Focus "lead"
Sleep 300ms
Run "tmux split-window -v 'git status --short; exec bash'"
Sleep 1500ms
Focus "lead"
Sleep 300ms
Run "tmux list-panes -F '#{pane_id} #{pane_current_command}'"
Sleep 2000ms
