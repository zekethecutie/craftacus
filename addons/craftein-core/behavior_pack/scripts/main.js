import { DynamicPropertiesDefinition, EntityTypes, PlayerPermissionLevel, system, world } from "@minecraft/server";
import { CONFIG, PROPERTY_DEFINITIONS, STATES, WORLD_PROPERTY_DEFINITIONS } from "./config.js";
import { registerCombatEvents } from "./combat.js";
import { beginReservation, commitReservation, restorePlayerFromTransaction } from "./ritual.js";
import { getSettings, showSettingsMenu } from "./settings.js";

const props = CONFIG.properties;

function readInt(player, id, fallback = 0) {
  const value = player.getDynamicProperty(id);
  return typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : fallback;
}

function readString(player, id, fallback = "") {
  const value = player.getDynamicProperty(id);
  return typeof value === "string" ? value : fallback;
}

function setState(player, state) {
  player.setDynamicProperty(props.state, state);
}

function lives(player) {
  return readInt(player, props.lives, CONFIG.startingLives);
}

function showStatus(player) {
  const current = Math.max(0, lives(player));
  const maximum = Math.max(1, readInt(player, props.maxLives, CONFIG.maximumLives));
  const state = readString(player, props.state, STATES.ALIVE);
  const icons = `${"♥".repeat(Math.min(current, maximum))}${"♡".repeat(Math.max(0, maximum - current))}`;
  const suffix = state === STATES.SOUL_LOST ? "  §8[SOUL LOST]" : "";
  try {
    player.onScreenDisplay.setActionBar(`§dDanan Blessing §f${icons}${suffix}`);
  } catch {
    // Action-bar support is a version-sensitive fallback; gameplay state remains authoritative.
  }
}

function initializePlayer(player) {
  const schema = readInt(player, props.schema, 0);
  if (schema === 0) {
    player.setDynamicProperty(props.lives, CONFIG.startingLives);
    player.setDynamicProperty(props.maxLives, CONFIG.maximumLives);
    player.setDynamicProperty(props.blessing, "danan");
    player.setDynamicProperty(props.state, STATES.ALIVE);
    player.setDynamicProperty(props.deathToken, "");
    player.setDynamicProperty(props.deaths, 0);
    player.setDynamicProperty(props.comboStep, 0);
    player.setDynamicProperty(props.comboLastTick, -9999);
    player.setDynamicProperty(props.comboLockUntil, 0);
    player.setDynamicProperty(props.schema, CONFIG.schemaVersion);
    player.sendMessage("§dThe Danan blessing recognizes you. §fYou carry three returns.");
    return;
  }

  // Defensive migration boundary for future schema versions.
  if (schema < CONFIG.schemaVersion) {
    player.setDynamicProperty(props.schema, CONFIG.schemaVersion);
  }

  if (!readString(player, props.state)) {
    setState(player, STATES.ALIVE);
  }
  if (typeof player.getDynamicProperty(props.comboStep) !== "number") player.setDynamicProperty(props.comboStep, 0);
  if (typeof player.getDynamicProperty(props.comboLastTick) !== "number") player.setDynamicProperty(props.comboLastTick, -9999);
  if (typeof player.getDynamicProperty(props.comboLockUntil) !== "number") player.setDynamicProperty(props.comboLockUntil, 0);
}

function processDeath(player) {
  const tick = system.currentTick;
  const token = `${player.name}:${tick}`;
  const previousToken = readString(player, props.deathToken);
  if (previousToken === token) return;
  player.setDynamicProperty(props.deathToken, token);

  const previousLives = lives(player);
  const nextLives = Math.max(0, previousLives - 1);
  player.setDynamicProperty(props.lives, nextLives);
  player.setDynamicProperty(props.deaths, readInt(player, props.deaths) + 1);

  if (nextLives === 0 && CONFIG.soulLossEnabled) {
    setState(player, STATES.SOUL_LOST);
    player.sendMessage("§5Your final return has been spent. §8Your soul is lost until a valid resurrection.");
    system.runTimeout(() => {
      try {
        if (readString(player, props.state) === STATES.SOUL_LOST && CONFIG.zeroLifeMode === "spectator") {
          player.runCommand("gamemode spectator");
        }
      } catch {
        player.sendMessage("§8Soul-loss mode is pending server enforcement for this Bedrock version.");
      }
    }, 2);
  } else {
    setState(player, STATES.ALIVE);
    player.sendMessage(`§dA Danan blessing fades. §fRemaining returns: ${nextLives}/${readInt(player, props.maxLives, CONFIG.maximumLives)}`);
  }

  showStatus(player);
}

function isOperator(player) {
  try {
    return player.commandPermissionLevel === PlayerPermissionLevel.Operator;
  } catch {
    return false;
  }
}

