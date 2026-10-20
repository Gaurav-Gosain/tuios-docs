package main

// The pictures of the smaller library pages: vt, shot, swatch and
// progstatus.

import (
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"tuios.dev/progstatus"
	"tuios.dev/shot"
	"tuios.dev/shot/mosaic"
	"tuios.dev/swatch"
	"tuios.dev/swatch/termconfig"
)

func init() {
	register("vt", drawVT)
	register("shot", drawShot)
	register("swatch", drawSwatch)
	register("progstatus", drawProgstatus)
}

// vtDemo is what a program might print: colours, attributes, box drawing,
// a carriage return and an erase. It uses only the 16 ANSI colours, so the
// screen follows each theme.
func vtDemo() string {
	const inner = 32
	box := func(text string, visible int) string {
		return "\x1b[34m│\x1b[0m" + text + strings.Repeat(" ", inner-visible) + "\x1b[34m│\x1b[0m\r\n"
	}
	var b strings.Builder
	b.WriteString("\x1b[1;35m❯\x1b[0m go test ./...\r\n")
	b.WriteString("\x1b[32mok  \x1b[0m tuios.dev/vt        \x1b[2m12.1s\x1b[0m\r\n")
	b.WriteString("\x1b[32mok  \x1b[0m tuios.dev/shot       \x1b[2m0.8s\x1b[0m\r\n")
	b.WriteString("\x1b[31mFAIL\x1b[0m tuios.dev/loom       \x1b[2m2.2s\x1b[0m\r\n\r\n")
	b.WriteString("\x1b[34m╭─ attributes " + strings.Repeat("─", inner-13) + "╮\x1b[0m\r\n")
	b.WriteString(box(" \x1b[1mbold\x1b[0m \x1b[3mitalic\x1b[0m \x1b[4munderline\x1b[0m \x1b[9mstrike\x1b[0m", 29))
	b.WriteString(box(" \x1b[7m reverse \x1b[0m \x1b[2mfaint\x1b[0m \x1b[4:3mcurly\x1b[0m", 22))
	b.WriteString("\x1b[34m╰" + strings.Repeat("─", inner) + "╯\x1b[0m\r\n\r\n")
	// A progress line drawn over itself: a carriage return and an erase.
	b.WriteString("\x1b[33mbuilding\x1b[0m [\x1b[36m" + strings.Repeat("█", 14) + "\x1b[0m" + strings.Repeat(" ", 8) + "] 64%")
	b.WriteString("\r\x1b[2K\x1b[33mlinking \x1b[0m [\x1b[36m" + strings.Repeat("█", 20) + "\x1b[0m  ] 91%\r\n")
	for i := 0; i < 8; i++ {
		fmt.Fprintf(&b, "\x1b[%d;%dm  ", 30+i, 40+i)
	}
	for i := 0; i < 8; i++ {
		fmt.Fprintf(&b, "\x1b[%d;%dm  ", 90+i, 100+i)
	}
	b.WriteString("\x1b[0m")
	return b.String()
}

func drawVT(g *gen) error {
	if err := g.terminalIn("vt/hero", vtDemo(), 40, "vt.NewEmulator(40, 12)", themes); err != nil {
		return err
	}
	return g.runExampleIn("vt/quickstart", "vt-quickstart", 44, themes)
}

