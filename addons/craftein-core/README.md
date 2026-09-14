# CRAFTEIN Core Bedrock Add-on

This is the isolated CRAFTEIN world-mechanics and combat prototype. It focuses on server-authoritative lives, blessing state, resurrection transactions, and a first deliberate weapon combo rather than a collection of instant button-triggered effects.

## Current prototype

The prototype weapon is `craftein:astral_blade`. Its sequence requires connected uses inside a timing window. The first three uses perform distinct forms, each with a recovery lock, bounded damage, particles, and sound feedback. The third form completes the sequence; releasing the charged use after that connected sequence triggers the Crown of Returning finisher with a longer cooldown. The combo state is stored per player and is not determined by client visuals.

The prototype also includes a test-only altar transaction path. `!craftein reserve` creates and commits a reservation transaction. `!craftein resurrect <player>` performs an online-player prototype resurrection using donor-life protection rules and the generated resurrection ring effect. These commands are temporary engineering hooks, not the final altar GUI or production permissions.

The resource pack now uses the supplied CRAFTEIN logo as the pack icon and the title/loading image override at `textures/gui/title/minecraft.png`. It also provides the CRAFTEIN hardcore-style life-heart textures under `textures/ui/heart.png`, `heart_half.png`, and `heart_hardcore.png`. The three-life action-bar indicator remains separate from normal health so life count and health cannot be confused.

## Test commands

The currently enabled operator test commands are:

| Command | Purpose |
|---|---|
| `!craftein lives` | Show life and soul state. |
| `!craftein blessing` | Show blessing and life state. |
| `!craftein reset` | Reset the operator test state. |
| `!craftein setlives <count>` | Set a test life count from zero to the configured maximum. |
| `!craftein giveblade` | Give the prototype Astral Blade. |
| `!craftein reserve` | Commit a prototype reservation transaction. |
| `!craftein resurrect <player>` | Run the prototype donor-life resurrection path. |
| `!craftein settings` | Open the native Minecraft CRAFTEIN operator settings menu. |
| `!craftein menu` | Alias for the settings menu. |

Every test command and the native settings menu now require the Bedrock player operator permission. Soul-lost players cannot chat or use these commands. The settings menu persists world-level controls for effect quality, combo timing window, debug messages, and whether test commands are enabled.

## Assets and conversion

The resource pack contains an original CRAFTEIN Astral Blade icon and an original 16-frame ritual sprite sheet. A reusable converter at `../../tools/java_model_to_bedrock.py` converts simple Blockbench Java item models into a draft Bedrock geometry file. The supplied authorized Java Excalibur model was converted into `resource_pack/models/entity/astral_blade.json` as a draft and still requires visual verification in Blockbench.

The Java reference archive is primarily made of item models and textures. It does not contain an Ender Dragon model or entity definition, so dragon conversion cannot begin from that archive. A supplied Java dragon model, OptiFine/CEM asset, or Blockbench file can be assessed separately when provided. Java animated textures use vertical sprite sheets and `.mcmeta` files; Bedrock particles need their own flipbook UV configuration, which is why the prototype includes an original Bedrock-compatible sheet rather than using Java metadata directly.

## Installation and validation

Import the generated `dist/craftein-core.mcaddon` into a test Bedrock world with the Script API dependency available. Run `validate.sh` from this directory to syntax-check JavaScript, validate manifests, and rebuild the `.mcaddon` artifact. The exact server Bedrock version is still required before production deployment; the pack currently declares a provisional `@minecraft/server` 2.0.0 dependency and minimum engine version 1.21.80.

The final altar block, GUI, camera-follow spectator, Plunder transfer, boss attribution, and production weapon roster remain separate implementation phases. Visual effects must remain bounded and cleanup-safe because the reference packs demonstrate how persistent trails and large effect libraries can affect first-person readability and multiplayer performance.
