package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"image/png"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"

	"github.com/charmbracelet/x/ansi"
	"tuios.dev/sketch"
	"tuios.dev/sketch/raster"
	"tuios.dev/sketch/text"
)

func init() { register("sketch", drawSketch) }

const sketchDir = "tools/libshots/scenes/sketch"

// sketchThemes are the sketch themes that match the site: Catppuccin Mocha
// on the dark site and Latte on the light one.
var sketchThemes = map[string]string{"": "catppuccin-mocha", "-light": "catppuccin-latte"}

// stripThemes are the themes of the theme strip.
var stripThemes = []string{"pele", "flexoki", "nord", "gruvbox", "rose-pine", "tokyo-night", "dracula", "solarized-light"}

func drawSketch(g *gen) error {
	// The gallery: one picture for each file in scenes/sketch/types. A new
	// diagram type is one more .mmd file there. Its first lines give the
	// title and the alt text:
	//
	//	%% title: Flowchart
	//	%% alt: A flowchart of a key press ...
	files, err := filepath.Glob(filepath.Join(sketchDir, "types", "*.mmd"))
	if err != nil {
		return err
	}
	sort.Strings(files)
	drawings := map[string]textDrawing{}
	for _, f := range files {
		src, err := os.ReadFile(f)
		if err != nil {
			return err
		}
		title, alt := header(string(src))
		if title == "" || alt == "" {
			return fmt.Errorf("%s: the first lines must be %%%% title: and %%%% alt:", f)
		}
		id := strings.TrimSuffix(filepath.Base(f), ".mmd")
		name := "sketch/types/" + id
		for suffix, theme := range sketchThemes {
			img, err := drawDiagram(string(src), theme)
			if err != nil {
				return fmt.Errorf("%s: %w", f, err)
			}
			if err := g.writeImage(name, suffix, img); err != nil {
				return err
			}
		}
		e := g.sizes[name]
		e.Title, e.Alt = title, alt
		g.sizes[name] = e

		// The text drawing, as tuios mermaid --format text prints it, and
		// the source, for the Source tab of the gallery.
		td, err := drawText(string(src), textCols)
		if err != nil {
			return fmt.Errorf("%s: text drawing: %w", f, err)
		}
		td.Title = title
		drawings[id] = td
		if err := writeSource(id, string(src)); err != nil {
			return err
		}
	}

	// The theme strip: one diagram in each of a few themes.
	strip, err := os.ReadFile(filepath.Join(sketchDir, "theme-strip.mmd"))
	if err != nil {
		return err
	}
	for _, th := range stripThemes {
		img, err := drawDiagram(string(strip), th)
		if err != nil {
			return err
		}
		name := "sketch/theme-" + th
		if err := g.writeImage(name, "", img); err != nil {
			return err
		}
		e := g.sizes[name]
		e.Title = th
		g.sizes[name] = e
	}

	// The examples of the page: real programs, run, with what they print
	// and the files they write.
	if err := g.sketchExamples(drawings); err != nil {
		return err
	}
	return writeDrawings(drawings)
}

// drawDiagram draws Mermaid source at twice its size in a named theme.
func drawDiagram(src, theme string) (image.Image, error) {
	svg, err := sketch.Render(src, sketch.RenderOptions{})
	if err != nil {
		return nil, err
	}
	th, ok := sketch.ThemeNamed(theme)
	if !ok {
		return nil, fmt.Errorf("no sketch theme %q", theme)
	}
	return raster.Draw(svg.Data, raster.Options{Scale: 2, Theme: th, Background: true, Readable: true})
}

// header reads the title and alt lines at the top of a Mermaid file.
func header(src string) (title, alt string) {
	for _, line := range strings.Split(src, "\n") {
		t := strings.TrimSpace(line)
		switch {
		case strings.HasPrefix(t, "%% title:"):
			title = strings.TrimSpace(strings.TrimPrefix(t, "%% title:"))
		case strings.HasPrefix(t, "%% alt:"):
			alt = strings.TrimSpace(strings.TrimPrefix(t, "%% alt:"))
		case strings.HasPrefix(t, "%%"):
		default:
			return title, alt
		}
	}
	return title, alt
}

