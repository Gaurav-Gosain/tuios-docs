// snippet:begin vt-quickstart
package main

import (
	"fmt"

	"tuios.dev/vt"
)

func main() {
	term := vt.New(40, 3)
	defer term.Close()

	// What a program prints goes in.
	term.Write([]byte("hello \x1b[1mworld\x1b[0m\r\n$ "))

	// The screen comes out, as text or cell by cell.
	fmt.Println(term.String())
	fmt.Println(term.CellAt(6, 0).Content) // "w", drawn bold
	fmt.Println(term.CursorPosition())     // column 2, row 1
}
// snippet:end
