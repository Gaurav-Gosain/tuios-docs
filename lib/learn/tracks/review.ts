import { on, opened, via } from "../matchers";
import type { Track } from "../types";

/**
 * Read a project the way a reviewer does: find it in the rail, open a file,
 * then review the change in the repository and leave a note on it. The rail
 * lists the fake shell's files, and the review reads its git repository.
 */
export const review: Track = {
  id: "review",
  title: "Files and review",
  blurb: "Walk a project in the rail, open a file, and review its change.",
  audience: "Code reviewers",
  group: "build",
  minutes: 5,
  next: ["ship", "agents"],
  setup: [
    { command: "newWindow", wait: 300 },
    { command: "mode", args: ["terminal"] },
  ],
  steps: [
    {
      id: "cd",
      title: "Go to the project",
      note: "A small Go project. It has a change in it.",
      keys: [{ text: "cd projects/hello" }, "enter"],
      needs: "terminal",
      done: on("shell.cwd", (e) =>
        String(e.data?.cwd ?? "").endsWith("/projects/hello"),
      ),
      hint: "Type cd projects/hello and press enter.",
      learned: "cd",
    },
    {
      id: "rail",
      title: "Open the rail",
      note: "The files section lists the folder of this pane.",
      keys: ["ctrl+b", "b"],
      done: via(["prefix_toggle_sidebar"], opened("sidebar")),
      hint: "ctrl+b, then b. The rail opens on the left.",
      learned: "rail",
    },
    {
      id: "explore",
      title: "Give the rail the keys",
      note: "ctrl+b e moves the keyboard into the rail. The same keys bring it back.",
      keys: ["ctrl+b", "e"],
      done: opened("railFocus"),
      hint: "ctrl+b, then e. The badge says SIDEBAR.",
      learned: "explore",
    },
    {
      id: "walk",
      title: "Walk to greet.go",
      note: "j moves down and k moves up. The lit row is the cursor.",
      keys: ["j", "j", "j", "j", "j", "j"],
      done: on("files", (e) =>
        String(
          (e.data?.to as { cursor?: string } | undefined)?.cursor ?? "",
        ).endsWith("/greet.go"),
      ),
      hint: "Press j until greet.go is lit. ctrl+b f finds a file by name.",
      learned: "walk the files",
    },
    {
      id: "open",
      title: "Open the file",
      note: "Here enter opens it in a viewer. On your machine, enter copies the path and shift+enter opens your editor.",
      keys: ["enter"],
      done: via(["file_open"], on("window.open")),
      hint: "With greet.go lit, press enter. q closes the viewer.",
      learned: "open a file",
    },
    {
      id: "review",
      title: "Review the change",
      note: "ctrl+b v shows what changed in the repository of this pane.",
      keys: ["ctrl+b", "v"],
      done: opened("review"),
      hint: "ctrl+b, then v. The review fills the screen.",
      learned: "review",
    },
    {
      id: "hunk",
      title: "Jump to the next hunk",
      note: "A hunk is one block of changed lines. ] goes to the next hunk, [ to the one before. } and { go by file.",
      keys: ["]"],
      done: on("review.move"),
      hint: "Press ]. The cursor moves to the next block of changes.",
      learned: "next hunk",
    },
    {
      id: "note",
      title: "Leave a note",
      note: "c writes a note on the line under the cursor. enter saves it.",
      keys: ["c", { text: "Add a test" }, "enter"],
      done: on("review.note", (e) => e.data?.action === "add"),
      hint: "Press c, type a few words, then press enter.",
      learned: "review note",
    },
    {
      id: "send",
      title: "Send your notes",
      note: "On your machine, S sends the notes to the agent in this pane. esc closes the review.",
      keys: ["S"],
      done: on("review.send"),
      hint: "Press S, shift and s. The dock says what happens.",
      learned: "send notes",
    },
  ],
};
