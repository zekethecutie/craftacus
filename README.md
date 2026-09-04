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
