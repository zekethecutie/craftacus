# Craftein Bedrock planning amendment

**Status:** Shared planning baseline; provisional until the owner confirms canon, target Bedrock environment, and assets.

This document supplements [`craftein-server-blueprint.md`](./craftein-server-blueprint.md) and the Bedrock add-on handoff. It records requirements that must remain in scope while the Craftein website, Craftacus, and future Bedrock add-on work are coordinated.

## 1. Existing add-on ecosystem

CRAFTEIN is intended to **extend and utilize** its existing add-on ecosystem, not merely avoid conflicts with it. The current inventory is:

| Pack | Intended relevance to future planning |
|---|---|
| VCMC-SERVER | Existing server functionality; inspect before integration. |
| Æon Structures v1.0.5 | Possible ancient structures and civilization remnants. |
| Better Structures 2.0 | Possible world-building and discovery support. |
| Better Trees by Daniye v1.4.3 | Natural world atmosphere and exploration. |
| Dynamic Light | Exploration atmosphere and dungeon readability. |
| Effortless Building v4.0 | Existing building workflow; do not disrupt. |
| Essentials / Essentials _2 | Utility features; determine whether these are duplicates or separate versions. |
| Fishing | Exploration, travel, and possible lore/resource hooks. |
| Furniture | Environmental storytelling and civilization interiors. |
| Hidden Doors 2.0 | Dungeon, ruin, and secret-room design. |
| More Villages | Present-day settlement and civilization contrast. |
| Night Vision v1.7 | Existing player utility; inspect interaction with darkness and boss design. |
| RAFTS skin pack | Cosmetic content; avoid gameplay coupling. |
| Recurrent Complex v1.4.0 | Possible structure/discovery support; inspect Bedrock implementation and identifiers. |
| THE BLOOP RP / THE BLOOP RP _2 | Determine whether these are duplicates or separate resource/behavior components. |
| Torches Reimagined V26+ | Lighting atmosphere; inspect resource conflicts. |
| TPA Addon | Existing player travel workflow; do not silently replace it. |
| Travelcraft | Existing travel/exploration workflow; investigate safe extension points. |

The actual `.mcaddon` and `.mcpack` files, manifests, dependencies, namespaces, scripts, load order, target versions, and licenses must be audited before compatibility claims are made. CRAFTEIN should use its own `craftein:` namespace and additive content wherever possible. Marketplace packs may not expose callable APIs; visible gameplay integration is not the same as access to private implementation.

## 2. Phase 1 player-only boundary

The lore may say that all living beings were blessed by the Danans. The first practical life system should track **players only**. Persisting life data for every ordinary animal and hostile mob would create unnecessary storage and performance costs.

Special registered entities may receive separate life or soul logic later, including named bosses, dragons, Danan entities, and other explicitly designed creatures. This distinction must be documented rather than treated as a contradiction in the lore.

## 3. Future boss contribution and relic selection

The future one-of-one weapon system must use a server-side contribution ledger. The primary proposed winner is the player with the highest amount of **verified valid damage** against the boss, but the final reward must also enforce participation and anti-abuse rules.

The future ledger should be designed to support:

- Player UUID and encounter instance ID.
- Valid damage across the complete encounter, not merely the final hit.
- Damage by boss phase.
- Arena presence and meaningful participation time.
- Minimum contribution thresholds.
- Deaths, re-entry, and disqualification rules.
- Direct melee and projectile attribution.
- Player-owned summons where attribution is reliable.
- Damage-over-time effects such as fire or poison where attribution is reliable.
- Reflected, environmental, command, and ambiguous damage as separate categories.
- Damage caused through or affected by other add-ons.
- Implausible damage-rate checks and exploit flags.
- Disconnect and reconnect behavior.
- Final encounter freezing before winner selection.

The final hit must not automatically grant ownership. If attribution is uncertain, the system should fail closed rather than award a unique relic based on a guess. A completed encounter must create a unique, restart-safe reward transaction. The future reward flow is:

```text
Boss defeated
  -> encounter is frozen
  -> ledger is finalized
  -> eligibility is evaluated
  -> winner is selected
  -> unique relic instance is created
  -> winner performs a controlled claim
  -> ownership is recorded
```

Non-winning participants should receive meaningful rewards unless the owner later approves a strict no-reward design. Possible rewards include lore credit, materials, titles, fragments, access progression, or discovery records, but these are not final canon.

## 4. Boss combat target

Future bosses should feel like difficult but learnable Dark Souls or Sekiro encounters. Difficulty should come from readable attack tells, timing, positioning, delayed attacks, punish windows, phase transitions, arena hazards, stagger or posture-like vulnerability, and meaningful consequences—not only inflated health and damage values.

Multiplayer bosses must resist stun-locking, arena cheese, unloaded-chunk exploits, projectile or entity duplication, permanent safe zones, and desynchronization after disconnects or server restarts. The encounter state must be server-authoritative and recoverable.

## 5. Legendary weapon identity

