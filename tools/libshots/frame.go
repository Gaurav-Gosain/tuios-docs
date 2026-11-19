package main

import (
	"bytes"
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"tuios.dev/shot"
	"tuios.dev/vt"
)

// runFrame is "libshots frame": it draws a screen that tuios captured as
// ANSI (screenshot.format = "ansi") in a window card, as a PNG at scale 2.
// scripts/docs-media.sh runs it on every shot a scene takes, so the docs
// shots of tuios wear the same card as the library pictures.
//
// tuios itself draws a capture of the whole screen as a plain card, since
// the screen is not a window. On a docs page the picture stands for the
// terminal that tuios runs in, so the card gets the window controls and
// the title of that terminal.
func runFrame(args []string) error {
	fs := flag.NewFlagSet("frame", flag.ExitOnError)
	in := fs.String("in", "", "the ANSI capture")
	out := fs.String("out", "", "the PNG to write")
	cols := fs.Int("cols", 0, "the columns of the capture")
	rows := fs.Int("rows", 0, "the rows of the capture")
	isLight := fs.Bool("light", false, "draw the light card")
	title := fs.String("title", "tuios", "the title of the card")
	regular := fs.String("font", "", "the regular face, a TTF or OTF file")
	bold := fs.String("bold", "", "the bold face of the same family")
	fallback := fs.String("fallback", "", "more font files for glyphs the main face lacks, split by the path list separator")
	_ = fs.Parse(args)
	if *in == "" || *out == "" || *cols <= 0 || *rows <= 0 || *regular == "" || *bold == "" {
		return fmt.Errorf("usage: libshots frame -in A.ans -out A.png -cols N -rows N -font REGULAR -bold BOLD [-light]")
	}
	data, err := os.ReadFile(*in)
	if err != nil {
		return err
	}
	reg, err := os.ReadFile(*regular)
	if err != nil {
		return err
	}
	bld, err := os.ReadFile(*bold)
	if err != nil {
		return err
	}
	t := dark
	if *isLight {
		t = light
	}
	term := vt.NewEmulator(*cols, *rows)
	// The capture ends each row with a bare line feed.
	_, _ = term.Write(bytes.ReplaceAll(bytes.TrimRight(data, "\n"), []byte("\n"), []byte("\r\n")))
	grid := shot.FromScreen(term, t.term)
	_ = term.Close()
	f := &shot.Frame{Font: shot.Font{Data: reg}, BoldFont: shot.Font{Data: bld}, Scale: 2}
	for _, path := range filepath.SplitList(*fallback) {
		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		f.Fallback = append(f.Fallback, shot.Font{Data: data})
	}
	dressWindow(f, t, *title)
	// A glyph no face has would be drawn as a box. Stop instead, so the
	// scene gets a fallback font or loses the character.
	if missing, err := shot.MissingGlyphs(grid, f); err != nil {
		return err
	} else if len(missing) > 0 {
		return fmt.Errorf("%s: no font has a glyph for %q", *in, string(missing))
	}
	png, err := shot.Render(shot.FormatPNG, grid, f)
	if err != nil {
		return err
	}
	return os.WriteFile(*out, png, 0o644)
}
