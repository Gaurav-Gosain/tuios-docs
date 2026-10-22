// Command mermaid draws the ```mermaid blocks of the site's pages with
// tuios.dev/sketch. Run it through scripts/mermaid.mjs, which finds the
// blocks with the same Markdown parser the site uses and passes them here:
//
//	bun run mermaid
//
// It reads a JSON list of {id, source, where} on stdin and writes
// lib/mermaid.json: for each block, the SVG and the text drawing that
// tuios mermaid --format text prints. The SVG has no colours of its own. It
// reads the --pele-* tokens, which app/global.css sets from the site theme,
// so one SVG serves every theme.
package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"sort"
	"strings"

	"libshots/sketchtext"
	"tuios.dev/sketch"
)

// The widths a diagram is laid out for, in CSS pixels: the docs column, and
// a 390 pixel phone less its gutters. Under 640 pixels sketch turns a
// flowchart that runs across to run down.
const (
	columnWidth = 768
	phoneWidth  = 358
)

// narrowGain is how much larger the narrow layout must draw than the wide
// one, at a width that shrinks both, for the page to carry it.
const narrowGain = 1.25

// block is one ```mermaid block of a page. id is the hash of the source,
// which the page uses to find the drawing.
type block struct {
	ID     string `json:"id"`
	Source string `json:"source"`
	Where  string `json:"where"`
}

// picture is one SVG layout of a diagram.
type picture struct {
	W   float64 `json:"w"`
	H   float64 `json:"h"`
	SVG string  `json:"svg"`
}

// drawn is what the page shows for one block. Narrow is the layout for a
// small screen, when it reads larger there than the wide one.
type drawn struct {
	Type   string   `json:"type"`
	Wide   picture  `json:"wide"`
	Narrow *picture `json:"narrow,omitempty"`
	Text   sketchtext.Drawing
}

func main() {
	out := flag.String("out", "lib/mermaid.json", "the file the pages read the drawings from")
	flag.Parse()

	var blocks []block
	if err := json.NewDecoder(os.Stdin).Decode(&blocks); err != nil {
		log.Fatalf("mermaid: read the blocks: %v", err)
	}
	all := map[string]drawn{}
	var failed []string
	for _, b := range blocks {
		if _, ok := all[b.ID]; ok {
			continue
		}
		d, err := draw(b)
		if err != nil {
			failed = append(failed, fmt.Sprintf("%s: %v", b.Where, err))
			continue
		}
		all[b.ID] = d
	}
	if len(failed) > 0 {
		log.Fatalf("mermaid: sketch cannot draw these blocks:\n  %s", strings.Join(failed, "\n  "))
	}
	if err := write(*out, all); err != nil {
		log.Fatal(err)
	}
	fmt.Printf("mermaid: drew %d blocks into %s\n", len(all), *out)
}

func draw(b block) (drawn, error) {
	// Each SVG gets its own id prefix, so the markers of two diagrams on one
	// page do not share an id.
	render := func(prefix string, width float64) (picture, sketch.Type, error) {
		svg, err := sketch.Render(b.Source, sketch.RenderOptions{IDPrefix: &prefix, MaxWidth: &width})
		if err != nil {
			return picture{}, "", err
		}
		return picture{W: svg.Width, H: svg.Height, SVG: svg.Data}, svg.Type, nil
	}
	wide, typ, err := render("m"+b.ID+"-", columnWidth)
	if err != nil {
		return drawn{}, err
	}
	d := drawn{Type: string(typ), Wide: wide}
	narrow, _, err := render("m"+b.ID+"n-", phoneWidth)
	if err != nil {
		return drawn{}, err
	}
	if wide.W >= narrowGain*narrow.W {
		d.Narrow = &narrow
	}
	d.Text, err = sketchtext.Draw(b.Source, sketchtext.Cols)
	if err != nil {
		return drawn{}, fmt.Errorf("text drawing: %w", err)
	}
	return d, nil
}

// write writes the drawings in id order, one text line to a line, so a
// change to one diagram is a small diff.
func write(path string, all map[string]drawn) error {
	keys := make([]string, 0, len(all))
	for k := range all {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	var b strings.Builder
	b.WriteString("{\n")
	for i, k := range keys {
		d := all[k]
		fmt.Fprintf(&b, "  %q: {\n    \"type\": %q,\n", k, d.Type)
		pic := func(name string, p picture) error {
			// The SVG as it is, without < and > written as < and >.
			var buf bytes.Buffer
			enc := json.NewEncoder(&buf)
			enc.SetEscapeHTML(false)
			if err := enc.Encode(p); err != nil {
				return err
			}
			fmt.Fprintf(&b, "    %q: %s,\n", name, strings.TrimSpace(buf.String()))
			return nil
		}
		if err := pic("wide", d.Wide); err != nil {
			return err
		}
		if d.Narrow != nil {
			if err := pic("narrow", *d.Narrow); err != nil {
				return err
			}
		}
		head, err := json.Marshal(struct {
			Cols int  `json:"cols"`
			Rows int  `json:"rows"`
			Wide bool `json:"wide"`
		}{d.Text.Cols, d.Text.Rows, d.Text.Wide})
		if err != nil {
			return err
		}
		fmt.Fprintf(&b, "    \"text\": {\n      %s,\n      \"lines\": [\n", strings.Trim(string(head), "{}"))
		if err := sketchtext.LinesJSON(&b, d.Text.Lines, "        "); err != nil {
			return err
		}
		sep := ","
		if i == len(keys)-1 {
			sep = ""
		}
		fmt.Fprintf(&b, "      ]\n    }\n  }%s\n", sep)
	}
	b.WriteString("}\n")
	return os.WriteFile(path, []byte(b.String()), 0o644)
}
