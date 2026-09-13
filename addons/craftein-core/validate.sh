#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

node --check "$ROOT/behavior_pack/scripts/config.js"
node --check "$ROOT/behavior_pack/scripts/main.js"
python3 - "$ROOT" <<'PY'
import json
import pathlib
import sys

root = pathlib.Path(sys.argv[1])
for path in (root / "behavior_pack/manifest.json", root / "resource_pack/manifest.json"):
    with path.open() as f:
        manifest = json.load(f)
    if manifest["format_version"] != 2:
        raise SystemExit(f"unsupported manifest format in {path}")
    if len(manifest["header"]["uuid"]) < 36:
        raise SystemExit(f"missing header uuid in {path}")

print("CRAFTEIN add-on validation passed")
PY

mkdir -p "$ROOT/dist"
rm -f "$ROOT/dist/craftein-core-behavior.mcpack" "$ROOT/dist/craftein-core-resources.mcpack" "$ROOT/dist/craftein-core.mcaddon"
(
  cd "$ROOT/behavior_pack"
  zip -qr "$ROOT/dist/craftein-core-behavior.mcpack" .
)
(
  cd "$ROOT/resource_pack"
  zip -qr "$ROOT/dist/craftein-core-resources.mcpack" .
)
(
  cd "$ROOT/dist"
  zip -q craftein-core.mcaddon craftein-core-behavior.mcpack craftein-core-resources.mcpack
)

echo "Created: $ROOT/dist/craftein-core.mcaddon"
