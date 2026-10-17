# Agents: four panes, each with an agent in another state, and the rail
# listing them. agent-demo (media/bin) reports each state with
# set-agent-state, the call the harness hooks make.
WaitFor panes 1 10s
RenameWindow "tests"
Run "agent-demo working 'Add tests for the store'"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "api"
Run "agent-demo needs_input 'Add a delete endpoint' approval"
Sleep 400ms
Action split_horizontal
Sleep 400ms
RenameWindow "style"
Run "agent-demo done 'Use the system font on the web view'"
Sleep 400ms
Focus "tests"
Sleep 300ms
Action split_horizontal
Sleep 400ms
RenameWindow "vet"
Run "agent-demo errored 'Fix the vet warnings'"
Sleep 400ms
Focus "tests"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
