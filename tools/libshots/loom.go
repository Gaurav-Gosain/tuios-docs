package main

import (
	"fmt"
	"image/color"
	"os"
	"path/filepath"

	"tuios.dev/loom"
	"tuios.dev/shot"
	"tuios.dev/tml"
)

func init() { register("loom", drawLoom) }

const loomDir = "tools/libshots/scenes/loom"

func drawLoom(g *gen) error {
	read := func(name string) ([]byte, error) { return os.ReadFile(filepath.Join(loomDir, name)) }

	dash, err := read("dashboard.tml")
	if err != nil {
		return err
	}
	if err := g.tmlSource("loom/hero", dash, 72, 17, pic{look: window, title: "loom"},
		opts{frame: true, title: "go test ./...", owner: "from api"}); err != nil {
		return err
	}
	if err := g.runExample("loom/quickstart", "loom-quickstart", 58); err != nil {
		return err
	}
	if err := g.tmlSource("loom/bubbletea", dash, 72, 18, pic{look: card}, opts{}); err != nil {
		return err
	}

	// Flex: a row of buttons wraps when it is too narrow.
	buttons, err := read("buttons.tml")
	if err != nil {
		return err
	}
	for _, w := range []int{80, 40} {
		if err := g.tmlSource(fmt.Sprintf("loom/wrap-%d", w), buttons, w, 0, pic{look: card}, opts{}); err != nil {
			return err
		}
	}

	// view.band: one document at three widths.
	band, err := read("band.tml")
	if err != nil {
		return err
	}
	for _, w := range []int{130, 90, 50} {
		if err := g.tmlSource(fmt.Sprintf("loom/band-%d", w), band, w, 0, pic{look: card}, opts{}); err != nil {
			return err
		}
	}

	// Colour depth: the same document with the default palette at each
	// depth, on a dark terminal.
	testRun, err := os.ReadFile(filepath.Join(tmlDir, "test-run.tml"))
	if err != nil {
		return err
	}
	for _, d := range loom.Depths() {
		d := d
		title := map[loom.Depth]string{loom.TrueColor: "truecolor", loom.Color256: "256 colours", loom.Color16: "16 colours", loom.ASCII: "ASCII"}[d]
		if err := g.tmlSource("loom/depth-"+d.String(), testRun, 100, 26, pic{look: window, title: title},
			opts{themes: []theme{dark}, palette: func(theme) *loom.Palette { return loom.DefaultPalette(d) }}); err != nil {
			return err
		}
	}

	// Damage: after a patch in which a skipped test ran and passed, the
	// cells loom repainted. The failures, and so the table, stay the same.
	ops, err := tml.DecodePatch([]byte(`[{"op": "replace", "path": "/passed", "value": 413},
		{"op": "replace", "path": "/skipped", "value": 8}]`), nil)
	if err != nil {
		return err
	}
	var damage []loom.Rect
	if err := g.tmlSource("loom/damage", dash, 72, 18, pic{look: card}, opts{
		prep: func(s *loom.Surface) error {
			s.Damage() // forget the first full render
			if err := s.Patch(ops); err != nil {
				return err
			}
			s.Render(72, 18)
			damage = s.Damage()
			return nil
		},
		after: func(_ *loom.Surface, grid *shot.Grid, t theme) { mark(grid, damage, t) },
	}); err != nil {
		return err
	}

	// Keys and the mouse: a table after down, down and s; tabs after a
	// click on the third tab.
	table, err := os.ReadFile(filepath.Join(tmlDir, "table.tml"))
	if err != nil {
		return err
	}
	if err := g.tmlSource("loom/keys", table, 64, 0, pic{look: card}, opts{
		prep: func(s *loom.Surface) error {
			for _, k := range []string{"down", "down", "s"} {
				if _, err := s.Key(k); err != nil {
					return err
				}
			}
			return nil
		},
	}); err != nil {
		return err
	}
	tabs, err := os.ReadFile(filepath.Join(tmlDir, "tabs.tml"))
	if err != nil {
		return err
	}
	return g.tmlSource("loom/click", tabs, 50, 0, pic{look: card}, opts{
		prep: func(s *loom.Surface) error {
			_, err := s.Mouse(loom.Mouse{X: 25, Y: 0, Button: loom.MouseLeft, Action: loom.Press})
			return err
		},
	})
}

// mark tints the cells inside rects toward the theme's warning colour.
func mark(grid *shot.Grid, rects []loom.Rect, t theme) {
	c, _ := t.roles["warning"].(color.RGBA)
	tint := shot.Color(c)
	for _, r := range rects {
		for y := r.Min.Y; y < r.Max.Y && y < grid.Rows; y++ {
			for x := r.Min.X; x < r.Max.X && x < grid.Cols; x++ {
				cell := &grid.Cells[y][x]
				cell.BG = blend(cell.BG, tint, 0.35)
				cell.BGDefault = false
			}
		}
	}
}

func blend(a, b shot.Color, t float64) shot.Color {
	l := func(x, y uint8) uint8 { return uint8(float64(x) + (float64(y)-float64(x))*t + 0.5) }
	return shot.Color{R: l(a.R, b.R), G: l(a.G, b.G), B: l(a.B, b.B), A: 255}
}
