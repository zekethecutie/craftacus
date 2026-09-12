# Temporary hosted runtime

Craftacus can be started in the current managed environment for testing while the session is active. It reads `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DATABASE_URL`, and the optional Bedrock/status variables from the configured Secrets page. The bot’s `DATABASE_URL` must be the Neon PostgreSQL connection; it must not be reused as the Craftein website’s MySQL/TiDB `DATABASE_URL`.

For a temporary run, use:

```bash
npm ci
mkdir -p data
REQUIRE_DATABASE=true ENABLE_MEMBER_EVENTS=true CRAFTACUS_DATA_DIR=$PWD/data npm start
```

The process must remain running to receive Discord gateway events. A sandbox or autoscaling web process is suitable for testing, not a guaranteed 24/7 production host. For persistent operation, use the supplied systemd tutorial on a Linux host or an always-on managed process.

Secrets must remain in the host’s environment or Secrets page. Never commit `.env`, `data/*.json`, logs, database URLs, or Discord tokens.
