-- Craftein minimal persistence schema.
-- Craftacus also runs these statements automatically at startup.
-- Never put DATABASE_URL or any credential in this file.

CREATE TABLE IF NOT EXISTS craftein_profiles (
  guild_id text NOT NULL,
  discord_user_id text NOT NULL,
  gamertag text,
  region text,
  voice_preference text,
  rules_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (guild_id, discord_user_id)
);

CREATE TABLE IF NOT EXISTS craftein_whitelist_applications (
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
);

CREATE INDEX IF NOT EXISTS whitelist_applications_guild_status_idx
  ON craftein_whitelist_applications (guild_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS whitelist_applications_user_idx
  ON craftein_whitelist_applications (guild_id, discord_user_id, created_at DESC);
