import { closed, on, opened, seq } from "../matchers";
import type { Matcher, Track } from "../types";

/** A command line that matches and finished with status 0. */
function ranOk(pattern: RegExp): Matcher {
  return on(
    "shell.command",
    (e) => pattern.test(String(e.data?.line ?? "")) && e.data?.exitCode === 0,
  );
}

/**
 * From a branch to a pull request: make a worktree of the project, change a
 * file in it, review the change, commit it and open a pull request. The
 * worktree and the commit are real in the fake repository. The push and the
 * pull request print what a real machine prints, and nothing leaves the tab.
 */
export const ship: Track = {
  id: "ship",
  title: "Ship a change",
  blurb: "Make a worktree, change a file, review it, and open a pull request.",
  audience: "Shippers",
  group: "build",
  minutes: 5,
  next: ["review", "agents"],
  setup: [
    { command: "newWindow", wait: 300 },
    { command: "mode", args: ["terminal"] },
    { command: "type", args: ["cd projects/hello\r"], wait: 300 },
  ],
  steps: [
    {
      id: "worktree",
      title: "Make a worktree",
      note: "A worktree is a second checkout of the project on its own branch.",
      keys: ["ctrl+b", "U"],
      done: opened("worktree"),
      hint: "ctrl+b, then U (shift and u). A dialog asks for a branch.",
      learned: "new worktree",
    },
    {
      id: "branch",
      title: "Name the branch",
      note: "tuios makes the branch and the folder, and opens a pane in it.",
      keys: [{ text: "shout" }, "enter"],
      done: on("worktree"),
      hint: "Type a branch name, such as shout, and press enter.",
      learned: "branch",
    },
    {
      id: "list",
      title: "List the worktrees",
      note: "The new pane is in the worktree. The prompt shows its branch.",
      keys: [{ text: "git worktree list" }, "enter"],
      needs: "terminal",
      done: ranOk(/^git worktree list/),
      hint: "Type git worktree list and press enter.",
      learned: "git worktree list",
    },
    {
      id: "change",
      title: "Change a file",
      note: "An agent does this part on a real machine. Here you add a line.",
      keys: [{ text: 'echo "Ship it." >> README.md' }, "enter"],
      needs: "terminal",
      done: ranOk(/>>\s*README\.md/),
      hint: 'Type echo "Ship it." >> README.md and press enter.',
      learned: "change a file",
    },
    {
      id: "review",
      title: "Review the change",
      note: "ctrl+b v shows the change against main. q closes it.",
      keys: ["ctrl+b", "v", "q"],
      done: seq(opened("review"), closed("review")),
      hint: "ctrl+b, then v. Look at the change, then press q.",
      learned: "review",
    },
    {
      id: "steps",
      title: "See the ship steps",
      note: "tuios ship lists the steps from this worktree to a merged change.",
      keys: [{ text: "tuios ship" }, "enter"],
      needs: "terminal",
      done: ranOk(/^tuios ship$/),
      hint: "Type tuios ship and press enter.",
      learned: "tuios ship",
    },
    {
      id: "commit",
      title: "Commit the change",
      note: "tuios ship commit commits every change on the branch.",
      keys: [{ text: "tuios ship commit -m Docs" }, "enter"],
      needs: "terminal",
      done: ranOk(/^tuios ship commit/),
      hint: "Type tuios ship commit -m Docs and press enter. -m is the message.",
      learned: "ship commit",
    },
    {
      id: "pr",
      title: "Open a pull request",
      note: "tuios ship pr pushes the branch and opens a pull request. In the demo, nothing leaves the tab.",
      keys: [{ text: "tuios ship pr" }, "enter"],
      needs: "terminal",
      done: ranOk(/^tuios ship pr/),
      hint: "Type tuios ship pr and press enter.",
      learned: "ship pr",
    },
  ],
};
