package main

import (
	"fmt"
	"image"
	"image/color"
	"os"
	"path/filepath"

	"golang.org/x/image/font/sfnt"
	"tuios.dev/loom"
	"tuios.dev/plot"
	"tuios.dev/shot"
	"tuios.dev/tml"
)

// gen holds what every picture needs: the font, the output folder and the
// sizes written so far.
type gen struct {
	out     string
	regular []byte
	bold    []byte
	face    *sfnt.Font
	sizes   map[string]size
}

func newGen(out, regular, bold string) (*gen, error) {
	r, err := os.ReadFile(regular)
	if err != nil {
		return nil, err
	}
	b, err := os.ReadFile(bold)
	if err != nil {
		return nil, err
	}
	face, err := sfnt.Parse(r)
	if err != nil {
		return nil, fmt.Errorf("parse %s: %w", regular, err)
	}
	if err := os.MkdirAll(out, 0o755); err != nil {
		return nil, err
	}
	return &gen{out: out, regular: r, bold: b, face: face, sizes: map[string]size{}}, nil
}

// look is one way to dress a picture.
type look int

const (
	// card is the cells with a margin of their own ground, and no background around
	// it: for the small pictures of one component.
	card look = iota
	// window is a window with a title bar on a soft gradient: for a page's
	// main picture.
	window
)

// theme is one of the two site themes: the colours of a loom palette and
// of the terminal the picture shows.
type theme struct {
	suffix string // "" for dark, "-light" for light
	roles  map[string]color.Color
	term   *shot.Palette
	wash   [2]shot.Color // the gradient behind a window
}

func hex(v uint32) color.RGBA {
	return color.RGBA{R: uint8(v >> 16), G: uint8(v >> 8), B: uint8(v), A: 255}
}

func mixc(a, b color.RGBA, t float64) color.RGBA {
	l := func(x, y uint8) uint8 { return uint8(float64(x) + (float64(y)-float64(x))*t + 0.5) }
	return color.RGBA{l(a.R, b.R), l(a.G, b.G), l(a.B, b.B), 255}
}

// roles builds the TML roles from a Catppuccin flavour, the colours the
// site itself uses.
func roles(panel, canvas, surface, card, fg, dim, mute, accent, bright, green, peach, red, blue, yellow, teal, pink, pill color.RGBA) map[string]color.Color {
	return map[string]color.Color{
		"canvas": canvas, "panel": panel, "surface": surface, "card": card,
		"fg": fg, "dim": dim, "mute": mute,
		"accent": accent, "accent-bright": bright,
		"success": green, "warning": peach, "error": red, "info": blue,
		"attention": yellow, "busy": teal,
		"edge":         mixc(panel, mute, 0.45),
		"accent-tint":  mixc(accent, panel, 0.75),
		"success-tint": mixc(green, panel, 0.82),
		"warning-tint": mixc(peach, panel, 0.80),
		"error-tint":   mixc(red, panel, 0.80),
		"series1":      blue, "series2": accent, "series3": green,
		"series4": peach, "series5": pink, "series6": yellow,
		loom.RoleTrack:  mixc(panel, mute, 0.30),
		loom.RoleCursor: surface,
		loom.RolePill:   pill,
		loom.RoleHeat1:  mixc(panel, blue, 0.22),
		loom.RoleHeat2:  mixc(panel, blue, 0.50),
		loom.RoleHeat3:  blue,
		loom.RoleHeat4:  mixc(blue, accent, 0.55),
		loom.RoleHeat5:  accent,
	}
}

func termPalette(fg, bg color.RGBA, ansi [16]uint32) *shot.Palette {
	p := shot.XTermPalette()
	p.FG, p.BG = shot.Color(fg), shot.Color(bg)
	for i, v := range ansi {
		p.ANSI[i] = shot.Color(hex(v))
	}
	return p
}

