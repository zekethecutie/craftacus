# Craftacus

Craftacus is the Discord bot for **Craftein Universe**, a Minecraft Bedrock survival adventure where players explore, build civilizations, establish laws, form alliances, trade, attend events, and create the history future players discover.

The bot is intentionally small and low-noise. It provides idempotent server setup, rules-gated onboarding, optional interest roles, minimal self-reported Bedrock profiles, documentation links, optional Bedrock Dedicated Server status, and permission-checked moderation utilities. It does not provide an economy, leveling, gambling, invasive surveillance, automatic bans, unsolicited DMs, or identity verification it cannot actually perform.

## Security first

Any Discord token or database credential pasted into chat, an issue, a log, or a repository must be revoked and replaced. Craftacus does not use credentials from source control. Put the replacement Discord token only in an ignored `.env` file on the machine that runs the bot. The current default implementation uses a small local JSON state file and does not require a database; a database can be added later without placing its connection string in code.

## Local validation

```bash
cp .env.example .env
# Edit .env locally; never commit it.
npm ci
npm run check
npm test
npm start
```

`DISCORD_GUILD_ID` is recommended during development because commands register immediately to one guild. Omit it only when intentionally registering global commands, which can take time to propagate. Set `ENABLE_MEMBER_EVENTS=true` only after enabling **Server Members Intent** in the Discord Developer Portal.

## Neon persistence

Craftacus can use Neon Postgres for minimal per-guild profiles and whitelist application records. On startup it creates `craftein_profiles` and `craftein_whitelist_applications` if they do not exist, using parameterized queries and no raw SQL built from member input. Profiles store only Discord user ID, guild ID, optional gamertag, region, voice preference, and timestamps. Applications store the self-reported gamertag, region, 16+ confirmation, Bedrock confirmation, reason, status, reviewer ID, review note, and timestamps. Exact age, Microsoft credentials, passwords, and unnecessary personal data are not collected.

Set `DATABASE_URL` to the replacement Neon connection string and keep `REQUIRE_DATABASE=true` in production. With the database enabled, members can use `/whitelist-apply`; staff can use `/applications` and `/application-review`. Approval is a staff decision record and does not bypass the Discord rules gate. The existing Google Form remains available as the public application path; this command is the Discord-native review path.

## Roles, lore, and status UX

After accepting the rules, members receive **Verified Explorer** access and can use `/roles` to open a private optional picker for Creator, Builder, Lorekeeper, Eventmaker, Developer, Asia-Pacific coordination, Voice Optional, and Event Ping. These roles can be changed without removing staff, recognition, or access roles. No extra public role channel is required.

`#lore-and-discoveries` receives one canonical Craftein lore archive panel. Its menu opens entries such as the lore overview, The First Binding, The Quieting, the Founding Season, and the lore participation guide as ephemeral responses visible only to the member who selected them. Lore remains optional and does not override player freedom.

Status checks default to `craftein.atbp.fun` on Bedrock port `19132`, or use `BEDROCK_HOST` and `BEDROCK_PORT` when explicitly configured. Public replies expose only Online, Offline/not reachable, player count, version, and observed uptime. They never expose the hostname, port, connection string, or other server address details. Uptime means time observed continuously online by Craftacus since the last offline result or process reset; it is not a claim about historical host uptime.

## Exact SSH deployment

From your own computer, replace `FRIEND_HOST`, `FRIEND_USER`, and the local path to your new environment file:

```bash
ssh FRIEND_USER@FRIEND_HOST 'mkdir -p ~/services && if [ -d ~/services/craftacus/.git ]; then cd ~/services/craftacus && git pull --ff-only; else git clone https://github.com/zekethecutie/craftacus.git ~/services/craftacus; fi && cd ~/services/craftacus && npm ci --omit=dev'
scp ./production.env FRIEND_USER@FRIEND_HOST:/tmp/craftacus.env
ssh FRIEND_USER@FRIEND_HOST 'install -m 600 /tmp/craftacus.env ~/services/craftacus/.env && rm -f /tmp/craftacus.env && sed -n "s/=.*//p" ~/services/craftacus/.env | sort'
ssh FRIEND_USER@FRIEND_HOST 'cd ~/services/craftacus && npm start'
```

