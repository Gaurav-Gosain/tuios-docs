// Command themes writes every theme tuios ships as JSON, for the theme picker
// of the site (lib/site-themes).
//
// It is not built in this folder. internal/theme is internal to the tuios
// module, so scripts/site-themes.sh compiles this file inside a copy of tuios
// at the commit in TUIOS_REF, with go's -overlay flag. The palettes are read
// from tuios itself and are never copied by hand.
//
// Only the themes tuios ships are written: the built-in tints and the
// CharmTone pair. The script points the config and Omarchy folders at an
// empty directory, so the custom themes and the Omarchy themes of the machine
// that runs it stay out.
package main

import (
	"encoding/json"
	"fmt"
	"image/color"
	"os"
	"strings"

	"github.com/Gaurav-Gosain/tuios/internal/theme"
	tint "github.com/lrstanley/bubbletint/v2"
)

// entry is one theme. Colours are six hex digits without the '#'. ANSI holds
// the sixteen in index order, black first and bright white last. Cursor and
// selection are empty when the theme leaves them unset.
type entry struct {
	ID        string     `json:"id"`
	Name      string     `json:"name"`
	Dark      bool       `json:"dark"`
	Bg        string     `json:"bg"`
	Fg        string     `json:"fg"`
	Cursor    string     `json:"cursor,omitempty"`
	Selection string     `json:"selection,omitempty"`
	ANSI      [16]string `json:"ansi"`
}

func hex(c color.Color) string {
	if c == nil {
		return ""
	}
	return strings.TrimPrefix(strings.ToLower(theme.ColorToString(c)), "#")
}

func main() {
	if len(os.Args) != 3 {
		fmt.Fprintln(os.Stderr, "usage: themes <tuios-ref> <out.json>")
		os.Exit(2)
	}
	ref, out := os.Args[1], os.Args[2]

	var themes []entry
	for _, id := range theme.AvailableThemes() {
		if id == theme.OmarchyID || strings.HasPrefix(id, "omarchy") {
			continue
		}
		p, ok := theme.Describe(id)
		if !ok {
			continue
		}
		pal, _, _, _, _ := theme.Colors(id)
		t, ok := tint.GetTint(id)
		if !ok || t == nil {
			continue
		}
		e := entry{
			ID:        p.ID,
			Name:      p.DisplayName,
			Dark:      p.Dark,
			Bg:        hex(theme.AsColor(t.Bg)),
			Fg:        hex(theme.AsColor(t.Fg)),
			Cursor:    hex(theme.AsColor(t.Cursor)),
			Selection: hex(theme.AsColor(t.SelectionBg)),
		}
		if e.Name == "" {
			e.Name = id
		}
		for i, c := range pal {
			e.ANSI[i] = hex(c)
		}
		if e.Bg == "" || e.Fg == "" {
			fmt.Fprintf(os.Stderr, "themes: %s has no background or foreground\n", id)
			os.Exit(1)
		}
		themes = append(themes, e)
	}

	// One theme per line keeps a palette change a one-line diff.
	var b strings.Builder
	fmt.Fprintf(&b, "{\n  \"tuios\": %q,\n  \"themes\": [\n", ref)
	for i, e := range themes {
		line, err := json.Marshal(e)
		if err != nil {
			fmt.Fprintln(os.Stderr, "themes:", err)
			os.Exit(1)
		}
		sep := ","
		if i == len(themes)-1 {
			sep = ""
		}
		fmt.Fprintf(&b, "    %s%s\n", line, sep)
	}
	b.WriteString("  ]\n}\n")
	if err := os.WriteFile(out, []byte(b.String()), 0o644); err != nil {
		fmt.Fprintln(os.Stderr, "themes:", err)
		os.Exit(1)
	}
	fmt.Fprintf(os.Stderr, "themes: wrote %d themes to %s\n", len(themes), out)
}
