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

## 11. Weapon, skill, particle, and animation references

The owner has identified the following as visual and mechanical references rather than content to copy blindly:

- [RPG Elemental Weapon](https://mcpedl.com/rpg-elemental-weapon/)
- Shounen de Fantasy-style Bedrock add-ons
- Heroic Productions add-ons
- Marketplace custom weapons with skills
- Brutal Legends-style presentation
- Java RPG mods and class/skill systems as mechanical references

The cited RPG Elemental Weapon page demonstrates the target category: custom fantasy weapons with special effects and a large Bedrock distribution, while also showing why compatibility and performance must be tested when multiple add-ons are installed. The user’s target is not a generic RPG conversion; CRAFTEIN should retain vanilla survival, exploration, civilization, mystery, and earned-power identity.

The planned implementation is layered:

| Layer | Responsibility |
|---|---|
| Bedrock behavior pack | Stable item/entity identifiers, damage rules, tags, recipes where approved, and gameplay events. |
| Resource pack | Textures, attachables, geometry, render controllers, animation files, sounds, UI assets, and particles. |
| Script API | Server-authoritative cooldowns, skill validation, targeting, damage, costs, progression, life/ritual state, and anti-abuse checks. |
| Animation controllers | State-based weapon/entity presentation such as idle, charging, activation, recovery, and phase states. |
| Particle systems | Controlled VFX using custom textures, emitters, Molang variables, and bounded lifetimes/counts. |
| Optional native-style GUI | Skill selection, loadouts, ritual confirmation, and administrative tools; never the primary world experience. |

Future RPG-like skill selection should use a server-owned loadout record rather than trusting visible item names or client UI. A skill activation should validate ownership, selected loadout, cooldown, resource cost, location, target, phase restrictions, and rate limits before it emits effects or applies damage. Visual effects must never be the authority for gameplay damage.

The future custom-weapon pipeline is:

```text
Stable craftein weapon ID
  -> behavior item and gameplay rules
  -> attachable / geometry / texture mapping
  -> animation controller state
  -> Script API ability validation
  -> bounded particle and sound sequence
  -> server-authoritative damage/effects
```

The weapon resource pack supplied by the owner must be inspected for Bedrock compatibility and authorization before it is ported or redistributed. Java-only model conventions cannot be assumed to work on Bedrock. Third-party references may guide implementation quality and design language, but their files, names, textures, models, animations, particles, and code must not be copied without permission.

Phase 1 should build and test world mechanics first: Danan blessing state, player lives, death processing, soul-loss state, Resurrection Totem/ritual, persistence, and configurable effects. Weapon skills, RPG classes, advanced combat, and high-cost VFX remain later layers that consume stable core APIs.

## 12. Owner decisions still required

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

## 13. New proposed life mechanics: HUD, Plunder, and resurrection paths

The owner has proposed a three-life presentation and recovery system. These mechanics are design proposals and are not final canon until tested and approved.

### 13.1 Three-life HUD

The player should see a small, persistent reminder of remaining lives. The visual language should resemble the **hardcore heart presentation**, even though the server is not technically vanilla Hardcore mode. The purpose is clarity and atmosphere: three life icons communicate that the player has a limited number of returns.

The HUD should:

- Show the current life count from server-authoritative state.
- Use a custom heart texture or heart-like life icon in the resource pack.
- Be visually distinct from the ordinary health bar so players do not confuse health with lives.
- Occupy a restrained area of the HUD and avoid covering crosshairs, hotbars, inventories, boss bars, or other add-on UI.
- Update only when the life state changes or at a low frequency, not every tick unless the target Bedrock UI requires it.
- Remain readable on mixed screen sizes and platforms.
- Support full, empty, lost, pending-resurrection, and corrupted/blocked states if those are later approved.

The implementation should prefer an additive custom HUD element in the resource pack's HUD layer. Bedrock `hud_screen` modifications are version-sensitive and may conflict with resource packs such as Night Vision, Torches Reimagined, THE BLOOP RP, or other packs that alter UI. Therefore the HUD needs a compatibility test and a fallback mode, such as an action-bar reminder or a small vanilla-compatible status message. It must not replace the gameplay HUD or depend on a large menu.

### 13.2 Plunder life transfer

The owner has proposed a custom **Plunder potion**. When a player has the Plunder effect and validly kills another player, one life is transferred from the victim to the killer. The intended potion visual is a dark-crimson-to-bright-red gradient. The potion, effect, and transfer are separate from ordinary health regeneration or combat damage.

The safe proposed transaction is:

```text
Player drinks or receives Plunder effect
  -> server records a time-limited Plunder charge
  -> player validly kills another player
  -> server verifies the killer, victim, cause, encounter, and cooldown
  -> exactly one life is removed from the victim
  -> exactly one life is granted to the killer
  -> charge is consumed
  -> both player records and the audit event are persisted
  -> HUDs and messages update
```

Required safeguards:

- The transfer must be server-authoritative and UUID-based.
- A kill must be attributed to the killer through a valid player-caused damage path; fall, lava, void, command, environmental, and ambiguous deaths must not automatically qualify.
- The transfer must be idempotent so one death cannot trigger twice.
- The killer must be below the configured maximum life capacity; a full player should not be able to farm a victim for no meaningful cost.
- The victim must have a transferable life under the final rules. The owner must decide whether the final remaining life is protected or whether Plunder may reduce a player to zero and trigger soul loss.
- The effect should normally be consumed on a successful transfer, not remain indefinitely active.
- There should be a duration, one-kill charge, and post-transfer cooldown.
- Repeated kills of the same victim should be rate-limited or blocked for a configurable period.
- Alternate accounts, arranged kills, spawn killing, and rapid victim rotation should be detectable through audit logs and optional protection rules.
- A player should not gain more than the configured maximum lives.
- If the victim's life cannot be removed and the killer's life cannot be granted atomically, the transaction should fail closed and preserve the prior state.
- The system must define whether Plunder is allowed during protected events, boss encounters, safe zones, rituals, or server-start grace periods.

The design should distinguish **life theft** from ordinary PvP. A player can still kill another player normally without transferring a life unless the Plunder condition is valid. The future potion recipe must be difficult enough that life transfer is a major political and strategic act rather than a routine combat consumable.

### 13.3 Two resurrection paths

The owner has proposed two separate systems:

#### A. Resurrection Totem / prepared anchor

This is an item or artifact that a living player obtains and sets before death. It may bind to a location, player, or ritual state. If the player later exhausts their lives, the prepared anchor can make them eligible for a defined resurrection path without requiring them to interact while dead or spectating.

This distinction matters because an exhausted player may be unable to interact normally in spectator mode. The server should not depend on a dead player clicking a block. A prepared totem should instead register its state before death and trigger a pending-resurrection record when the player reaches zero lives.

The owner must decide whether a prepared totem:

- Prevents the player from entering the full soul-loss state.
- Places the player in a pending state until a ritual is completed.
- Automatically returns the player after a delay.
- Requires another player to activate it.
- Is consumed on use.
- Returns one life or a weakened resurrection state.

#### B. Resurrection Altar with GUI

The altar is a fixed world object or structure used by living players to resurrect an exhausted player who is offline, soul-lost, banned by the add-on, or in a spectator/restricted state. The altar GUI is appropriate for selecting a target and confirming the required exchange, but the GUI is only the interaction layer; the server validates and commits the ritual.

The altar should support:

- A list or search of eligible player targets without exposing unnecessary private information.
- Clear display of the cost, target state, ritual duration, and irreversible consequences.
- Confirmation before consuming rare materials or a donor life.
- Offline targets identified by stable UUID and safe display name.
- A staged ritual that can be interrupted and recovered.
- Permission checks for who may use the altar.
- A server-side transaction record and audit log.

### 13.4 Equivalent exchange and balance direction

The owner wants resurrection to follow an equivalent-exchange principle: a life or resurrection cannot be created casually from nothing. This is a strong balance direction. The preferred design should combine a **rare world-discovered catalyst** with a meaningful sacrifice rather than relying only on a cheap recipe.

The strongest provisional model is:

```text
Resurrection Altar
  + rare discovered catalyst or relic fragment
  + ritual location and time
  + donor sacrifices one of their own lives
  -> target returns with one life or a defined weakened state
```

This makes resurrection possible but expensive, political, and memorable. A purely craftable altar risks turning resurrection into an industrial resource loop. A completely unobtainable altar risks making the life system feel arbitrary. A hybrid model is more controllable:

- The altar itself may be found in a structure, repaired, or crafted only from extremely rare world-bound components.
- The catalyst should be limited by exploration, structure loot, or a controlled event rather than infinite ordinary crafting.
- The donor sacrifice must be recorded and committed exactly once.
- The donor should not be able to sacrifice below a protected minimum unless that extreme rule is explicitly approved.
- The target should generally return with one life, not automatically regain all three.
- Resurrection may carry a debt, mark, cooldown, temporary weakness, or lore consequence; these are provisional options.

The alternative model—crafting the altar from difficult resources without a donor sacrifice—should remain available as a later balance test, but it should not be selected silently. The owner should decide whether the dramatic cost is personal life, rare catalyst, permanent debuff, territorial risk, or a combination.

### 13.5 Spectator and zero-life behavior

The owner has suggested that players who exhaust their lives may become spectators instead of receiving a conventional permanent ban. This is technically and socially more flexible, but the exact state must be defined. A provisional model is:

```text
Lives reach zero
  -> player is moved to a restricted/spectator state
  -> soul-loss record stores the expiry time and reason
  -> player cannot bypass the state through ordinary interaction
  -> prepared totem or altar ritual can restore eligibility
  -> return transition is validated and audited
```

Whether the player can chat, observe active players, travel, access containers, use commands, or participate in lore while spectating requires explicit rules. Spectator mode must not become a way to scout hidden structures, reveal locations, assist combat, or bypass protections unless the owner intentionally permits it.

These rules must be implemented as a controlled server state rather than assuming vanilla spectator behavior alone is sufficient.