func drawShot(g *gen) error {
	// The example program of the page writes screen.png and screen.svg. The
	// picture on the page is that file, as it wrote it.
	work, err := os.MkdirTemp("", "libshots-shot")
	if err != nil {
		return err
	}
	defer os.RemoveAll(work)
	cmd := exec.Command("go", "run", "./examples/shot-quickstart", work)
	cmd.Dir = "tools/libshots"
	cmd.Env = append(os.Environ(), "GOWORK=off")
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("shot-quickstart: %v: %s", err, out)
	}
	f, err := os.Open(filepath.Join(work, "screen.png"))
	if err != nil {
		return err
	}
	img, err := png.Decode(f)
	f.Close()
	if err != nil {
		return err
	}
	if err := g.writeImage("shot/quickstart", "", img); err != nil {
		return err
	}
	svg, err := os.ReadFile(filepath.Join(work, "screen.svg"))
	if err != nil {
		return err
	}
	// The SVG goes next to the WebP files as it is.
	if err := os.MkdirAll(filepath.Join(g.out, "shot"), 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(g.out, "shot", "quickstart.svg"), svg, 0o644); err != nil {
		return err
	}

	// mosaic: the tuios icon as cells, in half blocks and in quadrants.
	icon, err := readPNG("public/tuios-icon.png")
	if err != nil {
		return err
	}
	for _, k := range []mosaic.Kind{mosaic.Half, mosaic.Quadrant} {
		if err := g.mosaicShot("shot/mosaic-"+k.String(), icon, k); err != nil {
			return err
		}
	}
	return nil
}

func readPNG(path string) (image.Image, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	return png.Decode(f)
}

// mosaicShot draws a picture as 16 rows of cells with mosaic, in both themes.
func (g *gen) mosaicShot(name string, img image.Image, k mosaic.Kind) error {
	const rows, cols = 16, 32
	ix := indexed(img)
	cellW, cellH := (ix.Width+cols-1)/cols, (ix.Height+rows-1)/rows
	cells := mosaic.Encode(ix, cellW, cellH, rows, cols, k, mosaic.TrueColor)
	for _, t := range themes {
		grid := shot.NewGrid(cols, rows, t.term.FG, t.term.BG)
		for i, c := range cells {
			if c.Clear {
				continue
			}
			cell := &grid.Cells[i/cols][i%cols]
			cell.Cluster = c.Glyph
			if c.Glyph == " " {
				cell.Cluster = ""
			}
			if c.Fg.A > 0 {
				cell.FG = shot.Color(c.Fg)
			}
			if c.Bg.A > 0 {
				cell.BG, cell.BGDefault = shot.Color(c.Bg), false
			}
		}
		if err := g.write(name, t, grid, pic{look: card}); err != nil {
			return err
		}
	}
	return nil
}

// indexed turns a picture into the paletted form mosaic reads, with its
// colours cut to 5 bits a channel. A pixel under half alpha is clear.
func indexed(img image.Image) mosaic.Indexed {
	b := img.Bounds()
	rgba := image.NewRGBA(b)
	draw.Draw(rgba, b, img, b.Min, draw.Src)
	ix := mosaic.Indexed{Width: b.Dx(), Height: b.Dy(), Pix: make([]uint16, b.Dx()*b.Dy())}
	seen := map[[3]uint8]uint16{}
	for y := 0; y < b.Dy(); y++ {
		for x := 0; x < b.Dx(); x++ {
			c := rgba.RGBAAt(b.Min.X+x, b.Min.Y+y)
			if c.A < 128 {
				continue
			}
			key := [3]uint8{c.R &^ 7, c.G &^ 7, c.B &^ 7}
			n, ok := seen[key]
			if !ok {
				ix.Palette = append(ix.Palette, color.RGBA{key[0], key[1], key[2], 255})
				n = uint16(len(ix.Palette))
				seen[key] = n
			}
			ix.Pix[y*ix.Width+x] = n
		}
	}
	return ix
}

func drawSwatch(g *gen) error {
	for _, f := range []string{"mocha.conf", "tokyo-night", "gruvbox-light.toml"} {
		data, err := os.ReadFile(filepath.Join("tools/libshots/scenes/swatch", f))
		if err != nil {
			return err
		}
		// snippet:begin swatch-termconfig
		p, format, err := termconfig.Parse(data)
		// snippet:end
		if err != nil {
			return fmt.Errorf("%s: %w", f, err)
		}
		title := strings.TrimSpace(strings.TrimPrefix(strings.SplitN(string(data), "\n", 2)[0], "#"))
		name := "swatch/" + strings.TrimSuffix(f, filepath.Ext(f))
		if err := g.write(name, dark, swatchGrid(p), pic{look: card}); err != nil {
			return err
		}
		e := g.sizes[name]
		e.Title = fmt.Sprintf("%s (read as %s)", title, format)
		g.sizes[name] = e
	}
	return nil
}

