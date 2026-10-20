# Program status: three panes, each with a program that reports its state.
# report (setup.sh) runs tuios status, which writes OSC 7501 with
# tuios.dev/progstatus, then stays running, so its report stays.
WaitFor panes 1 10s
RenameWindow "build"
Run "report working --app build --msg 'Compiling 214 of 530 files' --progress 40"
Sleep 400ms
Action split_vertical
Sleep 400ms
RenameWindow "deploy"
Run "report blocked --kind permission --app deploy --msg 'Approve deploy to production?'"
Sleep 400ms
Action split_horizontal
Sleep 400ms
RenameWindow "tests"
Run "report done --app go-test --msg '412 passed'"
Sleep 4500ms
Action screenshot_screen
Sleep 1500ms
