#!/bin/sh
# Renders the toolbar icons in static/icons from the SVG sources in assets/icons.
# Needs Inkscape. Each icon has a heavier "-small" drawing for 16px, because the
# fine one turns to mush at that size, the way Chrome's own icons are drawn.
set -e
cd "$(dirname "$0")/.."
for small in assets/icons/*-small.svg; do
  name=$(basename "$small" -small.svg)
  inkscape "$small" -w 16 -h 16 -o "static/icons/$name-16.png"
  for size in 32 48 128; do
    inkscape "assets/icons/$name.svg" -w "$size" -h "$size" -o "static/icons/$name-$size.png"
  done
done
