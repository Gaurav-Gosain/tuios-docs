package main

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"tuios.dev/shot"
	"tuios.dev/vt"
)

// runExample runs the program in examples/DIR and draws what it printed in
// a terminal of cols columns, under the command line that ran it. The
// picture is the program's real output, read by vt and drawn by shot. It is
// drawn in the dark theme only: the programs pick their own colours.
func (g *gen) runExample(name, dir string, cols int) error {
	cmd := exec.Command("go", "run", "./examples/"+dir)
	cmd.Dir = "tools/libshots"
	cmd.Env = append(os.Environ(), "GOWORK=off")
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	out, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("%s: %v: %s", dir, err, stderr.String())
	}
	return g.terminal(name, "$ go run .\n"+string(out), cols, dir)
}

// terminal draws text with escape sequences as a terminal of cols columns
// shows it, as tall as the text.
func (g *gen) terminal(name, text string, cols int, title string) error {
	text = strings.TrimRight(text, "\n")
	rows := strings.Count(text, "\n") + 1
	term := vt.NewEmulator(cols, rows)
	defer term.Close()
	term.Write([]byte(strings.ReplaceAll(text, "\n", "\r\n")))
	t := dark
	grid := shot.FromScreen(term, t.term)
	return g.write(name, t, grid, pic{look: window, title: title})
}
