import 'dotenv/config';
import path from 'node:path';

const truthy = new Set(['1', 'true', 'yes', 'on']);

export function loadConfig(env = process.env) {
  const token = (env.DISCORD_TOKEN ?? '').trim();
  const clientId = (env.DISCORD_CLIENT_ID ?? '').trim();
  if (!token) throw new Error('DISCORD_TOKEN is required. Set it only in an ignored .env file on the host.');
  if (token.includes('replace-with') || token.length < 40) throw new Error('DISCORD_TOKEN does not look like a real replacement token. Rotate exposed tokens before starting.');
  if (!clientId) throw new Error('DISCORD_CLIENT_ID is required.');
  const dataDir = path.resolve(env.CRAFTACUS_DATA_DIR || './data');
  const databaseUrl = (env.DATABASE_URL ?? '').trim() || null;
  const requireDatabase = truthy.has(String(env.REQUIRE_DATABASE ?? '').toLowerCase());
  const bedrockPort = Number(env.BEDROCK_PORT || 19132);
  if (!Number.isInteger(bedrockPort) || bedrockPort < 1 || bedrockPort > 65535) throw new Error('BEDROCK_PORT must be a valid TCP/UDP port.');
  return {
    token,
    clientId,
    guildId: (env.DISCORD_GUILD_ID ?? '').trim() || null,
    dataDir,
    bedrockHost: (env.BEDROCK_HOST ?? '').trim() || null,
    bedrockPort,
    enableMemberEvents: truthy.has(String(env.ENABLE_MEMBER_EVENTS ?? '').toLowerCase()),
    modLogChannelId: (env.MOD_LOG_CHANNEL_ID ?? '').trim() || null,
    applicationReviewChannelId: (env.APPLICATION_REVIEW_CHANNEL_ID ?? '').trim() || null,
    databaseUrl,
    requireDatabase
  };
}
