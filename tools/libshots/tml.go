package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"tuios.dev/loom"
	"tuios.dev/tml"
)

func init() { register("tml", drawTML) }

const tmlDir = "tools/libshots/scenes/tml"

// tmlScenes are the component pictures of the tml page: a file under
// scenes/tml and the width to draw it at. The height is what it needs.
var tmlScenes = []struct {
	name string
	w    int
}{
	{"layout-row", 60}, {"layout-col", 60}, {"layout-fill", 72}, {"layout-grid", 60},
	{"text", 60}, {"stat", 66}, {"gauge", 50}, {"badge", 60},
	{"table", 64}, {"list", 60}, {"tree", 40}, {"kv", 44},
	{"card", 50}, {"tabs", 50}, {"charts", 80}, {"bindings", 44},
}

func drawTML(g *gen) error {
	for _, s := range tmlScenes {
		if err := g.tmlShot("tml/"+s.name, filepath.Join(tmlDir, s.name+".tml"), s.w, 0, pic{look: card}); err != nil {
			return err
		}
	}
	if err := g.runExample("tml/quickstart", "tml-quickstart", 44); err != nil {
		return err
	}

	// The page's main picture: a test run in the frame tuios draws around
	// a popup.
	hero, err := os.ReadFile(filepath.Join(tmlDir, "test-run.tml"))
	if err != nil {
		return err
	}
	if err := g.tmlSource("tml/hero", hero, 148, 34, pic{look: window, title: "tuios tml show test-run.tml"},
		opts{frame: true, title: "Test run", owner: "from api"}); err != nil {
		return err
	}

	// A patch: the same surface before and after.
	build, err := os.ReadFile(filepath.Join(tmlDir, "build.tml"))
	if err != nil {
		return err
	}
	if err := g.tmlSource("tml/patch-before", build, 48, 0, pic{look: card}, opts{}); err != nil {
		return err
	}
	patch, err := os.ReadFile(filepath.Join(tmlDir, "build-patch.json"))
	if err != nil {
		return err
	}
	ops, err := tml.DecodePatch(patch, nil)
	if err != nil {
		return err
	}
	if err := g.tmlSource("tml/patch-after", build, 48, 0, pic{look: card},
		opts{prep: func(s *loom.Surface) error { return s.Patch(ops) }}); err != nil {
		return err
	}

	// Events: the buttons, and what a key press sends back.
	confirm, err := os.ReadFile(filepath.Join(tmlDir, "confirm.tml"))
	if err != nil {
		return err
	}
	if err := g.tmlSource("tml/confirm", confirm, 52, 0, pic{look: card}, opts{}); err != nil {
		return err
	}
	if err := writeOutput("tml-confirm-keys", confirmKeys(confirm)); err != nil {
		return err
	}

	// The problems of a broken document, as Check reports them.
	broken, err := os.ReadFile(filepath.Join(tmlDir, "broken.tml"))
	if err != nil {
		return err
	}
	_, problems, err := tml.Check(broken, nil)
	if err == nil {
		return fmt.Errorf("broken.tml checks clean")
	}
	var b strings.Builder
	for _, p := range problems {
		fmt.Fprintln(&b, p)
	}
	return writeOutput("tml-check-output", b.String())
}

// confirmKeys presses d, then y, on the confirm document and lists the
// effects each key returns.
func confirmKeys(src []byte) string {
	s, err := surface(src, nil, nil)
	if err != nil {
		return err.Error()
	}
	s.Render(52, 4)
	var b strings.Builder
	for _, k := range []string{"d", "y"} {
		res, err := s.Key(k)
		if err != nil {
			fmt.Fprintf(&b, "%s: %v\n", k, err)
			continue
		}
		for _, e := range res.Effects {
			fmt.Fprintf(&b, "key %s: %s %q %v\n", k, e.Action, e.Name, e.Value)
		}
	}
	return b.String()
}

// writeOutput writes what a program printed next to the snippets, for a page
// to include as it is.
func writeOutput(name, text string) error {
	dir := "tools/libshots/snippets"
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dir, name+".txt"), []byte(text), 0o644)
}
