# Landing: the Inbox with an approval, a question and an error.
WaitFor panes 1 10s
RenameWindow "release"
Run "agent-demo needs_input 'Bash: rm -rf build && git push --force' approval"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "store"
Run "agent-demo needs_input 'Which database should the store use?' question"
Sleep 400ms
Action split_horizontal
Sleep 400ms
RenameWindow "vet"
Run "agent-demo errored 'Fix the vet warnings'"
Sleep 4500ms
Press "ctrl+b i"
Sleep 1500ms
Action screenshot_screen
Sleep 1500ms
