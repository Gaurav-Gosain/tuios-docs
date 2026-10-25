# The api pane asks a question with tml show --wait, and it opens as a
# popup. A surface does not take the focus, so the tape focuses it by its
# window name. Then ctrl+b t f docks it as a tiled pane, and api keeps
# waiting for the answer.
WaitFor panes 1 10s
RenameWindow "shell"
Action split_vertical
Sleep 400ms
RenameWindow "api"
Run "answer=$(tuios tml show deploy.tml --wait --name deploy --width 60 --height 7)"
Sleep 2500ms
Focus "from api · deploy"
Sleep 600ms
Press "ctrl+b t f"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
