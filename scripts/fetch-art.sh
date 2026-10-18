#!/usr/bin/env bash
# Downloads the Fluent Emoji 3D artwork (MIT, Microsoft) for the stickers and badges
# and converts it to WebP. The list comes from js/data/shop.js (each item's `fluent` name).
# Dev-only: needs node, curl and cwebp (brew install webp). Run from the repo root:
#   bash scripts/fetch-art.sh
set -euo pipefail

BASE="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p art/stickers art/badges

# kind|game id|Fluent asset name
MAP=$(node --input-type=module -e '
  const { STICKERS, BADGES } = await import("./js/data/shop.js");
  for (const s of STICKERS) console.log(`stickers|${s.id}|${s.fluent}`);
  for (const b of BADGES) console.log(`badges|${b.id}|${b.fluent}`);
')

missing=0
while IFS='|' read -r kind id name; do
  [ -z "$kind" ] && continue
  folder=$(printf '%s' "$name" | sed 's/ /%20/g')
  file=$(printf '%s' "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')
  if ! curl -sSfL --retry 3 -o "$TMP/$id.png" "$BASE/assets/$folder/3D/${file}_3d.png"; then
    echo "MISSING: $kind/$id (Fluent \"$name\")" >&2
    missing=$((missing + 1))
    continue
  fi
  cwebp -quiet -q 80 -resize 256 256 "$TMP/$id.png" -o "art/$kind/$id.webp"
  echo "art/$kind/$id.webp $(wc -c < "art/$kind/$id.webp" | tr -d ' ') bytes"
done <<< "$MAP"

curl -sSfL --retry 3 -o art/LICENSE-fluentui-emoji.txt "$BASE/LICENSE"
echo "Wrote art/LICENSE-fluentui-emoji.txt"
[ "$missing" -eq 0 ] || { echo "$missing asset(s) missing; pick other Fluent names in js/data/shop.js" >&2; exit 1; }
