#!/usr/bin/env bash
# tests.sh: prints a short go test -v run in its colours, for the gallery
# scenes. The project has no Go toolchain in the take, so the run is printed.
g=$'\e[32m' r=$'\e[31m' y=$'\e[33m' c=$'\e[36m' d=$'\e[90m' b=$'\e[1m' o=$'\e[0m'
clear
printf '%s$%s go test -v ./internal/store/\n' "$d" "$o"
for t in TestOpen TestList TestCreate TestCreateEmpty TestClose; do
  printf '=== RUN   %s\n' "$t"
  printf '%s--- PASS%s: %s %s(0.00s)%s\n' "$g" "$o" "$t" "$d" "$o"
done
printf '=== RUN   TestRetryJitter\n'
printf '    store_test.go:48: %swait 1873ms is over the 1800ms cap%s\n' "$y" "$o"
printf '%s--- FAIL%s: TestRetryJitter %s(0.02s)%s\n' "$r$b" "$o" "$d" "$o"
printf '%sFAIL%s\n' "$r" "$o"
printf '%sFAIL%s\texample.com/notes/internal/store\t0.214s\n' "$r$b" "$o"
printf '%s# 5 passed, 1 failed%s\n' "$c" "$o"
