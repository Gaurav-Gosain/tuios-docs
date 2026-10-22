// snippet:begin sketch-math
package main

import (
	"fmt"
	"html"
	"log"
	"os"
	"strconv"
	"unicode/utf8"

	"tuios.dev/sketch"
)

const src = `flowchart LR
  a["$$E = mc^2$$"] --> b["$$x < y$$"]
`

// resolve writes the TeX as italic text. A real host calls a typesetter here.
func resolve(tex string, size float64) (sketch.MathMarkup, bool) {
	y := strconv.FormatFloat(size, 'f', -1, 64)
	return sketch.MathMarkup{
		// Escape the TeX: it comes from the author of the diagram.
		Markup: `<text y="` + y + `" font-style="italic">` + html.EscapeString(tex) + `</text>`,
		Width:  float64(utf8.RuneCountInString(tex)) * size * 0.6,
		Height: size * 1.2,
	}, true
}

func main() {
	for _, out := range []struct {
		file string
		opts sketch.RenderOptions
	}{
		{"math.svg", sketch.RenderOptions{Math: resolve}},
		{"math-source.svg", sketch.RenderOptions{}}, // no resolver
	} {
		svg, err := sketch.Render(src, out.opts)
		if err != nil {
			log.Fatal(err)
		}
		if err := os.WriteFile(out.file, []byte(svg.Data), 0o644); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("%s: %.0f by %.0f\n", out.file, svg.Width, svg.Height)
	}
}
// snippet:end
