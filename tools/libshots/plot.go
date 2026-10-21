package main

import (
	"fmt"
	"math"
	"os"
	"path/filepath"

	"tuios.dev/plot"
)

func init() { register("plot", drawPlot) }

// plotCharts are the charts of the plot page, each drawn by the function
// whose body the page shows.
var plotCharts = []struct {
	name string
	draw func(plot.Mode) *plot.Grid
}{
	{"bar", barChart},
	{"columns", columnChart},
	{"line", lineChart},
	{"area", areaChart},
	{"sparkline", sparklineChart},
	{"gauge", gaugeChart},
	{"histogram", histogramChart},
	{"heatmap", heatmapChart},
	{"pie", pieChart},
	{"mirror", mirrorChart},
	{"inline", inlineChart},
	{"diverging", divergingChart},
	{"map", mapChart},
}

func drawPlot(g *gen) error {
	for _, c := range plotCharts {
		if err := g.plotShot("plot/"+c.name, c.draw(plot.Braille)); err != nil {
			return err
		}
	}
	for _, m := range []plot.Mode{plot.Braille, plot.Blocks, plot.ASCII} {
		if err := g.plotShot("plot/mode-"+m.String(), modeChart(m)); err != nil {
			return err
		}
	}
	if err := g.plotShot("plot/roles", rolesChart()); err != nil {
		return err
	}
	if err := g.runExampleIn("plot/quickstart", "plot-quickstart", 36, themes); err != nil {
		return err
	}
	gallery, err := os.ReadFile(filepath.Join("tools/libshots/scenes/plot", "gallery.tml"))
	if err != nil {
		return err
	}
	return g.tmlSource("plot/hero", gallery, 200, 55, pic{look: window, title: "plot"},
		opts{frame: true, title: "Charts"})
}

// plotShot draws a plot grid in both themes, each role coloured by the
// theme's loom palette.
func (g *gen) plotShot(name string, pg *plot.Grid) error {
	for _, t := range themes {
		if err := g.write(name, t, plotGrid(pg, t.palette(), t.term), pic{look: card}); err != nil {
			return err
		}
	}
	return nil
}

func barChart(m plot.Mode) *plot.Grid {
	// snippet:begin plot-bar
	bar := plot.Bar{
		Values:     []float64{6.2, 4.8, 3.1, 1.4, 0.9},
		Labels:     []string{"session", "app", "vt", "tape", "config"},
		Horizontal: true,
		Guide:      true, // a dotted line to the value
	}
	grid := bar.Draw(48, 5, m)
	// snippet:end
	return grid
}

func columnChart(m plot.Mode) *plot.Grid {
	// snippet:begin plot-columns
	cols := plot.Bar{
		Values: []float64{41, 39, 44, 40, 52, 47, 38, 45, 49, 43, 41, 50},
		Labels: []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"},
		Axis:   true, // tick labels, a base line, and x labels
		Role:   plot.Series2,
	}
	grid := cols.Draw(48, 9, m)
	// snippet:end
	return grid
}

func lineChart(m plot.Mode) *plot.Grid {
	// snippet:begin plot-line
	line := plot.Line{
		Series: []plot.Series{
			{Name: "p50", Values: wave(40, 20, 4)},
			{Name: "p95", Values: wave(40, 34, 9)},
		},
		Labels: hours(40),
		Axis:   true,
	}
	// The legend goes on the first row, the chart under it.
	grid := plot.NewGrid(56, 11)
	plot.DrawLegend(grid, 6, 0, line.Legend(), m)
	paste(grid, line.Draw(56, 10, m), 0, 1)
	// snippet:end
	return grid
}

func areaChart(m plot.Mode) *plot.Grid {
	// snippet:begin plot-area
	area := plot.Line{
		Series: []plot.Series{{Name: "memory", Values: wave(48, 120, 30), Role: plot.Series3}},
		Fill:   true, // an area chart
		Axis:   true,
		Labels: hours(48),
	}
	grid := area.Draw(56, 9, m)
	// snippet:end
	return grid
}

func sparklineChart(m plot.Mode) *plot.Grid {
	// snippet:begin plot-sparkline
	spark := plot.Sparkline{Values: []float64{3, 5, 4, 8, 6, 9, 7, 12, 10, 14, 11, 16, 13, 18, 15, 21}}
	grid := spark.Draw(16, 1, m)
	// snippet:end
	return grid
}

func gaugeChart(m plot.Mode) *plot.Grid {
	// snippet:begin plot-gauge
	cpu := plot.Gauge{Value: 43, Max: 100}
	pass := plot.Gauge{Value: 0.988, Role: plot.Success, Style: plot.GaugeBlocks}
	grid := plot.NewGrid(40, 3)
	paste(grid, cpu.Draw(40, 1, m), 0, 0)
	paste(grid, pass.Draw(40, 1, m), 0, 2)
	// snippet:end
	return grid
}

