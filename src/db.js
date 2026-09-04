import postgres from 'postgres';

export function createDatabase(config) {
  if (!config.databaseUrl) {
    if (config.requireDatabase) throw new Error('DATABASE_URL is required when REQUIRE_DATABASE=true. Set it only in the host .env.');
    return null;
  }
  const sql = postgres(config.databaseUrl, { max: 5, idle_timeout: 20, connect_timeout: 10, prepare: false });
  return {
    async init() {
      await sql`CREATE TABLE IF NOT EXISTS craftein_profiles (
        guild_id text NOT NULL,
        discord_user_id text NOT NULL,
        gamertag text,
        region text,
        voice_preference text,
        rules_accepted_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (guild_id, discord_user_id)
      )`;
      await sql`CREATE TABLE IF NOT EXISTS craftein_whitelist_applications (
        id bigserial PRIMARY KEY,
        guild_id text NOT NULL,
        discord_user_id text NOT NULL,
        gamertag text NOT NULL,
        region text,
        age_eligible boolean NOT NULL,
        bedrock_confirmed boolean NOT NULL,
        reason text NOT NULL,
        status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
        reviewed_by text,
        review_note text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS whitelist_applications_guild_status_idx ON craftein_whitelist_applications (guild_id, status, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS whitelist_applications_user_idx ON craftein_whitelist_applications (guild_id, discord_user_id, created_at DESC)`;
    },
    async upsertProfile({ guildId, userId, gamertag, region, voicePreference, rulesAcceptedAt }) {
      const [row] = await sql`INSERT INTO craftein_profiles (guild_id, discord_user_id, gamertag, region, voice_preference, rules_accepted_at)
        VALUES (${guildId}, ${userId}, ${gamertag}, ${region}, ${voicePreference}, ${rulesAcceptedAt || null})
        ON CONFLICT (guild_id, discord_user_id) DO UPDATE SET gamertag = EXCLUDED.gamertag, region = EXCLUDED.region, voice_preference = EXCLUDED.voice_preference, rules_accepted_at = COALESCE(EXCLUDED.rules_accepted_at, craftein_profiles.rules_accepted_at), updated_at = now()
        RETURNING *`;
      return row;
    },
    async markRulesAccepted(guildId, userId, acceptedAt) {
      await sql`INSERT INTO craftein_profiles (guild_id, discord_user_id, rules_accepted_at) VALUES (${guildId}, ${userId}, ${acceptedAt})
        ON CONFLICT (guild_id, discord_user_id) DO UPDATE SET rules_accepted_at = EXCLUDED.rules_accepted_at, updated_at = now()`;
    },
    async getProfile(guildId, userId) { const [row] = await sql`SELECT * FROM craftein_profiles WHERE guild_id = ${guildId} AND discord_user_id = ${userId}`; return row || null; },
    async createApplication({ guildId, userId, gamertag, region, ageEligible, bedrockConfirmed, reason }) {
      const [row] = await sql`INSERT INTO craftein_whitelist_applications (guild_id, discord_user_id, gamertag, region, age_eligible, bedrock_confirmed, reason) VALUES (${guildId}, ${userId}, ${gamertag}, ${region}, ${ageEligible}, ${bedrockConfirmed}, ${reason}) RETURNING *`;
      return row;
    },
    async getApplication(id, guildId) { const [row] = await sql`SELECT * FROM craftein_whitelist_applications WHERE id = ${id} AND guild_id = ${guildId}`; return row || null; },
    async listApplications(guildId, status = 'pending', limit = 20) { return sql`SELECT id, discord_user_id, gamertag, region, age_eligible, bedrock_confirmed, reason, status, reviewed_by, review_note, created_at, updated_at FROM craftein_whitelist_applications WHERE guild_id = ${guildId} AND status = ${status} ORDER BY created_at ASC LIMIT ${limit}`; },
    async reviewApplication({ id, guildId, status, reviewerId, note }) { const [row] = await sql`UPDATE craftein_whitelist_applications SET status = ${status}, reviewed_by = ${reviewerId}, review_note = ${note || null}, updated_at = now() WHERE id = ${id} AND guild_id = ${guildId} RETURNING *`; return row || null; },
    async close() { await sql.end({ timeout: 5 }); }
  };
}
