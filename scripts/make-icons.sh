#!/usr/bin/env bash
# Regenerates the app icons in icons/: Bruno's face over place-value blocks on sky blue.
# macOS dev-only (Google Chrome + sips + node). Run from the repo root: bash scripts/make-icons.sh
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# Bruno's head: crop the shared SVG to his face (cap to shoulders, with the waving hand).
BRUNO=$(node --input-type=module -e 'import { brunoSvg } from "./js/bruno.js"; process.stdout.write(brunoSvg().replace(/viewBox="[^"]*"/, "viewBox=\"2 -12 116 100\""))')

# page <art-scale-percent> <out>: art is centered, scaled so it stays inside the safe zone.
page() {
cat > "$TMP/$2.html" <<HTML
<!doctype html><html><body style="margin:0">
<div style="width:1024px;height:1024px;background:radial-gradient(circle at 30% 25%, #e3f4ff, #bfe6ff 70%);
            display:grid;place-items:center;position:relative;overflow:hidden">
  <div style="width:$1%;aspect-ratio:1;position:relative">
    <div style="position:absolute;left:6%;right:6%;top:0;height:80%">$BRUNO</div>
    <div style="position:absolute;left:0;right:0;bottom:4%;height:34%;display:flex;gap:4%;justify-content:center;align-items:flex-end">
      <div style="width:28%;height:100%;background:#e8453c;border-radius:12%;box-shadow:inset 0 -10px 0 rgba(0,0,0,.15)"></div>
      <div style="width:28%;height:80%;background:#2f80ed;border-radius:12%;box-shadow:inset 0 -10px 0 rgba(0,0,0,.15)"></div>
      <div style="width:28%;height:60%;background:#27ae60;border-radius:12%;box-shadow:inset 0 -10px 0 rgba(0,0,0,.15)"></div>
    </div>
  </div>
</div></body></html>
HTML
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1024,1024 \
  --screenshot="$TMP/$2.png" "file://$TMP/$2.html" >/dev/null 2>&1
}

page 88 full
page 58 maskable
sips -z 512 512 "$TMP/full.png" --out icons/icon-512.png >/dev/null
sips -z 192 192 "$TMP/full.png" --out icons/icon-192.png >/dev/null
sips -z 180 180 "$TMP/full.png" --out icons/icon-180.png >/dev/null
sips -z 512 512 "$TMP/maskable.png" --out icons/icon-maskable-512.png >/dev/null
echo "Wrote icons/icon-{180,192,512}.png and icons/icon-maskable-512.png"
