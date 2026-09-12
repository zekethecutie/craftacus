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
      await sql`CREATE TABLE IF NOT EXISTS craftein_clan_applications (
        id bigserial PRIMARY KEY,
        guild_id text NOT NULL,
        applicant_id text NOT NULL,
        name text NOT NULL,
        tag text NOT NULL,
        description text NOT NULL,
        status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
        reviewed_by text,
        review_note text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS clan_applications_guild_status_idx ON craftein_clan_applications (guild_id, status, created_at ASC)`;
      await sql`CREATE TABLE IF NOT EXISTS craftein_clans (
        id bigserial PRIMARY KEY,
        guild_id text NOT NULL,
        name text NOT NULL,
        tag text NOT NULL,
        description text NOT NULL,
        discord_role_id text,
        owner_id text NOT NULL,
        status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (guild_id, name),
        UNIQUE (guild_id, tag)
      )`;
      await sql`CREATE TABLE IF NOT EXISTS craftein_clan_members (
        guild_id text NOT NULL,
        clan_id bigint NOT NULL REFERENCES craftein_clans(id) ON DELETE CASCADE,
        discord_user_id text NOT NULL,
        rank text NOT NULL DEFAULT 'member' CHECK (rank IN ('owner', 'officer', 'member')),
        joined_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (guild_id, clan_id, discord_user_id)
      )`;
      await sql`CREATE INDEX IF NOT EXISTS clan_members_user_idx ON craftein_clan_members (guild_id, discord_user_id)`;
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
    async createClanApplication({ guildId, applicantId, name, tag, description }) {
      const [row] = await sql`INSERT INTO craftein_clan_applications (guild_id, applicant_id, name, tag, description) VALUES (${guildId}, ${applicantId}, ${name}, ${tag}, ${description}) RETURNING *`;
      return row;
    },
    async listClanApplications(guildId, status = 'pending', limit = 20) { return sql`SELECT id, applicant_id, name, tag, description, status, reviewed_by, review_note, created_at FROM craftein_clan_applications WHERE guild_id = ${guildId} AND status = ${status} ORDER BY created_at ASC LIMIT ${limit}`; },
    async getClanApplication(id, guildId) { const [row] = await sql`SELECT * FROM craftein_clan_applications WHERE id = ${id} AND guild_id = ${guildId}`; return row || null; },
    async reviewClanApplication({ id, guildId, status, reviewerId, note, roleId }) {
      return sql.begin(async tx => {
        const [application] = await tx`UPDATE craftein_clan_applications SET status = ${status}, reviewed_by = ${reviewerId}, review_note = ${note || null}, updated_at = now() WHERE id = ${id} AND guild_id = ${guildId} AND status = 'pending' RETURNING *`;
        if (!application || status !== 'approved') return { application: application || null, clan: null };
        const [clan] = await tx`INSERT INTO craftein_clans (guild_id, name, tag, description, discord_role_id, owner_id) VALUES (${guildId}, ${application.name}, ${application.tag}, ${application.description}, ${roleId || null}, ${application.applicant_id}) RETURNING *`;
        await tx`INSERT INTO craftein_clan_members (guild_id, clan_id, discord_user_id, rank) VALUES (${guildId}, ${clan.id}, ${application.applicant_id}, 'owner') ON CONFLICT DO NOTHING`;
        return { application, clan };
      });
    },
    async listClans(guildId) { return sql`SELECT id, name, tag, description, discord_role_id, owner_id, created_at FROM craftein_clans WHERE guild_id = ${guildId} AND status = 'active' ORDER BY name ASC`; },
    async getClan(guildId, clanId) { const [row] = await sql`SELECT * FROM craftein_clans WHERE guild_id = ${guildId} AND id = ${clanId} AND status = 'active'`; return row || null; },
    async getClanMembership(guildId, clanId, userId) { const [row] = await sql`SELECT * FROM craftein_clan_members WHERE guild_id = ${guildId} AND clan_id = ${clanId} AND discord_user_id = ${userId}`; return row || null; },
    async addClanMember({ guildId, clanId, userId, rank = 'member' }) { const [row] = await sql`INSERT INTO craftein_clan_members (guild_id, clan_id, discord_user_id, rank) VALUES (${guildId}, ${clanId}, ${userId}, ${rank}) ON CONFLICT (guild_id, clan_id, discord_user_id) DO UPDATE SET rank = EXCLUDED.rank, updated_at = now() RETURNING *`; return row; },
    async removeClanMember(guildId, clanId, userId) { const [row] = await sql`DELETE FROM craftein_clan_members WHERE guild_id = ${guildId} AND clan_id = ${clanId} AND discord_user_id = ${userId} RETURNING *`; return row || null; },
    async setClanMemberRank({ guildId, clanId, userId, rank }) { const [row] = await sql`UPDATE craftein_clan_members SET rank = ${rank}, updated_at = now() WHERE guild_id = ${guildId} AND clan_id = ${clanId} AND discord_user_id = ${userId} RETURNING *`; return row || null; },
    async close() { await sql.end({ timeout: 5 }); }
  };
}
