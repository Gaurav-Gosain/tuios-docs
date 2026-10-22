package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"image"
	"image/png"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"

	"libshots/sketchtext"
	"tuios.dev/sketch"
	"tuios.dev/sketch/raster"
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
	drawings := map[string]sketchtext.Drawing{}
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
		td, err := sketchtext.Draw(string(src), sketchtext.Cols)
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

// sketchTextPath is the file the gallery reads the text drawings from.
const sketchTextPath = "lib/sketch-text.json"

// sourceDir holds the sources of the gallery without their header lines, for
// the pages to include.
const sourceDir = "tools/libshots/snippets/sketch-types"

// writeDrawings writes the text drawings, in name order, one drawing a line
// group, so a change to one diagram is a small diff.
func writeDrawings(all map[string]sketchtext.Drawing) error {
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
		if err := sketchtext.LinesJSON(&b, td.Lines, "      "); err != nil {
			return err
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
func (g *gen) sketchExamples(drawings map[string]sketchtext.Drawing) error {
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
	td, err := sketchtext.Parse(out, "The quick start flowchart")
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
		td, err := sketchtext.Parse(out, "The flowchart at "+cols+" columns")
		if err != nil {
			return fmt.Errorf("sketch-width %s: %w", cols, err)
		}
		drawings["width-"+cols] = td
	}
	return nil
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