// writeImage writes an image drawn at twice its size, as OUT/NAME.png plus
// the suffix, and records its size.
func (g *gen) writeImage(name, suffix string, img image.Image) error {
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		return err
	}
	path := filepath.Join(g.out, filepath.FromSlash(name)+suffix+".png")
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(path, buf.Bytes(), 0o644); err != nil {
		return err
	}
	b := img.Bounds()
	e := g.sizes[name]
	e.W, e.H = b.Dx()/2, b.Dy()/2
	if suffix != "" {
		e.Light = true
	}
	g.sizes[name] = e
	return nil
}

// textCols is the width of the text drawings in the gallery: the width of a
// common terminal. A drawing that does not fit is drawn at its full width, as
// tuios mermaid does, and the page lets it scroll.
const textCols = 80

// sketchTextPath is the file the gallery reads the text drawings from.
const sketchTextPath = "lib/sketch-text.json"

// sourceDir holds the sources of the gallery without their header lines, for
// the pages to include.
const sourceDir = "tools/libshots/snippets/sketch-types"

// textDrawing is one text drawing, split into runs of one style, so the page
// can colour it from the site's own palette in either theme.
type textDrawing struct {
	Title string `json:"title"`
	// Cols is the widest line in cells. Wide says the drawing did not fit
	// textCols and was drawn at its full width.
	Cols  int      `json:"cols"`
	Rows  int      `json:"rows"`
	Wide  bool     `json:"wide,omitempty"`
	Lines [][]tRun `json:"lines"`
}

// tRun is a run of text in one style: the ANSI colour (-1 for the default
// text colour, else 0 to 15), whether it is bold, the text, and the ANSI
// colour of the ground (-1 for none). sketch/text sets a ground on a half
// block that shows two colours, such as where two pie slices meet.
type tRun struct {
	FG   int
	Bold bool
	Text string
	BG   int
}

// MarshalJSON writes a run as [fg, bold, text], with the ground as a fourth
// element only when there is one.
func (r tRun) MarshalJSON() ([]byte, error) {
	b := 0
	if r.Bold {
		b = 1
	}
	if r.BG >= 0 {
		return json.Marshal([]any{r.FG, b, r.Text, r.BG})
	}
	return json.Marshal([]any{r.FG, b, r.Text})
}

// drawText draws a source as tuios mermaid --format text does at cols
// columns, with colour.
func drawText(src string, cols int) (textDrawing, error) {
	d, err := sketch.Parse(src, sketch.ParseOptions{})
	if err != nil {
		return textDrawing{}, err
	}
	wide := false
	lines, err := text.Draw(d, text.Options{Cols: cols, Color: true})
	if errors.Is(err, text.ErrTooWide) {
		wide = true
		lines, err = text.Draw(d, text.Options{Color: true})
	}
	if err != nil {
		return textDrawing{}, err
	}
	td, err := parseDrawing(strings.Join(lines, "\n"), "")
	td.Wide = wide
	return td, err
}

