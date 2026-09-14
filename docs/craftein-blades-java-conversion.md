# CRAFTEIN Blades of Majestica Java conversion assessment

## Findings

The supplied `BladesOfMajestica(1).zip` is a Java resource pack targeting Minecraft 1.21.5 or newer. It contains approximately 119 item model JSON files and many item textures, including animated vertical sprite sheets with Java `.mcmeta` metadata. Representative weapon textures are commonly 128×128 RGBA images. Animated layers include dimensions such as 32×1920 or 16×960, where the Java metadata defines frame timing.

The archive is primarily an item-model and texture pack. The inspected archive does not contain an Ender Dragon entity model, OptiFine/CEM model, Blockbench project, or a Bedrock geometry file. Therefore the Ender Dragon cannot be converted from this archive alone. A separate authorized Java model, OptiFine/CEM resource, or `.bbmodel` is needed.

## Conversion path

The Java item model format is close enough to Blockbench’s cube-based representation that a first-pass converter can preserve many cube positions, sizes, pivots, rotations, and texture references. The reusable converter is `tools/java_model_to_bedrock.py`. It writes a Bedrock geometry draft with a root bone and emits warnings whenever face-specific or reversed Java UVs require manual verification.

The authorized Java Excalibur model was converted as an engineering test into:

```text
addons/craftein-core/resource_pack/models/entity/astral_blade.json
```

This is a **draft**, not a claim of visually complete conversion. The model contains many face-specific UV differences, so it must be opened in Blockbench, checked against the source, and remapped to a final Bedrock texture atlas or geometry-compatible texture layout.

The prototype does not map the Java Excalibur texture directly to gameplay. It uses an original CRAFTEIN Astral Blade icon and an original CRAFTEIN particle sprite sheet. The Java texture is kept only as a permission-authorized study/conversion reference in the local development workspace.

## Java animation metadata versus Bedrock particles

Java `.mcmeta` animation metadata cannot be copied into Bedrock unchanged. Bedrock particles require a particle JSON with explicit flipbook UV dimensions, frame step, frame rate, lifetime behavior, and rendering material. The prototype therefore generates an original 16-frame horizontal ritual sheet and uses it through a Bedrock particle flipbook.

The next asset conversion step for a selected weapon is:

```text
Java model and texture
  -> Blockbench visual verification
  -> Bedrock geometry and texture path
  -> attachable mapping
  -> item texture mapping
  -> optional particle/animation layers
  -> in-game first-person and third-person review
```

## Ender Dragon conversion

A Java Ender Dragon model is a different class of conversion from a Java item model. The target may be:

- A replacement Bedrock client entity using the vanilla dragon identifier, which risks compatibility with other packs.
- A separate CRAFTEIN boss entity that uses the dragon as a behavioral reference while retaining vanilla Ender Dragon coexistence.
- A fully custom boss with Bedrock geometry, animation controllers, render controllers, hitboxes, phases, and server-authoritative damage logic.

The safe CRAFTEIN default is a separate custom boss identifier until the exact model and existing-pack compatibility are audited. Replacing the vanilla Ender Dragon should not happen implicitly.

## Licensing and provenance

The owner has stated that permission exists to port the weapon assets. Each ported asset should still retain a provenance record, original author credit where required, and a clear decision on whether it is allowed in a private server only or in a public distribution. The CRAFTEIN repository should avoid importing an entire third-party pack when only selected, permission-cleared assets are needed.
