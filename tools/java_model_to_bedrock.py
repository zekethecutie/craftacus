#!/usr/bin/env python3
"""Convert a simple Blockbench Java item model into a Bedrock geometry.

The converter preserves cube positions, rotations, texture references, and a
best-effort planar UV origin. Java face UVs can be reversed or face-specific;
those cases are marked in the output for manual Blockbench verification.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 4:
        print("usage: java_model_to_bedrock.py input.json output.json geometry_identifier", file=sys.stderr)
        return 2
    source = Path(sys.argv[1])
    destination = Path(sys.argv[2])
    identifier = sys.argv[3]
    model = json.loads(source.read_text())
    elements = model.get("elements", [])
    textures = model.get("textures", {})
    output_cubes = []
    warnings = []

    for index, element in enumerate(elements):
        start = element.get("from", [0, 0, 0])
        end = element.get("to", [0, 0, 0])
        origin = element.get("rotation", {}).get("origin", [8, 8, 8])
        angle = element.get("rotation", {}).get("angle", 0)
        axis = element.get("rotation", {}).get("axis", "y")
        size = [end[i] - start[i] for i in range(3)]
        faces = element.get("faces", {})
        face = next(iter(faces.values()), {})
        uv = face.get("uv", [0, 0, 0, 0])
        uv_origin = [uv[0], uv[1]] if len(uv) >= 2 else [0, 0]
        if any(f.get("uv", [0, 0, 0, 0])[0] > f.get("uv", [0, 0, 0, 0])[2] for f in faces.values()):
            warnings.append(f"element {index} has reversed UV coordinates")
        if len({tuple(f.get("uv", [])) for f in faces.values()}) > 1:
            warnings.append(f"element {index} has face-specific UVs; verify in Blockbench")
        output_cubes.append({
            "origin": start,
            "size": size,
            "uv": {"north": uv_origin, "east": uv_origin, "south": uv_origin, "west": uv_origin, "up": uv_origin, "down": uv_origin},
            "inflate": 0,
            **({"rotation": [angle if axis == "x" else 0, angle if axis == "y" else 0, angle if axis == "z" else 0], "pivot": origin} if angle else {})
        })

    geometry = {
        "format_version": "1.12.0",
        "minecraft:geometry": [{
            "description": {
                "identifier": identifier,
                "texture_width": 128,
                "texture_height": 128,
                "visible_bounds_width": 4,
                "visible_bounds_height": 4,
                "visible_bounds_offset": [0, 1, 0]
            },
            "bones": [{"name": "root", "pivot": [8, 8, 8], "cubes": output_cubes}]
        }],
        "_conversion_notes": {
            "source": str(source),
            "java_textures": textures,
            "warnings": warnings
        }
    }
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(geometry, indent=2) + "\n")
    print(f"converted {len(output_cubes)} cubes -> {destination}")
    if warnings:
        print(f"manual verification warnings: {len(warnings)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
