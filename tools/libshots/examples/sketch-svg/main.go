// snippet:begin sketch-svg
package main

import (
	"fmt"
	"log"
	"os"

	"tuios.dev/sketch"
)

const src = `flowchart LR
  src[Mermaid source] --> sketch{{sketch}}
  sketch --> svg[(SVG)]
  sketch --> png[(PNG)]
  sketch --> txt[(Text)]
`

func main() {
	svg, err := sketch.Render(src, sketch.RenderOptions{})
	if err != nil {
		log.Fatal(err) // a *sketch.Error, with a code such as "syntax"
	}
	if err := os.WriteFile("flow.svg", []byte(svg.Data), 0o644); err != nil {
		log.Fatal(err)
	}
	fmt.Printf("%s (Mermaid calls it %s)\n", svg.Type, svg.MermaidType)
	fmt.Printf("%.0f by %.0f, %d bytes of SVG\n", svg.Width, svg.Height, len(svg.Data))
}
// snippet:end
