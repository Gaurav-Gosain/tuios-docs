// snippet:begin loom-bubbletea
// A Bubble Tea v2 program that shows a TML document with loom. Keys and
// clicks go to the surface. Its emit actions come back as effects.
package main

import (
	_ "embed"
	"fmt"
	"log"

	tea "charm.land/bubbletea/v2"
	"tuios.dev/loom"
	"tuios.dev/tml"
)

//go:embed dashboard.tml
var src []byte

type model struct {
	s      *loom.Surface
	w, h   int
	status string
}

func (m model) Init() tea.Cmd { return nil }

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.w, m.h = msg.Width, msg.Height
	case tea.KeyPressMsg:
		switch msg.String() {
		case "ctrl+c", "esc":
			return m, tea.Quit
		}
		// loom names keys as Bubble Tea does: up, enter, shift+tab, r.
		return m.handle(m.s.Key(msg.String()))
	case tea.MouseClickMsg:
		if msg.Button == tea.MouseLeft {
			return m.handle(m.s.Mouse(loom.Mouse{X: msg.X, Y: msg.Y, Button: loom.MouseLeft, Action: loom.Press}))
		}
	case tea.MouseWheelMsg:
		b := loom.WheelDown
		if msg.Button == tea.MouseWheelUp {
			b = loom.WheelUp
		}
		return m.handle(m.s.Mouse(loom.Mouse{X: msg.X, Y: msg.Y, Button: b, Action: loom.Press}))
	}
	return m, nil
}

// handle acts on what the surface sends back. Tabs, sorting, the cursor and
// set() already ran inside loom. The rest is for the program.
func (m model) handle(res loom.Result, err error) (tea.Model, tea.Cmd) {
	if err != nil {
		m.status = err.Error()
		return m, nil
	}
	for _, e := range res.Effects {
		switch e.Action {
		case "close":
			return m, tea.Quit
		case "emit":
			m.status = fmt.Sprintf("event %q: %v", e.Name, e.Value)
		}
	}
	return m, nil
}

func (m model) View() tea.View {
	v := tea.NewView("")
	v.AltScreen = true
	v.MouseMode = tea.MouseModeCellMotion
	if m.w > 0 && m.h > 1 {
		// Render does no work when nothing changed since the last frame.
		v.SetContent(m.s.Render(m.w, m.h-1).Render() + "\n" + m.status)
	}
	return v
}

func main() {
	doc, problems, err := tml.Check(src, nil)
	if err != nil {
		log.Fatal(problems)
	}
	s, err := loom.New(doc, &loom.Options{Palette: loom.DefaultPalette(loom.TrueColor)})
	if err != nil {
		log.Fatal(err)
	}
	if _, err := tea.NewProgram(model{s: s}).Run(); err != nil {
		log.Fatal(err)
	}
}
// snippet:end