// splitSGR splits a line of sketch/text into runs. sketch/text writes only
// SGR 0, 1, 30 to 37, 90 to 97, 40 to 47 and 100 to 107; anything else is an
// error, so a change in its output stops the build here instead of reaching
// the page as junk.
func splitSGR(line string) ([]tRun, error) {
	var runs []tRun
	cur := tRun{FG: -1, BG: -1}
	var b strings.Builder
	flush := func() {
		if b.Len() > 0 {
			cur.Text = b.String()
			runs = append(runs, cur)
			b.Reset()
		}
	}
	for i := 0; i < len(line); i++ {
		c := line[i]
		if c != 0x1b {
			if c < 0x20 || c == 0x7f {
				return nil, fmt.Errorf("control byte %#x in a text drawing", c)
			}
			b.WriteByte(c)
			continue
		}
		end := strings.IndexByte(line[i:], 'm')
		if end < 0 || i+1 >= len(line) || line[i+1] != '[' {
			return nil, fmt.Errorf("escape that is not SGR in a text drawing: %q", line[i:])
		}
		params := line[i+2 : i+end]
		i += end
		flush()
		cur = tRun{FG: cur.FG, Bold: cur.Bold, BG: cur.BG}
		for _, p := range strings.Split(params, ";") {
			var n int
			if p == "" {
				n = 0
			} else if _, err := fmt.Sscanf(p, "%d", &n); err != nil {
				return nil, fmt.Errorf("SGR %q in a text drawing", params)
			}
			switch {
			case n == 0:
				cur = tRun{FG: -1, BG: -1}
			case n == 1:
				cur.Bold = true
			case n >= 30 && n <= 37:
				cur.FG = n - 30
			case n >= 90 && n <= 97:
				cur.FG = n - 90 + 8
			case n >= 40 && n <= 47:
				cur.BG = n - 40
			case n >= 100 && n <= 107:
				cur.BG = n - 100 + 8
			default:
				return nil, fmt.Errorf("SGR %d in a text drawing", n)
			}
		}
	}
	flush()
	// Spaces at the end of a line in the default style show nothing.
	for len(runs) > 0 {
		last := &runs[len(runs)-1]
		if last.BG != -1 {
			// A ground shows, spaces and all.
			break
		}
		if last.FG != -1 || last.Bold {
			if strings.TrimRight(last.Text, " ") == "" {
				runs = runs[:len(runs)-1]
				continue
			}
			break
		}
		last.Text = strings.TrimRight(last.Text, " ")
		if last.Text != "" {
			break
		}
		runs = runs[:len(runs)-1]
	}
	return runs, nil
}

