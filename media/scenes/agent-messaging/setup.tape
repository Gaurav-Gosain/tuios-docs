# An agent at work, a reviewer at rest and the lead's shell. Not part of the shot.
WaitFor panes 1 10s
RenameWindow "api"
Run "agent-demo working 'Add a jitter option to the retry backoff'"
Sleep 600ms
Action split_horizontal
Sleep 600ms
RenameWindow "lead"
Run "clear"
Sleep 300ms
Focus "api"
Sleep 300ms
Action split_vertical
Sleep 600ms
RenameWindow "review"
Run "tuios set-agent-state done -m 'Reviewed the store package'; clear"
Sleep 1500ms
Focus "lead"
Sleep 300ms
Run "tuios list-agents"
Sleep 4500ms
