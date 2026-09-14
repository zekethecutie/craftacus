export const CONFIG = Object.freeze({
  schemaVersion: 3,
  startingLives: 3,
  maximumLives: 3,
  deathDeduplicationTicks: 40,
  zeroLifeMode: "spectator",
  soulLossEnabled: true,
  allowOperatorTestCommands: true,
  properties: Object.freeze({
    lives: "craftein:lives",
    maxLives: "craftein:max_lives",
    blessing: "craftein:blessing",
    state: "craftein:soul_state",
    deathToken: "craftein:last_death_token",
    schema: "craftein:schema_version",
    deaths: "craftein:death_count",
    comboStep: "craftein:combo_step",
    comboLastTick: "craftein:combo_last_tick",
    comboLockUntil: "craftein:combo_lock_until"
  }),
  worldProperties: Object.freeze({
    ritualSchema: "craftein:ritual_schema",
    ritualTransactions: "craftein:ritual_transactions",
    settings: "craftein:settings"
  })
});

export const STATES = Object.freeze({
  ALIVE: "alive",
  SOUL_LOST: "soul_lost",
  AWAITING_RESURRECTION: "awaiting_resurrection",
  RESURRECTING: "resurrecting",
  RESTORED: "restored"
});

export const PROPERTY_DEFINITIONS = Object.freeze([
  { id: CONFIG.properties.lives, type: "int" },
  { id: CONFIG.properties.maxLives, type: "int" },
  { id: CONFIG.properties.blessing, type: "string" },
  { id: CONFIG.properties.state, type: "string" },
  { id: CONFIG.properties.deathToken, type: "string" },
  { id: CONFIG.properties.schema, type: "int" },
  { id: CONFIG.properties.deaths, type: "int" },
  { id: CONFIG.properties.comboStep, type: "int" },
  { id: CONFIG.properties.comboLastTick, type: "int" },
  { id: CONFIG.properties.comboLockUntil, type: "int" }
]);

export const PROTOTYPE_WEAPON = "craftein:astral_blade";

export const WORLD_PROPERTY_DEFINITIONS = Object.freeze([
  { id: CONFIG.worldProperties.ritualSchema, type: "int" },
  { id: CONFIG.worldProperties.ritualTransactions, type: "string", maxLength: 32767 },
  { id: CONFIG.worldProperties.settings, type: "string", maxLength: 4096 }
]);

export const DEFAULT_SETTINGS = Object.freeze({
  schema: 1,
  effectsQuality: "high",
  comboWindowTicks: 18,
  testCommandsEnabled: true,
  debugMessages: false
});