The `production.env` file must be created locally and must never be committed. It should contain the replacement Discord token, application client ID, Craftein guild ID, the replacement Neon `DATABASE_URL`, `REQUIRE_DATABASE=true`, and any optional Bedrock settings. The final SSH command is a foreground smoke test; stop it with `Ctrl+C` after the login and database initialization succeed.

For systemd, edit the service template’s two `REPLACE_WITH...` values, then run:

```bash
scp deploy/craftacus.service.example FRIEND_USER@FRIEND_HOST:/tmp/craftacus.service
ssh FRIEND_USER@FRIEND_HOST 'sudo install -o root -g root -m 644 /tmp/craftacus.service /etc/systemd/system/craftacus.service && rm -f /tmp/craftacus.service && sudo systemctl daemon-reload && sudo systemctl enable --now craftacus && sudo systemctl status --no-pager craftacus'
ssh FRIEND_USER@FRIEND_HOST 'journalctl -u craftacus -n 100 --no-pager'
```

If Node.js is installed through a version manager rather than `/usr/bin/node`, replace `ExecStart` with the absolute path returned by `command -v node` on the friend’s computer. The service account must own the checkout and `.env`; keep `.env` at mode `600`.

## Least-privilege Discord permissions

Craftacus needs View Channels, Send Messages, Embed Links, Read Message History, Use Application Commands, Manage Roles for the Verified Explorer and optional interest roles, Manage Messages only for `/purge`, Moderate Members only for `/timeout`, and Manage Guild only for `/setup` and `/announce`. The bot does not need Administrator. Its managed role must be placed above every role it assigns, while remaining below the human staff roles.

## Free hosting on a friend’s computer

The simplest completely free persistent host is a Linux computer that stays powered on, connected to the internet, and allowed to run a background Node.js process. SSH access is sufficient; you do not need a graphical desktop. The tradeoff is uptime: if the computer sleeps, loses internet, reboots without auto-start, or the owner changes the network, the bot goes offline. This is suitable for a small community when the owner agrees and the machine is trusted.

On the remote computer, install Node.js 20 or newer, then run:

```bash
mkdir -p ~/services
cd ~/services
git clone https://github.com/zekethecutie/craftacus.git
cd craftacus
npm ci --omit=dev
cp .env.example .env
chmod 600 .env
nano .env
```

Place the replacement token, client ID, guild ID, and any Bedrock host settings in `.env`. Then test once with `npm start`. Stop it with `Ctrl+C` after confirming it logs in successfully.

For automatic restart on Linux, copy `deploy/craftacus.service.example` to `/etc/systemd/system/craftacus.service`, change the `User` and `WorkingDirectory` values to the remote account and checkout path, then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now craftacus
sudo systemctl status craftacus
journalctl -u craftacus -f
```

Do not put the token in the service file or in shell history. Keep `.env` owned by the service account with mode `600`. If the computer is Windows, use WSL2 or a scheduled task; Linux plus systemd is the cleaner SSH-only route.

## Setup behavior

On startup with `DISCORD_GUILD_ID`, Craftacus registers guild commands and checks the Craftein layout. `/setup` is also available to staff. Setup creates only missing categories, channels, roles, permission overwrites, and canonical panel messages. It does not delete existing channels, delete user messages, or blindly recreate duplicate panels. Existing default Discord channels are left alone.

The main onboarding path is: read the rules, accept them, receive Verified Explorer, then optionally choose interest roles and complete `/verify`. A profile is a voluntary self-report and is not proof of Microsoft or Xbox ownership. Text chat remains valid and voice is optional.


## Beginner deployment walkthrough

For a fully guided Windows PowerShell-to-SSH process, including what to type on each computer, how to create `.env`, how to use `nano`, how to install systemd, how to view logs, and how to update or troubleshoot the bot, read [`DEPLOYMENT_TUTORIAL.md`](./DEPLOYMENT_TUTORIAL.md).


## Server blueprint and visual assets

The practical Discord layout, role hierarchy, permission matrix, onboarding questions, panel captions, and banner plan are documented in [`docs/craftein-server-blueprint.md`](./docs/craftein-server-blueprint.md). Reference-matched wide banner assets are stored under `assets/` for the welcome, rules, roles, lore, apply, and status panels.
