# Copy-paste handoff for the Craftein Bedrock add-on Manus agent

You are building the Minecraft Bedrock add-on for **Craftein Universe**, an existing survival SMP community with a separate website and Craftacus Discord bot. This handoff is the coordination contract. Build from it, preserve its boundaries, and return unresolved design decisions to the owner instead of inventing canon.

## 1. Player-facing premise

Craftein is a shared survival world built on the remains of older worlds. The present era is called the **Founding Season** because new communities are beginning to make a home in a world they did not create and do not fully understand.

Long before modern settlements, the world was shaped by powers now called the **Danans**. It is not yet confirmed whether the Danans were gods, creators, a civilization, a species, or something stranger. They left roads, cities, shrines, machines, maps, symbols, unfinished works, and other evidence that the world was measured and connected before current people understood it.

The old world did not end in one clearly documented disaster. Civilizations disappeared, retreated, changed names, or became misunderstood stories. Communication failed between distant regions. Records began to contradict one another. Places that once shared a history became isolated, and travel between them became dangerous. This period is remembered as the **Quieting**. Its actual cause is not confirmed; it may have been a disaster, a choice, or the consequence of something beyond the visible world.

Ruins are evidence rather than exposition. A broken road may reveal an old route. A sealed room may preserve a decision someone wanted forgotten. A repeated symbol may be a prayer, a warning, or proof that supposedly separate cultures were connected. Players should assemble history from locations, structures, books, maps, NPCs, sounds, environmental details, and conflicting accounts.

## 2. Lives, death, and the blessing

The Danans are connected to an ancient blessing said to give living beings more than one chance to return from death. In the story, death matters but is not always the end. A life can be spent, a soul can be wounded, and a person can become lost without becoming forgotten.

The exact mechanics are **not final canon**. The current idea of three starting lives and an approximately three-day soul-loss period is only a proposal. Do not hard-code it as final without owner approval. The nature of the Danans, the reason lives were granted, the nature of the void, and what resurrection truly means are intentionally unresolved.

If a prototype is required, isolate it behind clearly labelled, versioned configuration. Make it restart-safe, auditable, server-authoritative, and easy to change. Never let the client decide whether a ritual succeeded, whether an offering was consumed, or how many lives a player has.

## 3. Player freedom and community safety

Craftein is **roleplaying-friendly, not roleplay-mandatory**. Players may build, settle, travel, explore, trade, document discoveries, follow lore, or simply play survival. There is no required faction, character, voice participation, content creation, lore contribution, or volunteer role.

The add-on must not pressure players to participate in lore. Ordinary survival play must remain valid. Discovery should reward curiosity and patience rather than require constant spectacle, combat, or scripted performance. Player theories may be wrong and still useful. Multiple interpretations may coexist until the owner confirms canon.

Do not add mechanics that expose private player information, require voice chat, require social media, or make public contribution a condition of belonging.

## 4. Implementation boundaries

Use the unique namespace `craftein:`. Prefer additive content. Do not overwrite vanilla files unless compatibility has been inspected and explicitly approved. Inspect every existing behavior/resource pack, manifest, dependency, namespace, target Bedrock version, experiment requirement, load order, and license before integrating.

Keep gameplay identifiers separate from visual model names. Use stable identifiers for entities, items, blocks, events, scoreboard objectives, properties, and structures. Document every public identifier that Craftacus or future tools may need.

Server-authoritative state is required for lives, souls, rituals, offerings, rewards, unique relics, ownership, progression, and any irreversible transition. Persist critical state so restart or reload cannot duplicate rewards, consume an offering twice, resurrect a player twice, or lose a completed transition.

A possible state model for a future life system is:

`UNINITIALIZED → ALIVE → DYING → SOUL_LOST → AWAITING_RESURRECTION → RESURRECTING → RESTORED`

Use `SUSPENDED` for an administrative or recovery state if needed. Treat that model as a design aid, not approved canon.

## 5. Resurrection design direction

Prefer a fixed altar, shrine, or totem location over a purely portable resurrection item. Any ritual should be interruptible without corrupting state, resistant to duplication, and tracked with a transaction record containing at least:

| Field | Purpose |
|---|---|
| `transaction_id` | Unique idempotency key for the ritual attempt |
| `target_uuid` | Player receiving the ritual |
| `stage` | Current state of the ritual |
| `offering_state` | Not offered, held, consumed, or restored |
| `completion_state` | Pending, completed, cancelled, or failed |
| `started_at` | Audit and timeout handling |
| `updated_at` | Restart and recovery handling |

If a ritual is interrupted, the system must recover deterministically. Do not consume a unique offering before the server has recorded the transaction. Do not grant the result until the completion state is durably recorded.

## 6. Legendary content and future events

Do not implement the one-of-one legendary weapon system yet. Do not invent a weapon name, boss, relic model, damage value, acquisition path, or ownership rule. You may design stable future event identifiers so later work can integrate cleanly:

`boss_encounter_started`

`boss_phase_changed`

`boss_encounter_completed`

`relic_claimed`

`relic_owner_changed`

`player_resurrected`

Those events should be documented and versioned, but they should not create unfinished gameplay until the owner approves the target version, assets, balance, and story.

## 7. Relationship to the website and Craftacus

The website is the public editorial and community hub. It contains the present-day story, lore archive, history, seasons, notices, forum topics, and consent-aware player/creator showcases. The owner can publish, edit, unpublish, and archive content through an owner-only console.

Craftacus is the Discord bot. It handles onboarding, rules acceptance, optional interest roles, private lore menus, voluntary Bedrock profiles, whitelist applications, staff review commands, welcome messages, and a privacy-preserving `/status` response.

The website uses its managed Drizzle/MySQL database. Craftacus uses its own Neon/Postgres database for Discord-native profiles, applications, and guild state. Do not point the Craftacus Postgres driver at the website MySQL URL. They are separate sources of truth until a deliberately designed synchronization bridge exists.

The status contract is intentionally narrow. A safe status result may include:

| Field | Meaning |
|---|---|
| `state` | `online`, `offline`, or `not-configured` |
| `players` | Current online player count when available |
| `maxPlayers` | Advertised capacity when available |
| `version` | Bedrock/server version when available |
| `uptime` | Human-readable observed uptime since the last known online transition |
| `checkedAt` | ISO timestamp of the check |

Never expose the Bedrock host, port, DNS record, connection error, or private infrastructure details in blocks, books, chat, the public website, add-on UI, or public Discord channels.

## 8. First playable experience

The add-on should support a calm, understandable first experience. A new player should be able to survive normally, find signs of earlier civilizations, understand that the world has a history, and choose whether to investigate. Early discoveries should introduce the Founding Season, the Quieting, the existence of older connected civilizations, and the possibility that the world’s history is incomplete.

Do not open with a giant exposition dump, mandatory quest chain, cryptic HUD clutter, unexplained numeric strings, or science-fiction interface language. Prefer readable books, environmental storytelling, natural signs, maps, structures, sounds, and optional discoveries.

## 9. Content and UX style

The Craftein identity is dark, magenta/purple, grounded, atmospheric, and voxel-world oriented. Avoid generic AI-looking sci-fi decoration: no unnecessary slashes, random numbers, fake system labels, aggressive HUD panels, or unexplained glyphs. Copy should be natural, calm, casual, professional, and readable.

## 10. Required response before locking mechanics

Before finalizing the life system or deep canon, return a concise decision list to the owner covering:

1. What exactly are the Danans?
2. Why were lives granted, and who was eligible?
3. What is the void, and what does soul loss mean?
4. Are three lives and the proposed soul-loss duration approved?
5. What happens at zero lives?
6. What does resurrection restore and what does it cost?
7. What are the names, values, technologies, and collapse causes of the ancient civilizations?
8. What are the Nether, End, and any future region rules in this universe?
9. What does the name Craftein mean in-world?
10. Which truths must remain hidden, and which false assumptions or twists are intended?
11. Is the story fixed, player-influenced, or partly improvised?
12. Which Bedrock version, server software, experiments, pack order, and concurrent-player target must be supported?

Do not silently answer these questions in code. Mark provisional mechanics clearly in configuration and documentation, and wait for owner confirmation where the answer changes gameplay or canon.

## 11. Definition of done for this handoff

The add-on is ready for integration when it has a unique namespace, inspected dependencies, documented identifiers, server-authoritative state, restart-safe persistence for any critical mechanic, no invented unresolved canon, optional lore participation, readable first-player guidance, no public server-address leakage, and a short owner decision list for all provisional mechanics.