func histogramChart(m plot.Mode) *plot.Grid {
	// snippet:begin plot-histogram
	hist := plot.Histogram{
		Values: latencies(400), // request times in ms
		Bins:   24,
		Format: func(v float64) string { return fmt.Sprintf("%.0fms", v) },
	}
	grid := hist.Draw(52, 9, m)
	// snippet:end
	return grid
}

func heatmapChart(m plot.Mode) *plot.Grid {
	// snippet:begin plot-heatmap
	heat := plot.Heatmap{
		Values:    commits(), // 7 rows of 24 hours
		RowLabels: []string{"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"},
		ColLabels: hoursOfDay(), // 00h to 23h
	}
	grid := heat.Draw(56, 11, m)
	// snippet:end
	return grid
}

func pieChart(m plot.Mode) *plot.Grid {
	// snippet:begin plot-pie
	pie := plot.Pie{
		Values: []float64{900, 240, 120, 60},
		Labels: []string{"Go", "Shell", "TOML", "Nix"},
		Donut:  true,
		Aspect: 2.0, // a cell's height over its width
	}
	grid := pie.Draw(40, 9, m)
	// snippet:end
	return grid
}

func mirrorChart(m plot.Mode) *plot.Grid {
	rx, tx := traffic(112) // download and upload, bytes a second
	// snippet:begin plot-mirror
	net := plot.Mirror{
		Up:     plot.Series{Name: "▼ download", Values: rx, Role: plot.Series3},
		Down:   plot.Series{Name: "▲ upload", Values: tx, Role: plot.Series5},
		Peaks:  true, // • 120M over the highest column of each half
		Stats:  true, // peak · avg · Σ in each corner row
		Format: plot.Compact,
	}
	grid := net.Draw(56, 10, m)
	// snippet:end
	return grid
}

func inlineChart(m plot.Mode) *plot.Grid {
	// snippet:begin plot-inline
	hosts := []string{"fra1.example.net", "ams3.example.net", "nyc2.example.net", "sgp1.example.net"}
	rates := []float64{30e6, 12.4e6, 3.1e6, 840e3}
	grid := plot.NewGrid(44, len(hosts))
	for i, h := range hosts {
		grid.Text(0, i, h, plot.Fg, false)
		bar := plot.InlineBar{Value: rates[i], Max: rates[0], Track: true}
		paste(grid, bar.Draw(16, 1, m), 18, i) // the bar column
		grid.TextRight(44, i, plot.Compact(rates[i]), plot.Info, false)
	}
	// snippet:end
	return grid
}

func divergingChart(m plot.Mode) *plot.Grid {
	// snippet:begin plot-diverging
	services := []string{"https", "quic", "ssh", "dns", "http"}
	down := []float64{24e6, 6e6, 40e3, 900, 1.2e6}
	up := []float64{1.1e6, 3.2e6, 220e3, 2.4e3, 9e6}
	grid := plot.NewGrid(30, len(services))
	for i, s := range services {
		grid.Text(0, i, s, plot.Fg, false)
		bar := plot.DivergingBar{
			Left: down[i], Right: up[i], Max: 24e6, // one Max for every row
			LeftRole: plot.Series3, RightRole: plot.Series5, Track: true,
		}
		paste(grid, bar.Draw(23, 1, m), 7, i)
	}
	// snippet:end
	return grid
}

func mapChart(m plot.Mode) *plot.Grid {
	// snippet:begin plot-map
	world := plot.Map{
		Values: map[string]float64{ // by ISO 3166-1 alpha-2 code
			"US": 410e6, "DE": 120e6, "NL": 95e6, "GB": 60e6, "CA": 35e6,
			"FR": 22e6, "JP": 18e6, "SG": 14e6, "IN": 9e6, "BR": 6e6,
			"AU": 2.5e6, "CN": 1.2e6, "ZA": 400e3,
		},
		Log:     true, // spread values that span orders of magnitude
		Markers: []plot.Marker{{Lat: 52.37, Lon: 4.9}, {Lat: 1.35, Lon: 103.82}},
	}
	_, rows := world.Fit(72, 40, m) // the rows the map takes at this width
	grid := plot.NewGrid(72, rows+1)
	paste(grid, world.Draw(72, rows, m), 0, 0)
	plot.DrawLegend(grid, 0, rows, world.Legend(m), m) // right under the map
	// snippet:end
	return grid
}

