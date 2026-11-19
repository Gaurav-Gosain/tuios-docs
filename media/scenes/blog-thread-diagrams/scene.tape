# The agents view on one Claude Code agent whose last reply has a Mermaid block and a TML block.
WaitFor panes 1 10s
RenameWindow "api"
Run "claude-demo reply.md 'The retry test is flaky on CI. Find out why and fix it.'"
Sleep 1500ms
Press "ctrl+b i"
Sleep 3000ms
# Focus the thread, and go to its end.
Press "tab"
Sleep 500ms
Press "G"
Sleep 300ms
Sleep 900ms
Action screenshot_screen
Sleep 1500ms