// Catppuccin Mocha and Latte, the dark and light themes of the site. The
// ground is the colour of the site's code blocks, so a picture sits beside
// the code that drew it as its twin.
var (
	mochaANSI = [16]uint32{0x45475a, 0xf38ba8, 0xa6e3a1, 0xf9e2af, 0x89b4fa, 0xf5c2e7, 0x94e2d5, 0xbac2de,
		0x585b70, 0xf38ba8, 0xa6e3a1, 0xf9e2af, 0x89b4fa, 0xf5c2e7, 0x94e2d5, 0xa6adc8}
	latteANSI = [16]uint32{0x5c5f77, 0xd20f39, 0x40a02b, 0xdf8e1d, 0x1e66f5, 0xea76cb, 0x179299, 0xacb0be,
		0x6c6f85, 0xd20f39, 0x40a02b, 0xdf8e1d, 0x1e66f5, 0xea76cb, 0x179299, 0xbcc0cc}

	dark = theme{
		suffix: "",
		roles: roles(hex(0x181825), hex(0x11111b), hex(0x313244), hex(0x45475a),
			hex(0xcdd6f4), hex(0xbac2de), hex(0x7f849c), hex(0xcba6f7), hex(0xb4befe),
			hex(0xa6e3a1), hex(0xfab387), hex(0xf38ba8), hex(0x89b4fa), hex(0xf9e2af), hex(0x94e2d5), hex(0xf5c2e7),
			hex(0x1e1e2e)),
		term: termPalette(hex(0xcdd6f4), hex(0x181825), mochaANSI),
		wash: [2]shot.Color{shot.Color(hex(0x3b3357)), shot.Color(hex(0x26375a))},
	}
	light = theme{
		suffix: "-light",
		roles: roles(hex(0xe6e9ef), hex(0xdce0e8), hex(0xccd0da), hex(0xbcc0cc),
			hex(0x4c4f69), hex(0x5c5f77), hex(0x8c8fa1), hex(0x8839ef), hex(0x7287fd),
			hex(0x40a02b), hex(0xfe640b), hex(0xd20f39), hex(0x1e66f5), hex(0xdf8e1d), hex(0x179299), hex(0xea76cb),
			hex(0xeff1f5)),
		term: termPalette(hex(0x4c4f69), hex(0xe6e9ef), latteANSI),
		wash: [2]shot.Color{shot.Color(hex(0xd9cdf3)), shot.Color(hex(0xc9d8f5))},
	}
	themes = []theme{dark, light}
)

// palette is the loom palette of a theme at truecolor.
func (t theme) palette() *loom.Palette { return loom.NewPalette(loom.TrueColor, t.roles) }

// pic is one picture to write: the cells, and how to dress them.
type pic struct {
	look  look
	title string
}

// write renders a grid in a theme and records its size under name. The
// file is OUT/NAME.png for the dark theme and OUT/NAME-light.png for the
// light one.
func (g *gen) write(name string, t theme, grid *shot.Grid, p pic) error {
	if miss := g.missing(grid); len(miss) > 0 {
		return fmt.Errorf("%s: the font has no glyph for %q", name, string(miss))
	}
	f := &shot.Frame{
		Font:        shot.Font{Data: g.regular},
		BoldFont:    shot.Font{Data: g.bold},
		Scale:       2,
		Transparent: true,
	}
	switch p.look {
	case card:
		f.Mode = shot.FramePlain
	case window:
		f.Mode = shot.FrameWindow
		f.Title = p.title
		f.Padding = 28
		f.Radius = 10
		f.Shadow = true
		f.Transparent = false
		f.WashStart, f.WashEnd = t.wash[0], t.wash[1]
		f.Accent = t.term.ANSI[5]
		f.Controls = shot.ControlsMacOS
	}
	png, err := shot.Render(shot.FormatPNG, grid, f)
	if err != nil {
		return err
	}
	path := filepath.Join(g.out, filepath.FromSlash(name)+t.suffix+".png")
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(path, png, 0o644); err != nil {
		return err
	}
	w, h := pngSize(png)
	sz := g.sizes[name]
	sz.W, sz.H = w/2, h/2
	if t.suffix != "" {
		sz.Light = true
	}
	g.sizes[name] = sz
	return nil
}

func pngSize(b []byte) (int, int) {
	if len(b) < 24 {
		return 0, 0
	}
	be := func(p []byte) int { return int(p[0])<<24 | int(p[1])<<16 | int(p[2])<<8 | int(p[3]) }
	return be(b[16:20]), be(b[20:24])
}

// missing lists the runes of a grid that the font lacks, so no picture
// falls back to shot's built-in face.
func (g *gen) missing(grid *shot.Grid) []rune {
	seen := map[rune]bool{}
	var miss []rune
	var b sfnt.Buffer
	for _, row := range grid.Cells {
		for _, c := range row {
			for _, r := range c.Cluster {
				if r <= ' ' || seen[r] {
					continue
				}
				seen[r] = true
				if i, err := g.face.GlyphIndex(&b, r); err != nil || i == 0 {
					miss = append(miss, r)
				}
			}
		}
	}
	return miss
}

// toGrid turns a loom buffer into shot cells, with the terminal colours of
// a theme for the cells that have none.
func toGrid(buf *loom.Buffer, p *shot.Palette) *shot.Grid {
	g := shot.NewGrid(buf.Width(), buf.Height(), p.FG, p.BG)
	for y := 0; y < buf.Height(); y++ {
		for x := 0; x < buf.Width(); x++ {
			c := buf.Cell(x, y)
			fg, bg := p.Resolve(c.Fg, p.FG), p.Resolve(c.Bg, p.BG)
			bgDefault := c.Bg == nil
			if c.Reverse {
				fg, bg, bgDefault = bg, fg, false
			}
			cell := shot.Cell{
				Cluster: c.Content, Width: uint8(max(0, min(c.Width, 2))),
				FG: fg, BG: bg, BGDefault: bgDefault,
				Bold: c.Bold, Faint: c.Faint, Italic: c.Italic, Strike: c.Strike,
			}
			if c.Underline {
				cell.Underline = shot.UnderlineSingle
			}
			if cell.Cluster == " " {
				cell.Cluster = ""
			}
			g.Cells[y][x] = cell
		}
	}
	return g
}