// swatchGrid draws a palette's roles and its ANSI colours on its own
// background.
func swatchGrid(p swatch.Palette) *shot.Grid {
	rgb := func(c color.Color) shot.Color {
		r, g, b, _ := c.RGBA()
		return shot.RGB(uint8(r>>8), uint8(g>>8), uint8(b>>8))
	}
	fg, bg := rgb(p.Foreground), rgb(p.Background)
	roles := []struct {
		name string
		c    color.Color
	}{
		{"Foreground", p.Foreground}, {"Cursor", p.Cursor}, {"Surface", p.Surface},
		{"Muted", p.Muted}, {"Accent", p.Accent}, {"Border", p.Border},
		{"Success", p.Success}, {"Warning", p.Warning}, {"Error", p.Error}, {"Info", p.Info},
	}
	const cols = 46
	grid := shot.NewGrid(cols, len(roles)/2+4, fg, bg)
	put := func(x, y int, s string, c shot.Color) {
		for _, r := range s {
			if x >= cols {
				return
			}
			grid.Cells[y][x].Cluster = string(r)
			grid.Cells[y][x].FG = c
			x++
		}
	}
	block := func(x, y, w int, c shot.Color) {
		for i := 0; i < w && x+i < cols; i++ {
			grid.Cells[y][x+i].BG, grid.Cells[y][x+i].BGDefault = c, false
		}
	}
	for i, r := range roles {
		x, y := (i%2)*23, i/2
		c := rgb(r.c)
		block(x, y, 2, c)
		put(x+3, y, r.name, fg)
		put(x+14, y, swatch.Hex(r.c), rgb(p.Muted))
	}
	y := len(roles)/2 + 1
	put(0, y, "ANSI 0-15", rgb(p.Muted))
	for i, c := range p.ANSI {
		block((i%8)*3, y+1+i/8, 3, rgb(c))
	}
	return grid
}

func drawProgstatus(g *gen) error {
	// The encoder writes each report, the parser reads it back, and the
	// store keeps the records. The picture shows the bytes and the records.
	var lines []string
	var store progstatus.Store
	for i, r := range []progstatus.Report{
		{State: progstatus.Working, App: "build", Msg: "Compiling", Progress: 40},
		{State: progstatus.Blocked, ID: "deploy", App: "deploy", Kind: progstatus.Permission, Msg: "Approve deploy to production?", Progress: progstatus.NoProgress},
		{State: progstatus.Done, ID: "test", App: "go-test", Msg: "412 passed", Progress: progstatus.NoProgress},
	} {
		seq := progstatus.Sequence(r)
		body := strings.TrimSuffix(strings.TrimPrefix(seq, "\x1b]7501;"), "\x1b\\")
		parsed, ok := progstatus.Parse([]byte(body), len(seq))
		if !ok {
			return fmt.Errorf("report %d did not parse", i)
		}
		store.Apply(parsed, int64(i+1)*1e9)
		lines = append(lines, "\x1b[2m"+strings.ReplaceAll(seq, "\x1b", "\\e")+"\x1b[0m")
	}
	lines = append(lines, "")
	for _, rec := range store.Records() {
		state := string(rec.State)
		role := map[string]string{"working": "34", "blocked": "33", "done": "32"}[state]
		pct := ""
		if rec.Progress >= 0 {
			pct = fmt.Sprintf(" %d%%", rec.Progress)
		}
		id := rec.ID
		if id == "" {
			id = "(root)"
		}
		lines = append(lines, fmt.Sprintf("%-8s \x1b[%sm%-8s\x1b[0m %-8s %s%s", id, role, state, rec.App, rec.Msg, pct))
	}
	sum, _ := progstatus.Summary(store.Records())
	lines = append(lines, "", fmt.Sprintf("summary: \x1b[1m%s\x1b[0m from %s", sum.State, sum.App))
	return g.terminalIn("progstatus/records", strings.Join(lines, "\n"), 92, "progstatus", themes)
}
