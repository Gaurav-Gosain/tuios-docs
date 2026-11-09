# Three workers across the top, the lead below them. Not part of the shot.
WaitFor panes 1 10s
RenameWindow "api-docs"
Run "agent-demo working 'Rewrite the API reference pages'"
Sleep 600ms
Action split_horizontal
Sleep 400ms
RenameWindow "lead"
Sleep 300ms
Focus "api-docs"
Sleep 300ms
Action split_vertical
Sleep 400ms
RenameWindow "cache"
Run "agent-demo needs_input 'Bash: go test ./internal/cache/...' approval"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "changelog"
Run "agent-demo done 'Draft the changelog'"
Sleep 400ms
Focus "lead"
Sleep 3000ms
