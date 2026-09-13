# CRAFTEIN Core Bedrock Add-on

This is the isolated first implementation of the CRAFTEIN world-mechanics layer. It currently focuses on player blessing state, configurable lives, death processing, and a foundation for resurrection transactions.

## Scope

The core is intentionally separate from the Craftacus Discord bot. It does not connect to the website or Discord, does not include weapon assets, and does not modify third-party packs.

Current implementation:

- `craftein:` namespace only.
- Server-authoritative player life state stored in dynamic properties.
- Configurable starting and maximum lives.
- Idempotent death-window guard.
- Zero-life transition to a restricted spectator state when enabled.
- Basic admin test commands through chat commands.
- Versioned configuration and future ritual hooks.

Not yet implemented:

- Final custom `hud_screen` integration.
- Camera-follow spectate, which is Bedrock-version-sensitive.
- Resurrection altar block and GUI.
- Prepared resurrection reservation.
- Plunder potion and PvP life transfer.
- Weapons, bosses, structures, and custom dimensions.

## Installation

Import the behavior and resource packs into a test world. Enable the Script API required by the target Bedrock version. Apply both packs to the world, with the behavior pack depending on the resource pack if the target version requires that arrangement.

The exact target Bedrock version is still provisional. Before production deployment, update both manifests and the Script API dependency to the server's exact supported versions, then test alongside every existing CRAFTEIN pack.

## Test commands

Commands are chat-based while this prototype is being validated:

- `!craftein lives` — show your current state.
- `!craftein reset` — operator-only reset to configured starting lives.
- `!craftein setlives <count>` — operator-only test value.
- `!craftein blessing` — show the current blessing state.

These commands are intentionally temporary and should be disabled or permission-hardened before production.

## Design references

The shared planning baseline is in `../../docs/craftein-bedrock-planning-amendment.md`. The core must remain additive, vanilla-feeling, UUID/state based, restart-safe, and independent of third-party pack internals.
