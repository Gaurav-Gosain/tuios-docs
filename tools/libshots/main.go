// Command libshots draws the pictures of the library pages
// (content/docs/libraries) from real code. Each picture is the output of
// the library it shows: tml documents drawn by loom, charts drawn by plot,
// diagrams drawn by sketch, screens kept by vt, all rendered to PNG by shot.
//
// Run it through scripts/gen-library-shots.sh, which picks the font and
// turns the PNG files into WebP:
//
//	scripts/gen-library-shots.sh            # every library
//	scripts/gen-library-shots.sh tml loom   # the named libraries
//
// Each picture is drawn twice, once in a dark theme and once in a light one,
// so a page shows the one that matches the site. The size of every picture
// goes into lib/libshots.json, which the <LibShot> component reads.
//
// The code a page shows next to a picture is the code that drew it. A
// region of a .go file in this folder between "// snippet:begin NAME" and
// "// snippet:end" is written to snippets/NAME.txt, and the page includes
// that file.
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// library draws the pictures of one library page.
type library struct {
	name string
	draw func(g *gen) error
}

// libraries are the pages, in the order of the docs sidebar.
var libraries []library

func register(name string, draw func(g *gen) error) {
	libraries = append(libraries, library{name, draw})
}

func main() {
	out := flag.String("out", "", "folder for the PNG files")
	manifest := flag.String("manifest", "lib/libshots.json", "the size of each picture, for the LibShot component")
	snippets := flag.String("snippets", "tools/libshots/snippets", "folder for the code regions the pages include")
	src := flag.String("src", "tools/libshots", "folder of this program's source, for the snippets")
	regular := flag.String("font", "", "the regular face, a TTF or OTF file")
	bold := flag.String("bold", "", "the bold face of the same family")
	flag.Parse()
	if *out == "" || *regular == "" || *bold == "" {
		log.Fatal("usage: libshots -out DIR -font REGULAR -bold BOLD [library...]")
	}
	want := map[string]bool{}
	for _, a := range flag.Args() {
		want[a] = true
	}
	for a := range want {
		if !known(a) {
			log.Fatalf("libshots: no library %q", a)
		}
	}

	g, err := newGen(*out, *regular, *bold)
	if err != nil {
		log.Fatal(err)
	}
	var drawn []string
	for _, l := range libraries {
		if len(want) > 0 && !want[l.name] {
			continue
		}
		drawn = append(drawn, l.name)
		if err := l.draw(g); err != nil {
			log.Fatalf("%s: %v", l.name, err)
		}
	}
	if err := writeSnippets(*src, *snippets); err != nil {
		log.Fatal(err)
	}
	if err := writeManifest(*manifest, drawn, g.sizes); err != nil {
		log.Fatal(err)
	}
	fmt.Printf("libshots: %d pictures\n", len(g.sizes))
}

func known(name string) bool {
	for _, l := range libraries {
		if l.name == name {
			return true
		}
	}
	return false
}

// size is the size a picture shows at on the page, in CSS pixels: the PNG
// is drawn at twice this.
type size struct {
	W     int  `json:"w"`
	H     int  `json:"h"`
	Light bool `json:"light"` // a -light twin exists
}

// writeManifest merges sizes into the manifest, so a run for one library
// keeps the entries of the others. The old entries of the drawn libraries
// go, so a picture that was dropped leaves no entry.
func writeManifest(path string, drawn []string, sizes map[string]size) error {
	all := map[string]size{}
	if data, err := os.ReadFile(path); err == nil {
		if err := json.Unmarshal(data, &all); err != nil {
			return fmt.Errorf("read %s: %w", path, err)
		}
	}
	for k := range all {
		for _, lib := range drawn {
			if strings.HasPrefix(k, lib+"/") {
				delete(all, k)
			}
		}
	}
	for k, v := range sizes {
		all[k] = v
	}
	keys := make([]string, 0, len(all))
	for k := range all {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	var b strings.Builder
	b.WriteString("{\n")
	for i, k := range keys {
		sep := ","
		if i == len(keys)-1 {
			sep = ""
		}
		fmt.Fprintf(&b, "  %q: { \"w\": %d, \"h\": %d, \"light\": %t }%s\n", k, all[k].W, all[k].H, all[k].Light, sep)
	}
	b.WriteString("}\n")
	return os.WriteFile(path, []byte(b.String()), 0o644)
}

// writeSnippets writes each marked region of the .go files in src to
// dir/NAME.txt, with the common indent removed.
func writeSnippets(src, dir string) error {
	files, err := filepath.Glob(filepath.Join(src, "*.go"))
	if err != nil {
		return err
	}
	more, _ := filepath.Glob(filepath.Join(src, "examples", "*", "*.go"))
	files = append(files, more...)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	for _, f := range files {
		data, err := os.ReadFile(f)
		if err != nil {
			return err
		}
		var name string
		var body []string
		for _, line := range strings.Split(string(data), "\n") {
			t := strings.TrimSpace(line)
			switch {
			case strings.HasPrefix(t, "// snippet:begin "):
				name, body = strings.TrimPrefix(t, "// snippet:begin "), nil
			case t == "// snippet:end":
				if name == "" {
					return fmt.Errorf("%s: snippet:end with no begin", f)
				}
				if err := os.WriteFile(filepath.Join(dir, name+".txt"), []byte(dedent(body)), 0o644); err != nil {
					return err
				}
				name = ""
			case name != "":
				body = append(body, line)
			}
		}
		if name != "" {
			return fmt.Errorf("%s: snippet %s has no end", f, name)
		}
	}
	return nil
}

func dedent(lines []string) string {
	indent := -1
	for _, l := range lines {
		if strings.TrimSpace(l) == "" {
			continue
		}
		n := len(l) - len(strings.TrimLeft(l, "\t"))
		if indent < 0 || n < indent {
			indent = n
		}
	}
	var b strings.Builder
	for _, l := range lines {
		if len(l) >= indent && indent > 0 {
			l = l[indent:]
		}
		b.WriteString(l)
		b.WriteByte('\n')
	}
	return b.String()
}