// writeDrawings writes the text drawings, in name order, one drawing a line
// group, so a change to one diagram is a small diff.
func writeDrawings(all map[string]textDrawing) error {
	keys := make([]string, 0, len(all))
	for k := range all {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	var b strings.Builder
	b.WriteString("{\n")
	for i, k := range keys {
		td := all[k]
		head, err := json.Marshal(struct {
			Title string `json:"title"`
			Cols  int    `json:"cols"`
			Rows  int    `json:"rows"`
			Wide  bool   `json:"wide"`
		}{td.Title, td.Cols, td.Rows, td.Wide})
		if err != nil {
			return err
		}
		fmt.Fprintf(&b, "  %q: {\n    %s,\n    \"lines\": [\n", k, strings.Trim(string(head), "{}"))
		for j, l := range td.Lines {
			if l == nil {
				l = []tRun{}
			}
			data, err := json.Marshal(l)
			if err != nil {
				return err
			}
			sep := ","
			if j == len(td.Lines)-1 {
				sep = ""
			}
			fmt.Fprintf(&b, "      %s%s\n", data, sep)
		}
		sep := ","
		if i == len(keys)-1 {
			sep = ""
		}
		fmt.Fprintf(&b, "    ]\n  }%s\n", sep)
	}
	b.WriteString("}\n")
	return os.WriteFile(sketchTextPath, []byte(b.String()), 0o644)
}

// writeSource writes a gallery source without its title and alt lines.
func writeSource(id, src string) error {
	var keep []string
	head := true
	for _, line := range strings.Split(src, "\n") {
		t := strings.TrimSpace(line)
		if head && (strings.HasPrefix(t, "%% title:") || strings.HasPrefix(t, "%% alt:")) {
			continue
		}
		head = false
		keep = append(keep, line)
	}
	if err := os.MkdirAll(sourceDir, 0o755); err != nil {
		return err
	}
	out := strings.TrimRight(strings.Join(keep, "\n"), "\n") + "\n"
	return os.WriteFile(filepath.Join(sourceDir, id+".mmd"), []byte(out), 0o644)
}

// sketchExamples builds and runs the example programs of the sketch page in
// a scratch folder. What a program prints goes next to the snippets, a text
// drawing it prints goes into the drawings, and a file it writes goes
// under public/libs/sketch/examples.
func (g *gen) sketchExamples(drawings map[string]textDrawing) error {
	work, err := os.MkdirTemp("", "libshots-sketch")
	if err != nil {
		return err
	}
	defer os.RemoveAll(work)
	run := func(dir string, args ...string) (string, error) {
		bin := filepath.Join(work, dir)
		if _, err := os.Stat(bin); err != nil {
			build := exec.Command("go", "build", "-o", bin, "./examples/"+dir)
			build.Dir = "tools/libshots"
			build.Env = append(os.Environ(), "GOWORK=off")
			if out, err := build.CombinedOutput(); err != nil {
				return "", fmt.Errorf("build %s: %v: %s", dir, err, out)
			}
		}
		cmd := exec.Command(bin, args...)
		cmd.Dir = work
		var stderr bytes.Buffer
		cmd.Stderr = &stderr
		out, err := cmd.Output()
		if err != nil {
			return "", fmt.Errorf("run %s: %v: %s", dir, err, stderr.String())
		}
		return string(out), nil
	}

	// SVG: what it prints, and the file as it wrote it.
	out, err := run("sketch-svg")
	if err != nil {
		return err
	}
	if err := writeOutput("sketch-svg-output", out); err != nil {
		return err
	}
	if err := g.keepFile(work, "flow.svg", "sketch/examples/flow.svg"); err != nil {
		return err
	}

	// PNG: what it prints, and the picture. It is drawn at scale 2, so it
	// shows at half its size, as the other pictures do.
	out, err = run("sketch-png")
	if err != nil {
		return err
	}
	if err := writeOutput("sketch-png-output", out); err != nil {
		return err
	}
	if err := g.keepFile(work, "flow.png", "sketch/examples/flow.png"); err != nil {
		return err
	}

	// Text: the drawing it prints, coloured, as the gallery shows them.
	out, err = run("sketch-text")
	if err != nil {
		return err
	}
	td, err := parseDrawing(out, "The quick start flowchart")
	if err != nil {
		return fmt.Errorf("sketch-text: %w", err)
	}
	drawings["example-text"] = td

	// Math: one source drawn with a resolver and with none, and what it
	// prints.
	out, err = run("sketch-math")
	if err != nil {
		return err
	}
	if err := writeOutput("sketch-math-output", out); err != nil {
		return err
	}
	for _, f := range []string{"math.svg", "math-source.svg"} {
		if err := g.keepFile(work, f, "sketch/examples/"+f); err != nil {
			return err
		}
	}

	// Errors and themes: what they print.
	for _, dir := range []string{"sketch-error", "sketch-themes"} {
		out, err := run(dir)
		if err != nil {
			return err
		}
		if err := writeOutput(dir+"-output", out); err != nil {
			return err
		}
	}

	// Widths: the same program at four widths. At 80 columns the gaps
	// close up, at 50 the flowchart turns to run down, and at 40 none fits.
	for _, cols := range []string{"100", "80", "50", "40"} {
		out, err := run("sketch-width", cols)
		if err != nil {
			return err
		}
		td, err := parseDrawing(out, "The flowchart at "+cols+" columns")
		if err != nil {
			return fmt.Errorf("sketch-width %s: %w", cols, err)
		}
		drawings["width-"+cols] = td
	}
	return nil
}

// parseDrawing reads the lines a program printed as a text drawing.
func parseDrawing(out, title string) (textDrawing, error) {
	td := textDrawing{Title: title}
	for _, l := range strings.Split(strings.TrimRight(out, "\n"), "\n") {
		runs, err := splitSGR(l)
		if err != nil {
			return td, err
		}
		w := 0
		for _, r := range runs {
			w += ansi.StringWidth(r.Text)
		}
		td.Cols = max(td.Cols, w)
		td.Lines = append(td.Lines, runs)
	}
	td.Rows = len(td.Lines)
	return td, nil
}

// keepFile copies a file an example wrote into the output, as NAME. A PNG
// joins the pictures with its size, at half its pixels.
func (g *gen) keepFile(work, file, name string) error {
	data, err := os.ReadFile(filepath.Join(work, file))
	if err != nil {
		return err
	}
	dst := filepath.Join(g.out, filepath.FromSlash(name))
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(dst, data, 0o644); err != nil {
		return err
	}
	if strings.HasSuffix(name, ".png") {
		cfg, err := png.DecodeConfig(bytes.NewReader(data))
		if err != nil {
			return err
		}
		g.sizes[strings.TrimSuffix(name, ".png")] = size{W: cfg.Width / 2, H: cfg.Height / 2}
	}
	return nil
}
