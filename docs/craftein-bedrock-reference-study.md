# CRAFTEIN Bedrock reference study

**Status:** Technical reference only. No third-party code, names, models, textures, particles, or sounds are being redistributed by CRAFTEIN through this study.

## Sources reviewed

The study covered the supplied `[RPG]ElementalWeapon(bugfix+dashremove).mcaddon`, the supplied `RP.mcpack`, the supplied `BP.mcpack`, the [RPG Elemental Weapon MCPEDL page](https://mcpedl.com/rpg-elemental-weapon/), and the supplied YouTube reference [The Sword of Promised Victory  Minecraft Bedrock Addon](https://www.youtube.com/watch?v=tKjtTdpJZTE).

The MCPEDL page describes the Elemental Weapon add-on as a large Bedrock fantasy/survival weapons pack with custom weapons and effects. It lists support for Bedrock versions including 1.21.121, 1.21.132, 26.0, 26.3, 26.10, 26.11, and 26.30. Its comments also reveal practical concerns relevant to CRAFTEIN: third-party compatibility, performance delay, and persistent visual trails that can obstruct first-person play.

The YouTube page identifies the supplied video as **The Sword of Promised Victory || Minecraft Bedrock Addon** by Crafted Vision. The accessible page describes a showcase/release of a custom weapon and mentions bug-fixing around an Avarice scythe, which reinforces that high-end weapon add-ons require iterative testing rather than only asset creation.

## Supplied Shounen-style pack structure

The extracted behavior pack contains approximately 355 files: 186 JSON files, 169 function files, 121 entity definitions, 27 items, four animation files, and 12 animation-controller files. The extracted resource pack contains approximately 778 files: 503 JSON files, 290 particle definitions, 22 attachables, 41 animation files, eight render controllers, 157 PNG textures, and 114 OGG sounds.

This is a useful reference for how a polished effect-heavy pack separates concerns:

| Layer | Observed pattern |
|---|---|
| Behavior functions | One function family per weapon, with selection, activation, cooldown, and skill-stage files. |
| Skill entities | Invisible or visual-only entities represent attacks, beams, slashes, explosions, and timed effects. |
| Resource client entities | Skill entities link geometry, textures, render controllers, and direct animation playback. |
| Attachable weapons | Equipped weapon geometry and textures are supplied through `minecraft:attachable`. |
| Particles | Large library of small named effects for charge, slash, trail, shockwave, explosion, smoke, and ambient states. |
| Sounds | Separate sound assets support skill timing and impact feedback. |
| Functions | Scoreboards and tags act as timers, skill selectors, cooldown flags, and state locks. |
| Structures | The pack includes at least one arena structure, demonstrating an encounter can package an environment with the combat system. |

## Verified implementation patterns

### 1. Timed command-function state machines

A representative skill function uses a scoreboard timer as a frame clock. It applies effects, moves the caster, emits particles, plays sounds, damages a bounded entity selection, shakes the camera, and finally resets the timer. The observed pattern is approximately:

```text
skill selected
  -> start numeric timer
  -> execute stage-specific commands at exact timer ranges
  -> emit particles/sounds/camera feedback
  -> apply gameplay damage/effects
  -> announce cooldown completion
  -> reset timer
```

This is effective for deterministic cinematic timing, but CRAFTEIN should improve it by centralizing skill definitions, avoiding hundreds of duplicated objectives, bounding all selectors, and keeping authoritative damage separate from visual effects.

### 2. Selection plus cooldown locks

The representative activation functions use a selected-skill scoreboard value and per-skill timer scoreboards. Tags such as `is_flying`, `is_ultimate`, and skill-specific lock tags prevent conflicting abilities from being activated simultaneously. The same architecture maps well to a CRAFTEIN skill service, but should use stable namespaced state and explicit server-side validation rather than relying only on visible messages.

### 3. Skill entities as animated effect carriers

A representative high-intensity skill entity is non-spawnable, summonable, invulnerable to damage, gravity-free, scaled, and given a short timer. When its timer ends, it enters a vanish component group and despawns. Its client entity supplies geometry, an outline texture, render controllers, and an animation. This is a strong pattern for beams, slash planes, portals, pillars, and staged explosions because the entity gives the effect a world position and lifetime.

### 4. Attachables for weapon presentation

A representative attachable maps a weapon identifier to a material, default and enchanted textures, geometry, a render controller, and a holding animation. This confirms that CRAFTEIN can separate a stable gameplay weapon ID from its visual asset mapping. The model can change without changing ownership, progression, or ability logic.

### 5. Particle composition

A representative explosion particle uses additive rendering, a custom texture, a disc emitter, dynamic motion with drag, randomized lifetime and spin, billboard presentation, a vertical flipbook sprite sheet, and gradient tinting. This is the core visual recipe for many high-quality effects:

```text
sprite sheet
  + bounded emitter shape
  + randomized motion/lifetime
  + billboard orientation
  + tint gradient
  + additive material
  = layered effect with motion and glow
```

The resource pack includes particle patterns for charge, ready, slash, shockwave, smoke, floor impact, trails, and explosions. CRAFTEIN can create original sprite sheets and particle JSON with the same principles while using its own identifiers and visual language.

### 6. Lighting and outline treatment

The resource pack uses render controllers with `ignore_lighting`, elevated `light_color_multiplier`, outline materials, overlay colors, and part visibility to create bright magical effects and separate inner/outline passes. This is useful for CRAFTEIN’s future cosmic and relic visuals, but it must be performance-tested and kept readable in first person.

### 7. Item activation model

The supplied behavior pack includes simple custom item definitions using unique identifiers, single-stack limits, and long-use/food components as interaction hooks. This demonstrates a lightweight activation path, but CRAFTEIN should prefer modern, target-version-appropriate item interactions and Script API validation where available. Visible names and item use must not be the sole authority for skill ownership or cooldowns.

## What CRAFTEIN should adopt

CRAFTEIN should adopt the reference packs’ **layered effect architecture**, not their identifiers or content:

1. Define a stable `craftein:` weapon or relic identity.
2. Give it a separate behavior definition and authoritative ability service.
3. Use attachables for held/equipped visual presentation.
4. Use client skill entities for world-positioned beams, slashes, portals, and explosions.
5. Use short-lived, bounded particles as visual layers around those entities.
6. Use animation timelines for readable charge, release, impact, and recovery phases.
7. Use sound and camera feedback as synchronized presentation, not gameplay authority.
8. Apply damage and effects through validated server-side code with explicit range, target, cooldown, and cost checks.
9. Keep every effect count, lifetime, selector radius, and entity lifetime bounded for multiplayer performance.
10. Add a fallback for missing or incompatible resource-pack assets.

## What CRAFTEIN should improve

The reference pack appears heavily dependent on a custom `minecraft:player` entity definition, scoreboard objectives, tags, command functions, and large duplicated function families. That approach can be effective in a controlled pack, but it is a major compatibility risk for a server already using Marketplace and utility add-ons. CRAFTEIN should avoid overriding the player definition unless a later compatibility audit proves it is safe.

The reference command functions also use broad entity selectors and direct `damage` commands. CRAFTEIN should instead use bounded selectors, explicit exclusion families/tags, encounter IDs, rate limits, and a combat ledger for any boss or relic event. Visual effect entities must never grant ownership or determine the winner of an encounter.

The MCPEDL comments mention visual trails obstructing first-person play and performance delay with other add-ons. CRAFTEIN should therefore provide effect-quality settings, avoid indefinite trail particles, cap concurrent skill entities, clean up abandoned effects after restart, and include a low-effects fallback.

The reference pack’s use of `two:`, `one:`, and `vision:` namespaces demonstrates why CRAFTEIN must maintain its own namespace and never rely on another pack’s internal identifiers. The reference files also include older format versions, so target Bedrock version compatibility must be checked before adopting any syntax.

## CRAFTEIN implementation direction

The first life/ritual core remains separate from weapon visuals. The future weapon system will eventually add a `SkillDefinition` layer with fields such as:

```text
skillId
weaponId
activationMode
cooldownTicks
castTicks
recoveryTicks
resourceCost
range
radius
maxTargets
damageProfile
particleSequence
soundSequence
animationSequence
counterplayWindow
```

The server validates the definition and state before starting a skill. A skill execution receives an instance ID so all spawned entities, particles, damage events, and cleanup operations can be associated with one activation and safely terminated.

The future asset workflow will be:

```text
original texture/sprite sheet or authorized asset
  -> Bedrock particle JSON
  -> client skill entity / attachable
  -> animation and render-controller mapping
  -> Script API skill sequence
  -> bounded server-authoritative gameplay result
```

The supplied packs are study references. Their files should not be copied into CRAFTEIN unless the owner has the necessary permission and the asset is explicitly approved for use. The CRAFTEIN pack should use original names, original identifiers, and original lore for its weapons.