The planned four or five major weapons are one-of-one status symbols tied to ancient civilizations, deities, cosmic events, hidden structures, progressive clues, boss trials, and difficult exploration. They should feel like symbols of status, power, greatness, and survival rather than ordinary stronger swords.

They are expected to be:

- Unique per world.
- Soulbound to one player at a time.
- Obtained through a long and cryptic discovery chain.
- Visually distinctive and high-effort.
- Powerful but balanced through preparation, costs, sacrifices, cooldowns, limited charges, vulnerability, or environmental requirements.
- Capable of controlled ownership transfer only if the owner approves a meaningful in-world rule.
- Original in identity rather than a copy of an orbital-strike-style weapon.

The supplied reference direction includes divine, aquatic, chrono, soul, sculk, molten, mythic, demonic, corrupted, floral, cybernetic, and cosmic-looking weapon families. The eventual Bedrock resource pack must be inspected separately; a Java resource pack cannot be assumed to work on Bedrock. Gameplay IDs must remain independent of visual model names.

## 6. Structures and `.mcstructure` workflow

The owner plans to build large ruins, civilizations, dungeons, boss arenas, and hidden relic sites, export them as `.mcstructure` files, and provide them later. Future systems must account for:

- Controlled one-time placement and persistent placement records.
- A world-level structure registry.
- Dimension or region association.
- Rotation and mirroring.
- Block palette and entity-data compatibility.
- Loot, commands, and dependencies on other packs.
- Large-structure performance.
- Discovery conditions and progressive access.
- Duplicate prevention for one-of-one locations.

A legendary site must not regenerate or create a second relic simply because a chunk unloaded, a trigger ran twice, or the server restarted.

## 7. Dimensions and The Root

The future cosmology may involve the Overworld, Nether, End, The Root, and other cosmic or universal regions. The Root is a proposed extra region associated with deeper origins and should remain provisional until the owner defines its lore.

Custom Bedrock dimensions must be evaluated against the exact target Bedrock version and server software. If a true custom dimension is unreliable, a dimension-like region may preserve the intended narrative through terrain, fog, lighting, structures, particles, entities, and rules without changing the lore goal.

## 8. Visual and technical-art scope

Future work may include Bedrock-compatible weapon models and textures, animation controllers, Molang calculations, Snowstorm particle effects, sprite sheets, custom sounds, glowing VFX, dragons, cosmic gods, cinematic boss animations, dialogue, and cutscenes. The intended quality is polished and cinematic, comparable to strong Marketplace-style or high-quality fantasy/anime add-on presentation.

This is future work, not Phase 1 implementation. Current architecture should leave stable extension points for effects, animation, sound, camera sequences, boss phases, and relic abilities without prematurely coupling the life system to unfinished assets.

## 9. GUI scope

GUI is secondary. It may later support ritual confirmation, optional lore archives, contribution summaries, settings, and restricted admin tools. It must not replace natural exploration, structures, books, maps, dialogue, sounds, particles, and environmental storytelling.

The primary player experience remains vanilla-feeling survival with supernatural consequences and optional investigation.

## 10. Website, Craftacus, and add-on boundaries

The website is the public editorial and community hub, while Craftacus is the Discord bot. The website and Craftacus currently use separate data stores and must not be merged casually. The website’s MySQL/Drizzle details, Craftacus’s Neon/Postgres details, owner console behavior, and status APIs are **agent-reported and awaiting owner confirmation** unless verified in the repository and deployment environment.

The Bedrock add-on should not directly depend on either database during Phase 1. If a future synchronization bridge is desired, it must be deliberately designed with authentication, privacy, failure handling, and a documented source of truth.

## 11. Owner decisions still required

Before locking life mechanics, deep canon, or compatibility targets, the owner must decide:

1. What exactly are the Danans?
2. Why were lives granted, and who was eligible?
3. What is the void, and what does soul loss mean?
4. Are three lives and the proposed soul-loss duration approved?
5. What happens at zero lives: removal, restriction, or another state?
6. Does the soul-loss timer continue while the server is offline?
7. What does resurrection restore, and what does it cost?
8. Can an offline player be resurrected?
9. Can resurrection fail, and what happens to offerings if it does?
10. Can a player be resurrected repeatedly?
11. What are the names, values, technologies, and collapse causes of the ancient civilizations?
12. What are the Nether, End, and The Root rules in this universe?
13. What does the name Craftein mean in-world?
14. Which truths must remain hidden, and which false assumptions or twists are intended?
15. Is the story fixed, player-influenced, or partly improvised?
16. Which exact Bedrock version, server software, experiments, pack order, and concurrent-player target must be supported?
17. Are the duplicate-looking Essentials and THE BLOOP RP packs separate versions or accidental duplicates?
18. Is highest verified boss damage definitely the primary relic-winner rule?
19. What rewards should non-winning boss participants receive?
20. Can a relic owner lose, transfer, or permanently bind a weapon?

Until these decisions are answered, mechanics and canon should remain clearly marked as provisional and configurable rather than silently fixed in code.
