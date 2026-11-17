#!/bin/sh
# Renders the toolbar icons in static/icons from the SVG sources in assets/icons.
# Needs Inkscape. Each icon has a heavier "-small" drawing for 16px, because the
# fine one turns to mush at that size, the way Chrome's own icons are drawn.
#
# Every icon is rendered twice: almost white for a dark toolbar (on-dark, the
# colour the sources are drawn in) and almost black for a light one (on-light).
set -e
cd "$(dirname "$0")/.."

ON_DARK="#e3e3e3"
ON_LIGHT="#1f1f1f"
recoloured=$(mktemp -d)
trap 'rm -rf "$recoloured"' EXIT

render() {
  scheme=$1
  colour=$2
  mkdir -p "static/icons/$scheme"
  for small in assets/icons/*-small.svg; do
    name=$(basename "$small" -small.svg)
    sed "s/$ON_DARK/$colour/g" "$small" > "$recoloured/$name-small.svg"
    sed "s/$ON_DARK/$colour/g" "assets/icons/$name.svg" > "$recoloured/$name.svg"
    inkscape "$recoloured/$name-small.svg" -w 16 -h 16 -o "static/icons/$scheme/$name-16.png"
    for size in 32 48 128; do
      inkscape "$recoloured/$name.svg" -w "$size" -h "$size" -o "static/icons/$scheme/$name-$size.png"
    done
  done
}

render on-dark "$ON_DARK"
render on-light "$ON_LIGHT"
