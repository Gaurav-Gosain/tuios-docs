// Package sketchtext turns what sketch/text draws into runs of one style, so
// a page can colour a text drawing from the site's own palette in either
// theme. libshots uses it for the sketch gallery, and the mermaid command for
// the diagrams of the site's pages.
package sketchtext

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/charmbracelet/x/ansi"
	"tuios.dev/sketch"
	"tuios.dev/sketch/text"
)

// Cols is the width of the text drawings: the width of a common terminal. A
// drawing that does not fit is drawn at its full width, as tuios mermaid
// does, and the page lets it scroll.
const Cols = 80

// Drawing is one text drawing, split into runs of one style.
type Drawing struct {
	Title string `json:"title"`
	// Cols is the widest line in cells. Wide says the drawing did not fit
	// the columns it was drawn for and was drawn at its full width.
	Cols  int     `json:"cols"`
	Rows  int     `json:"rows"`
	Wide  bool    `json:"wide,omitempty"`
	Lines [][]Run `json:"lines"`
}

// Run is a run of text in one style: the ANSI colour (-1 for the default
// text colour, else 0 to 15), whether it is bold, the text, and the ANSI
// colour of the ground (-1 for none). sketch/text sets a ground on a half
// block that shows two colours, such as where two pie slices meet.
type Run struct {
	FG   int
	Bold bool
	Text string
	BG   int
}

// MarshalJSON writes a run as [fg, bold, text], with the ground as a fourth
// element only when there is one.
func (r Run) MarshalJSON() ([]byte, error) {
	b := 0
	if r.Bold {
		b = 1
	}
	if r.BG >= 0 {
		return json.Marshal([]any{r.FG, b, r.Text, r.BG})
	}
	return json.Marshal([]any{r.FG, b, r.Text})
}

// Draw draws a source as tuios mermaid --format text does at cols columns,
// with colour.
func Draw(src string, cols int) (Drawing, error) {
	d, err := sketch.Parse(src, sketch.ParseOptions{})
	if err != nil {
		return Drawing{}, err
	}
	wide := false
	lines, err := text.Draw(d, text.Options{Cols: cols, Color: true})
	if errors.Is(err, text.ErrTooWide) {
		wide = true
		lines, err = text.Draw(d, text.Options{Color: true})
	}
	if err != nil {
		return Drawing{}, err
	}
	td, err := Parse(strings.Join(lines, "\n"), "")
	td.Wide = wide
	return td, err
}

// Parse reads the lines a program printed as a text drawing.
func Parse(out, title string) (Drawing, error) {
	td := Drawing{Title: title}
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

// LinesJSON writes the lines of a drawing one to a line, each line indented
// by indent, so a change to one diagram is a small diff.
func LinesJSON(b *strings.Builder, lines [][]Run, indent string) error {
	for j, l := range lines {
		if l == nil {
			l = []Run{}
		}
		data, err := json.Marshal(l)
		if err != nil {
			return err
		}
		sep := ","
		if j == len(lines)-1 {
			sep = ""
		}
		fmt.Fprintf(b, "%s%s%s\n", indent, data, sep)
	}
	return nil
}

// splitSGR splits a line of sketch/text into runs. sketch/text writes only
// SGR 0, 1, 30 to 37, 90 to 97, 40 to 47 and 100 to 107; anything else is an
// error, so a change in its output stops the build here instead of reaching
// the page as junk.
func splitSGR(line string) ([]Run, error) {
	var runs []Run
	cur := Run{FG: -1, BG: -1}
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
		cur = Run{FG: cur.FG, Bold: cur.Bold, BG: cur.BG}
		for _, p := range strings.Split(params, ";") {
			var n int
			if p == "" {
				n = 0
			} else if _, err := fmt.Sscanf(p, "%d", &n); err != nil {
				return nil, fmt.Errorf("SGR %q in a text drawing", params)
			}
			switch {
			case n == 0:
				cur = Run{FG: -1, BG: -1}
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