// plotGrid turns a plot grid into shot cells, with each role coloured by a
// loom palette.
func plotGrid(pg *plot.Grid, pal *loom.Palette, p *shot.Palette) *shot.Grid {
	bg := p.BG
	if c := pal.Color("panel"); c != nil {
		bg = p.Resolve(c, p.BG)
	}
	g := shot.NewGrid(pg.W, pg.H, p.FG, bg)
	for y := 0; y < pg.H; y++ {
		for x := 0; x < pg.W; x++ {
			c := pg.At(x, y)
			cell := shot.Cell{Cluster: c.Text, Width: c.Width, FG: p.FG, BG: bg, BGDefault: true, Bold: c.Bold}
			if col := pal.Color(string(c.Role)); col != nil {
				cell.FG = p.Resolve(col, p.FG)
			}
			if c.Bg != plot.None {
				if col := pal.Color(string(c.Bg)); col != nil {
					cell.BG, cell.BGDefault = p.Resolve(col, bg), false
				}
			}
			if cell.Cluster == " " {
				cell.Cluster = ""
			}
			g.Cells[y][x] = cell
		}
	}
	return g
}

// surface checks a document and makes a loom surface for it.
func surface(src []byte, pal *loom.Palette, mode *plot.Mode) (*loom.Surface, error) {
	doc, problems, err := tml.Check(src, nil)
	if err != nil {
		return nil, fmt.Errorf("%v %v", err, problems)
	}
	for _, p := range problems {
		if p.Severity == tml.SevError {
			return nil, fmt.Errorf("%v", p)
		}
	}
	return loom.New(doc, &loom.Options{Palette: pal, Charts: mode, CellAspect: 2.0})
}

// opts change how a document is drawn. The zero value draws it in both
// themes at truecolor with braille charts.
type opts struct {
	themes  []theme                   // nil means both
	palette func(theme) *loom.Palette // nil means the theme's truecolor palette
	mode    *plot.Mode
	// frame draws the frame tuios puts around a popup, with this title and
	// owner label. The surface draws inside it.
	frame        bool
	title, owner string
	// prep acts on the surface after a first render, such as press keys or
	// apply a patch.
	prep func(*loom.Surface) error
	// after changes the cells, such as to mark what a patch repainted.
	after func(*loom.Surface, *shot.Grid, theme)
}

// tmlShot draws a TML file at w by h cells in both themes. A height of 0
// trims the blank rows at the bottom.
func (g *gen) tmlShot(name, file string, w, h int, p pic) error {
	src, err := os.ReadFile(file)
	if err != nil {
		return err
	}
	return g.tmlSource(name, src, w, h, p, opts{})
}

// tmlSource draws a document as o says.
func (g *gen) tmlSource(name string, src []byte, w, h int, p pic, o opts) error {
	ts := o.themes
	if ts == nil {
		ts = themes
	}
	for _, t := range ts {
		pal := t.palette()
		if o.palette != nil {
			pal = o.palette(t)
		}
		s, err := surface(src, pal, o.mode)
		if err != nil {
			return fmt.Errorf("%s: %w", name, err)
		}
		rh := h
		if rh == 0 {
			rh = 60
		}
		iw, ih := w, rh
		if o.frame {
			iw, ih = w-4, rh-2
		}
		s.Render(iw, ih)
		if o.prep != nil {
			if err := o.prep(s); err != nil {
				return fmt.Errorf("%s: %w", name, err)
			}
		}
		grid := toGrid(s.Render(iw, ih), t.term)
		if o.frame {
			fb := loom.NewBuffer(w, rh)
			loom.Frame(fb, image.Rect(0, 0, w, rh), o.title, o.owner, pal, true)
			outer := toGrid(fb, t.term)
			for y := 0; y < grid.Rows; y++ {
				for x := 0; x < grid.Cols; x++ {
					outer.Cells[y+1][x+2] = grid.Cells[y][x]
				}
			}
			grid = outer
		}
		if o.after != nil {
			o.after(s, grid, t)
		}
		if h == 0 {
			trim(grid)
		}
		if err := g.write(name, t, grid, p); err != nil {
			return err
		}
	}
	return nil
}

// trim drops the blank rows at the bottom of a grid: rows with no text
// whose ground is the ground of the last row.
func trim(g *shot.Grid) {
	ground := g.Cells[g.Rows-1][0].BG
	for g.Rows > 1 {
		blank := true
		for _, c := range g.Cells[g.Rows-1] {
			if c.Cluster != "" || c.BG != ground || c.Underline != shot.UnderlineNone {
				blank = false
				break
			}
		}
		if !blank {
			return
		}
		g.Rows--
		g.Cells = g.Cells[:g.Rows]
	}
}
