# Craftein Universe server blueprint

This blueprint keeps Craftein atmospheric without turning the Discord into a crowded directory. The server should feel like a calm frontier settlement: a clear arrival path, a small community square, a world archive, optional creative paths, and a staff backroom.

## Recommended category and channel structure

| Category | Channels | Purpose |
|---|---|---|
| **START HERE** | `#welcome`, `#rules-and-safety`, `#how-craftein-works`, `#apply-to-craftein`, `#announcements` | New-member orientation and official information. Members should not need to search elsewhere to understand the server. |
| **COMMUNITY** | `#general`, `#introductions`, `#bedrock-lfg`, `#screenshots-and-builds`, `#suggestions` | Everyday conversation, finding players, sharing builds, and low-pressure feedback. |
| **THE WORLD** | `#lore-and-discoveries`, `#civilizations-and-laws`, `#events`, `#archives` | Optional lore and civilization documentation. The lore menu keeps the archive interactive and private when opened. |
| **CREATIVE AND CONTRIBUTION** | `#creator-collab`, `#building-studio`, `#lore-studio`, `#development-lab` | Voluntary collaboration. These channels are not requirements for ordinary players. |
| **PARTNERSHIPS AND PROMOTION** | `#partnership-info`, `#partnership-applications`, `#approved-partners` | Staff-reviewed partner and promotion workflows. No raw invite dumping. |
| **VOICE** | `Community Voice`, `Craftein Voice 1`, `Craftein Voice 2` | Optional voice participation. Text-first participation remains fully valid. |
| **STAFF** | `#staff-room`, `#mod-log`, `#applications-review`, `#staff-guidelines` | Private staff operations. Never expose applicant notes or moderation records publicly. |

Craftacus creates or repairs this structure idempotently. It does not delete existing channels or messages. If the server already has an established channel, keep it and adjust the setup mapping rather than creating a duplicate.

## Role model

The role hierarchy should be ordered from highest to lowest approximately as follows: human owner, human administrators, human moderators, Craftein Team, Community Guide, Founding Member, Verified Explorer, optional interest roles, and the default member role. Craftacus must remain below human staff roles and above the roles it assigns.

| Role | Type | Meaning | Self-selectable |
|---|---|---|---|
| `Craftein Team` | Staff | Trusted project operators | No |
| `Community Guide` | Staff/recognition | Welcoming and community support | No |
| `Founding Member` | Recognition | Early community recognition | No |
| `Verified Explorer` | Access | Member accepted the rules and can enter the community areas | No |
| `Creator` | Interest | Interested in creator collaboration | Yes |
| `Builder` | Interest | Interested in building | Yes |
| `Lorekeeper` | Interest | Interested in optional lore and worldbuilding | Yes |
| `Eventmaker` | Interest | Interested in helping with events | Yes |
| `Developer` | Interest | Interested in technical contribution | Yes |
| `Asia-Pacific` | Interest | Opt-in APAC coordination | Yes |
| `Voice Optional` | Interest | Opt-in voice-related notices | Yes |
| `Event Ping` | Interest | Opt-in event notices | Yes |

## Permission rules

The default role should see only the arrival materials until the member accepts the rules. `Verified Explorer` should see the community, world, creative, partnerships, and voice categories. Staff categories should deny `@everyone` and allow only staff roles. The `applications-review` channel should also deny ordinary members even if they can see other staff channels.

Craftacus needs View Channels, Send Messages, Embed Links, Read Message History, and Use Application Commands. It needs Manage Roles only to assign the Verified Explorer and optional interest roles, Manage Messages only for `/purge`, Moderate Members only for `/timeout`, and Manage Guild only for `/setup` and `/announce`. Never grant Administrator.

## Arrival and onboarding flow

A new member sees a quiet welcome path rather than a wall of channels. The `#welcome` panel explains that Craftein is a Minecraft Bedrock survival adventure and that lore, voice, creation, and volunteering are optional. The `#rules-and-safety` panel presents the safety rules and a clear acceptance button. After acceptance, Craftacus assigns Verified Explorer and privately offers the interest-role menu.

The server should also enable Discord Community onboarding manually when the owner is ready. Recommended onboarding questions are:

| Question | Options | Effect |
|---|---|---|
| What brings you to Craftein? | Playing survival, Building, Lore, Events, Creator collaboration, Just looking around | Suggests optional interest roles; it should not gate basic belonging. |
| Which spaces would you like to see? | Community, World and lore, Creative paths, Voice | Helps reduce visual noise for new members. |
| What is your preferred participation style? | Text-first, Optional voice, Both, Prefer not to say | Never removes access or pressures voice participation. |

The rules agreement remains the actual access gate. Do not use onboarding questions to collect personal data or to force a roleplay identity.

## Official panel captions

Use these as the concise message captions below any matching image banner:

| Panel | Caption |
|---|---|
| Welcome | `A living survival adventure. Start here, read the rules, and enter at your own pace.` |
| Rules | `A calm world needs clear boundaries. Read this before entering the community.` |
| Roles | `Choose optional interests. You can change them later, and none are required.` |
| Lore | `The archive is open. Explore the world’s fragments without being forced into its story.` |
| Apply | `Tell us a little about how you would like to play. Review is human, not automatic.` |
| Status | `Craftacus can check whether the Bedrock world is reachable without revealing its address.` |

## Banner asset plan

Use the supplied Craftein header as the reference for the visual language: Minecraft-like blocky 3D world, warm meadow light, deep purple foliage, pink-magenta title treatment, and calm discovery mood. Produce one standalone banner per panel with the exact short title `WELCOME`, `RULES`, `ROLES`, `LORE`, `APPLY`, or `STATUS`. Keep each title large and centered, preserve the reference palette and voxel-like atmosphere, and avoid adding URLs, small text, or fake server information.
