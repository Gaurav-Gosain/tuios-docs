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
	return g.runExampleIn(name, dir, cols, []theme{dark})
}

// runExampleIn is runExample for a program that writes only the 16 ANSI
// colours, which follow the terminal's theme: it draws the output in each of
// ts.
func (g *gen) runExampleIn(name, dir string, cols int, ts []theme) error {
	cmd := exec.Command("go", "run", "./examples/"+dir)
	cmd.Dir = "tools/libshots"
	cmd.Env = append(os.Environ(), "GOWORK=off")
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	out, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("%s: %v: %s", dir, err, stderr.String())
	}
	return g.terminalIn(name, "$ go run .\n"+string(out), cols, dir, ts)
}

// terminal draws text with escape sequences as a terminal of cols columns
// shows it, as tall as the text.
func (g *gen) terminal(name, text string, cols int, title string) error {
	return g.terminalIn(name, text, cols, title, []theme{dark})
}

// terminalIn is terminal in each of ts.
func (g *gen) terminalIn(name, text string, cols int, title string, ts []theme) error {
	text = strings.TrimRight(text, "\n")
	rows := strings.Count(text, "\n") + 1
	for _, t := range ts {
		term := vt.NewEmulator(cols, rows)
		term.Write([]byte(strings.ReplaceAll(text, "\n", "\r\n")))
		grid := shot.FromScreen(term, t.term)
		term.Close()
		if err := g.write(name, t, grid, pic{look: window, title: title}); err != nil {
			return err
		}
	}
	return nil
}
