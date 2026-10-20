package main

import (
	"bytes"
	"fmt"
	"image"
	"image/png"
	"os"
	"path/filepath"
	"sort"
	"strings"

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

	// The quickstart: what the snippet draws.
	for suffix, theme := range sketchThemes {
		img, err := quickstart(theme)
		if err != nil {
			return err
		}
		if err := g.writeImage("sketch/quickstart", suffix, img); err != nil {
			return err
		}
	}

	// Text: a flowchart drawn with box-drawing characters by sketch/text.
	flow, err := os.ReadFile(filepath.Join(sketchDir, "text-flow.mmd"))
	if err != nil {
		return err
	}
	d, err := sketch.Parse(string(flow), sketch.ParseOptions{})
	if err != nil {
		return err
	}
	lines, err := text.Draw(d, text.Options{Cols: 76})
	if err != nil {
		return err
	}
	return g.terminalIn("sketch/text", strings.Join(lines, "\n"), 78, "sketch/text", themes)
}

func quickstart(theme string) (image.Image, error) {
	// snippet:begin sketch-quickstart
	src := "flowchart LR\n  doc[TML document] --> loom --> cells[Cell buffer]\n  cells --> shot --> png[(PNG)]\n"
	svg, err := sketch.Render(src, sketch.RenderOptions{})
	if err != nil {
		return nil, err // a *sketch.Error with a code
	}
	th, _ := sketch.ThemeNamed(theme) // such as "catppuccin-mocha"
	img, err := raster.Draw(svg.Data, raster.Options{Scale: 2, Theme: th, Background: true})
	// snippet:end
	return img, err
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
