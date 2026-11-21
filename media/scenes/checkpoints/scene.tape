# List the checkpoints of api, then read what turn 2 changed.
Run "tuios checkpoint list -w api"
Sleep 1200ms
Run "tuios checkpoint diff -w api 2 --context 1"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