function handleTestCommand(player, message) {
  if (!CONFIG.allowOperatorTestCommands || !message.startsWith("!craftein")) return;
  const parts = message.trim().split(/\s+/);
  const command = parts[1] ?? "";

  if (!isOperator(player)) {
    player.sendMessage("§cThis test command is restricted.");
    return;
  }

  if (command === "settings" || command === "menu") {
    system.run(() => showSettingsMenu(player, world, isOperator));
    return;
  }

  const settings = getSettings(world);
  if (!settings.testCommandsEnabled) return;

  if (command === "lives" || command === "blessing") {
    initializePlayer(player);
    const state = readString(player, props.state, STATES.ALIVE);
    player.sendMessage(`§dCRAFTEIN §fLives: ${lives(player)}/${readInt(player, props.maxLives, CONFIG.maximumLives)} §7State: ${state}`);
    showStatus(player);
    return;
  }

  if (command === "reset") {
    player.setDynamicProperty(props.lives, CONFIG.startingLives);
    player.setDynamicProperty(props.maxLives, CONFIG.maximumLives);
    setState(player, STATES.ALIVE);
    player.sendMessage("§aCRAFTEIN test state reset.");
    showStatus(player);
    return;
  }

  if (command === "setlives") {
    const value = Number.parseInt(parts[2] ?? "", 10);
    if (!Number.isInteger(value) || value < 0 || value > CONFIG.maximumLives) {
      player.sendMessage(`§cUse a whole number from 0 to ${CONFIG.maximumLives}.`);
      return;
    }
    player.setDynamicProperty(props.lives, value);
    setState(player, value === 0 ? STATES.SOUL_LOST : STATES.ALIVE);
    player.sendMessage(`§eCRAFTEIN test lives set to ${value}.`);
    showStatus(player);
    return;
  }

  if (command === "giveblade") {
    player.runCommand("give @s craftein:astral_blade 1");
    player.sendMessage("§bThe Astral Blade prototype has been placed in your hand.");
    return;
  }

  if (command === "reserve") {
    const started = beginReservation(player.id, "prototype_altar", "rare_catalyst");
    if (!started.ok) {
      player.sendMessage(`§cReservation failed: ${started.reason}`);
      return;
    }
    const committed = commitReservation(started.transaction.transactionId);
    player.sendMessage(committed.ok ? "§dOne resurrection life is reserved. §7Prototype reservation committed." : "§cReservation could not be committed.");
    return;
  }

  if (command === "resurrect") {
    const targetName = parts[2];
    const target = world.getPlayers().find((candidate) => candidate.name === targetName);
    if (!target) {
      player.sendMessage("§cTarget must be online for the prototype ritual.");
      return;
    }
    const result = restorePlayerFromTransaction(target, player);
    player.sendMessage(result.ok ? "§aPrototype resurrection completed." : `§cResurrection failed: ${result.reason}`);
  }
}

world.afterEvents.worldInitialize.subscribe((event) => {
  const definitions = new DynamicPropertiesDefinition();
  for (const { id, type } of PROPERTY_DEFINITIONS) {
    if (type === "int") definitions.defineNumber(id);
    if (type === "string") definitions.defineString(id, 64);
  }
  event.propertyRegistry.registerEntityTypeDynamicProperties(definitions, EntityTypes.get("minecraft:player"));

  const worldDefinitions = new DynamicPropertiesDefinition();
  for (const { id, type, maxLength } of WORLD_PROPERTY_DEFINITIONS) {
    if (type === "int") worldDefinitions.defineNumber(id);
    if (type === "string") worldDefinitions.defineString(id, maxLength);
  }
  event.propertyRegistry.registerWorldDynamicProperties(worldDefinitions);
  if (typeof world.getDynamicProperty(CONFIG.worldProperties.settings) !== "string") {
    world.setDynamicProperty(CONFIG.worldProperties.settings, JSON.stringify({ schema: 1, effectsQuality: "high", comboWindowTicks: 18, testCommandsEnabled: true, debugMessages: false }));
  }
});

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  initializePlayer(player);
  if (initialSpawn) {
    showStatus(player);
  }
});

world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
  if (deadEntity?.typeId !== "minecraft:player") return;
  processDeath(deadEntity);
});

world.beforeEvents.chatSend.subscribe((event) => {
  if (readString(event.sender, props.state, STATES.ALIVE) === STATES.SOUL_LOST) {
    event.cancel = true;
    return;
  }
  if (!event.message.startsWith("!craftein")) return;
  event.cancel = true;
  handleTestCommand(event.sender, event.message);
});

registerCombatEvents();

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const state = readString(player, props.state, STATES.ALIVE);
    if (state === STATES.SOUL_LOST) {
      showStatus(player);
    }
  }
}, 40);
