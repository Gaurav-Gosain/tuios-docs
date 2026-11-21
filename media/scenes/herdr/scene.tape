# herdr's CLI, through the link TUIOS puts in every pane. The alias names
# that link.
Run "herdr pane list | jq -r '.result.panes[] | [.label, .agent, .agent_status, .pane_id] | @tsv' | expand -t 10,20,32"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
