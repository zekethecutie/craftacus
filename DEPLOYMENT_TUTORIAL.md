# Craftacus deployment tutorial for beginners

This guide assumes that you are using **Windows PowerShell on your computer** to control a friend’s **Ubuntu or Debian Linux computer** through SSH. The friend’s computer must remain powered on and connected to the internet for Craftacus to stay online.

> Important: the Discord token and Neon database credential that were pasted into chat must be revoked or rotated before deployment. Never paste replacement secrets into Discord, GitHub, PowerShell commands, a service file, or an issue. Enter them only into the remote computer’s ignored `.env` file.

## What the words mean

| Term | Meaning |
|---|---|
| Your computer | The Windows computer where you open PowerShell and type SSH commands. |
| Friend’s computer | The Linux computer that will run Craftacus continuously. |
| SSH | A secure command-line connection from your computer to the friend’s computer. |
| Repository | The Craftacus code downloaded from GitHub. |
| `.env` | A private file containing the replacement Discord and Neon credentials. It must never be committed. |
| systemd | Linux’s built-in service manager. It starts Craftacus at boot and restarts it after crashes. |

## Part 1 — Prepare the Discord application

Open the [Discord Developer Portal](https://discord.com/developers/applications) in your browser. Open the Craftacus application. In **Bot**, revoke the exposed token and generate a replacement token. Copy the replacement temporarily into a password manager or another secure place. Do not send it through chat.

Copy the application’s **Application ID** from **General Information**. This becomes `DISCORD_CLIENT_ID` later. The Craftein guild ID is already known: `1545081571231400097`.

In **Bot**, enable **Server Members Intent** only if you want automatic member-join greetings. If you leave it disabled, set `ENABLE_MEMBER_EVENTS=false`; all manual onboarding and slash commands still work.

Create or confirm the bot invite with only the permissions Craftacus needs: View Channels, Send Messages, Embed Links, Read Message History, Use Application Commands, Manage Roles, Manage Messages, Moderate Members, and Manage Guild. Do not grant Administrator. After it joins, move the Craftacus bot role above `Verified Explorer` and all optional interest roles, but below human staff roles.

## Part 2 — Prepare the Neon database

In Neon, rotate the database password or create a new restricted connection credential because the previous connection string was exposed. Copy the new connection string somewhere secure. You will enter it directly on the friend’s computer in Part 6.

Craftacus creates these tables automatically on first startup:

- `craftein_profiles` stores one minimal profile per Discord user per guild.
- `craftein_whitelist_applications` stores the Discord-native application, decision, reviewer, and timestamps.

Craftacus does not request Microsoft credentials, Discord passwords, exact age, or unnecessary personal information. The application records only a self-reported 16+ confirmation and Bedrock confirmation.

## Part 3 — Find the friend’s SSH details

You need the friend’s Linux username, local IP address or hostname, and SSH port. Ask the friend to open a terminal and run:

```bash
whoami
hostname -I
```

The first command prints the Linux username. The second prints local network addresses. If you are not on the same network, the friend needs a reachable hostname, VPN address, or port-forwarded SSH endpoint. Do not expose SSH directly to the internet without proper firewall and key-based authentication.

For the examples below, pretend the results are:

```text
Linux username: alex
SSH address: 192.168.1.50
SSH port: 22
```

Replace `alex` and `192.168.1.50` with the real values every time they appear. Do not type the angle brackets.

## Part 4 — Open PowerShell and connect

On your Windows computer, open **PowerShell**. You can do this by pressing the Windows key, typing `PowerShell`, and opening **Windows PowerShell** or **PowerShell**.

Test the SSH connection:

```powershell
ssh alex@192.168.1.50
```

The first connection may ask whether you trust the host. Type `yes` and press Enter. Then enter the friend’s Linux password when prompted. The password will not appear while you type. You are now operating inside the friend’s computer.

If SSH uses a nonstandard port, use:

```powershell
ssh -p 2222 alex@192.168.1.50
```

You can tell that you are connected because the prompt changes to something similar to `alex@computer:~$`. From this point onward, commands in this guide marked **REMOTE** are typed inside the SSH session.

## Part 5 — Check the remote computer

**REMOTE:** run:

```bash
cat /etc/os-release | head
node --version 2>/dev/null || true
npm --version 2>/dev/null || true
systemctl --version | head -1
```

You need Ubuntu or Debian, Node.js 20 or newer, npm, and systemd. If `node --version` prints `v20`, `v21`, or `v22`, continue to Part 6. If it says command not found or prints an older version, install Node.js.

### Install Node.js when it is missing or too old

**REMOTE:** first try the operating system packages:

```bash
sudo apt update
sudo apt install -y nodejs npm git curl
node --version
npm --version
```

Craftacus requires Node.js 20 or newer. If the version is still below 20, install Node Version Manager and Node.js 22 for the Linux user:

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 22
nvm alias default 22
node --version
npm --version
```

If the installer warns that the shell was not updated, close the SSH session and reconnect:

```bash
exit
```

Then, on **YOUR WINDOWS COMPUTER**, reconnect:

```powershell
ssh alex@192.168.1.50
```

Back on **REMOTE**, run:

```bash
source ~/.nvm/nvm.sh
node --version
npm --version
```

Do not continue until Node prints version 20 or newer.

## Part 6 — Download Craftacus and create the private environment file

**REMOTE:** create the service folder and clone the repository:

```bash
mkdir -p ~/services
cd ~/services
git clone https://github.com/zekethecutie/craftacus.git
cd ~/services/craftacus
npm ci --omit=dev
```

If the folder already exists because you deployed earlier, use this instead of cloning:

```bash
cd ~/services/craftacus
git pull --ff-only
npm ci --omit=dev
```

Create the private `.env` file using the terminal editor:

```bash
nano .env
```

A blank editor screen will open. Paste the following template into it, then replace the values marked `PASTE_...`:

```env
DISCORD_TOKEN=PASTE_THE_NEW_DISCORD_BOT_TOKEN_HERE
DISCORD_CLIENT_ID=PASTE_THE_DISCORD_APPLICATION_ID_HERE
DISCORD_GUILD_ID=1545081571231400097

DATABASE_URL=PASTE_THE_NEW_ROTATED_NEON_CONNECTION_STRING_HERE
REQUIRE_DATABASE=true

CRAFTACUS_DATA_DIR=./data
ENABLE_MEMBER_EVENTS=false

BEDROCK_HOST=craftein.atbp.fun
BEDROCK_PORT=19132
MOD_LOG_CHANNEL_ID=
APPLICATION_REVIEW_CHANNEL_ID=
```

To save in `nano`, press **Ctrl+O**, press **Enter**, then press **Ctrl+X** to exit. The replacement token and database string must be entered here, on the friend’s computer, not in chat and not in GitHub.

**REMOTE:** lock down the file and confirm that only variable names—not values—are displayed:

```bash
chmod 600 .env
sed -E 's/=.*//' .env | sort
```

The output should list names such as `DISCORD_TOKEN`, `DATABASE_URL`, and `BEDROCK_HOST`, but no secret values. If values appear, stop and remove them from the terminal output or logs.

## Part 7 — Run a foreground test

**REMOTE:** if Node was installed with nvm, load it first:

```bash
source ~/.nvm/nvm.sh 2>/dev/null || true
cd ~/services/craftacus
npm start
```

A successful start should log in as Craftacus, initialize the Neon tables, register commands, and run the Craftein setup when `DISCORD_GUILD_ID` is set. It should not print the token or the database connection string.

Open Discord and check whether the slash commands appear. Test `/help`, `/season`, `/lore`, `/roles`, and `/status`. Test `/setup` only as a staff member with Manage Guild permission. Confirm that the status response does not show `craftein.atbp.fun` or port `19132`.

Press **Ctrl+C** in the SSH window to stop the foreground test. Do not leave the foreground process running when you install systemd, or two bot processes may start.

## Part 8 — Install the systemd service

The repository contains `deploy/craftacus.service.example`. You must create a service file with the real Linux username and the correct Node path.

**REMOTE:** find the Node path:

```bash
source ~/.nvm/nvm.sh 2>/dev/null || true
command -v node
```

Copy the full path printed by that command. It may look like `/home/alex/.nvm/versions/node/v22.13.0/bin/node`. If `/usr/bin/node` is printed, use `/usr/bin/node`.

**REMOTE:** create the service file directly with `nano`:

```bash
sudo nano /etc/systemd/system/craftacus.service
```

Paste this file, replacing `alex` with the real Linux username and replacing `/home/alex/.nvm/versions/node/v22.13.0/bin/node` with the exact path from `command -v node`:

```ini
[Unit]
Description=Craftacus Discord bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=alex
WorkingDirectory=/home/alex/services/craftacus
ExecStart=/home/alex/.nvm/versions/node/v22.13.0/bin/node /home/alex/services/craftacus/src/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Save with **Ctrl+O**, press **Enter**, then exit with **Ctrl+X**.

**REMOTE:** tell systemd about the new service, start it, and enable automatic startup after reboot:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now craftacus
sudo systemctl status --no-pager craftacus
```

Look for `active (running)`. If it is active, Craftacus is now running in the background.

View recent logs:

```bash
journalctl -u craftacus -n 100 --no-pager
```

Watch live logs while testing Discord:

```bash
journalctl -u craftacus -f
```

Press **Ctrl+C** to stop watching logs. This does not stop Craftacus.

## Part 9 — The normal update process

When new code is pushed to GitHub, run this from **YOUR WINDOWS COMPUTER**:

```powershell
ssh alex@192.168.1.50 "cd ~/services/craftacus && git pull --ff-only && npm ci --omit=dev && sudo systemctl restart craftacus && sudo systemctl status --no-pager craftacus"
```

Then inspect logs:

```powershell
ssh alex@192.168.1.50 "journalctl -u craftacus -n 100 --no-pager"
```

Do not run `npm install` as root, do not replace `.env` during normal code updates, and do not delete the `data` folder unless you intentionally want to remove local server-structure metadata.

## Part 10 — Safe stop, restart, and removal commands

From **YOUR WINDOWS COMPUTER**:

```powershell
ssh alex@192.168.1.50 "sudo systemctl restart craftacus"
ssh alex@192.168.1.50 "sudo systemctl stop craftacus"
ssh alex@192.168.1.50 "sudo systemctl start craftacus"
ssh alex@192.168.1.50 "sudo systemctl status --no-pager craftacus"
```

To remove automatic startup without deleting the code:

```powershell
ssh alex@192.168.1.50 "sudo systemctl disable --now craftacus"
```

## Troubleshooting

| Symptom | What to do |
|---|---|
| `ssh is not recognized` on Windows | Install or enable the Windows OpenSSH Client, then reopen PowerShell. |
| `Connection refused` | SSH is not enabled, the address or port is wrong, or a firewall blocks SSH. Ask the friend to check the SSH server locally. |
| `Permission denied` during SSH | The username or password is wrong. Do not guess repeatedly; confirm the Linux username with `whoami`. |
| `node: command not found` | Run `source ~/.nvm/nvm.sh`, or install Node.js from Part 5. |
| Node version is below 20 | Run `nvm install 22` and `nvm alias default 22`, then reconnect. |
| `DISCORD_TOKEN is required` | The `.env` file is missing or is not in `~/services/craftacus`. Run `cd ~/services/craftacus; ls -la .env`. |
| Invalid or unauthorized Discord token | Revoke the old token and generate a replacement. Never reuse the exposed token. |
| Commands do not appear | Confirm `DISCORD_CLIENT_ID` and `DISCORD_GUILD_ID`, then restart Craftacus. Guild commands should be used during development. |
| `Missing Access` or role errors | Invite the bot with the required least-privilege permissions and move its bot role above `Verified Explorer` and optional interest roles. |
| Neon connection failure | Confirm that the rotated `DATABASE_URL` is correct, includes SSL, and is inside the remote `.env`. Check `journalctl -u craftacus -n 100 --no-pager`. |
| `active (exited)` or repeated restarts | Run `journalctl -u craftacus -n 100 --no-pager`. Common causes are a wrong Node path, missing `.env`, invalid token, or database failure. |
| `/status` says offline | Craftacus could not reach the Bedrock endpoint. Confirm the Bedrock server is running and that UDP port 19132 is reachable. The bot intentionally does not reveal the target address publicly. |
| The friend’s computer sleeps | Disable sleep while plugged in, or accept that the bot will be offline during sleep. |

## Security checklist before calling deployment complete

Confirm that the old Discord token is revoked, the old Neon credential is rotated, `.env` has mode `600`, `.env` is not tracked by Git, the bot does not have Administrator, the bot role is below human staff and above assignable roles, systemd reports `active (running)`, the logs contain no secret values, and `/status` does not disclose the server address.