// traffic is a download and an upload history: a quiet line, a burst and
// a long download plateau with an upload spike in it, the same on every
// run.
func traffic(n int) (rx, tx []float64) {
	for i := 0; i < n; i++ {
		f := float64(i)
		d := 20e3 + 8e3*math.Sin(f*0.7)
		u := 6e3 + 2e3*math.Cos(f*0.5)
		switch {
		case i > n*30/100 && i < n*34/100:
			d, u = 30e6+4e6*math.Sin(f), 90e3
		case i > n*50/100 && i < n*80/100:
			d = 95e6 + 18e6*math.Abs(math.Sin(f*0.9)) + 7e6*math.Sin(f*2.3)
			u = 60e3 + 50e3*math.Abs(math.Sin(f*1.7))
		}
		if i == n*70/100 {
			d, u = 120e6, 964e3
		}
		if i == n*70/100+1 {
			u = 520e3
		}
		rx, tx = append(rx, d), append(tx, u)
	}
	return rx, tx
}

// modeChart is one line chart and one sparkline in a mode, for the modes
// section.
func modeChart(m plot.Mode) *plot.Grid {
	line := plot.Line{Series: []plot.Series{
		{Name: "p50", Values: wave(40, 20, 4)},
		{Name: "p95", Values: wave(40, 34, 9)},
	}}
	grid := plot.NewGrid(30, 9)
	paste(grid, line.Draw(30, 6, m), 0, 0)
	paste(grid, plot.Sparkline{Values: wave(30, 10, 6)}.Draw(30, 1, m), 0, 7)
	bar := plot.Gauge{Value: 0.62}
	paste(grid, bar.Draw(30, 1, m), 0, 8)
	return grid
}

// rolesChart writes each role a chart uses in its own colour.
func rolesChart() *plot.Grid {
	rows := [][]plot.Role{
		{plot.Fg, plot.Dim, plot.Mute, plot.Edge, plot.Track},
		{plot.Accent, plot.AccentBright, plot.Success, plot.Warning, plot.Error, plot.Info},
		{plot.Series1, plot.Series2, plot.Series3, plot.Series4, plot.Series5, plot.Series6},
		{plot.Heat1, plot.Heat2, plot.Heat3, plot.Heat4, plot.Heat5},
	}
	grid := plot.NewGrid(84, len(rows)*2-1)
	for y, row := range rows {
		x := 0
		for _, r := range row {
			x = grid.Text(x, y*2, "■ "+string(r), r, false) + 2
		}
	}
	return grid
}

// paste copies src into dst with its top left corner at x, y.
func paste(dst, src *plot.Grid, x, y int) {
	for sy := 0; sy < src.H; sy++ {
		for sx := 0; sx < src.W; sx++ {
			dx, dy := x+sx, y+sy
			if dx < dst.W && dy < dst.H {
				dst.Cells[dy*dst.W+dx] = src.Cells[sy*src.W+sx]
			}
		}
	}
}

// wave is n smooth values around base: data that looks measured, the same
// on every run.
func wave(n int, base, amp float64) []float64 {
	v := make([]float64, n)
	for i := range v {
		f := float64(i)
		v[i] = base + amp*math.Sin(f/4) + amp/2*math.Sin(f/1.7+1) + amp/4*math.Cos(f*1.3)
	}
	return v
}

// hours labels n points 15 minutes apart from 09:00.
func hours(n int) []string {
	l := make([]string, n)
	for i := range l {
		m := 9*60 + 15*i
		l[i] = fmt.Sprintf("%02d:%02d", m/60, m%60)
	}
	return l
}

// latencies is n request times with a long tail, the same on every run.
func latencies(n int) []float64 {
	v := make([]float64, n)
	seed := uint32(7)
	next := func() float64 {
		seed = seed*1664525 + 1013904223
		return float64(seed>>8) / float64(1<<24)
	}
	for i := range v {
		v[i] = 60 + 20*(next()+next()+next()+next())
		if next() > 0.85 {
			v[i] += 160 * next() // the slow tail
		}
	}
	return v
}

// commits is a week of commit counts by hour: busy in working hours.
func commits() [][]float64 {
	rows := make([][]float64, 7)
	for d := range rows {
		rows[d] = make([]float64, 24)
		for h := range rows[d] {
			day := 1.0
			if d >= 5 {
				day = 0.3
			}
			work := math.Exp(-math.Pow(float64(h)-14, 2) / 18)
			rows[d][h] = math.Round(day * (12*work + float64((d*7+h*3)%4)))
		}
	}
	return rows
}

func hoursOfDay() []string {
	l := make([]string, 24)
	for i := range l {
		l[i] = fmt.Sprintf("%02dh", i)
	}
	return l
}
