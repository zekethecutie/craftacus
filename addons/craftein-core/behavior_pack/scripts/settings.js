import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { DEFAULT_SETTINGS, CONFIG } from "./config.js";

function loadSettings(world) {
  const raw = world.getDynamicProperty(CONFIG.worldProperties.settings);
  if (typeof raw !== "string" || raw.length === 0) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(world, settings) {
  world.setDynamicProperty(CONFIG.worldProperties.settings, JSON.stringify(settings));
}

export function getSettings(world) {
  return loadSettings(world);
}

export async function showSettingsMenu(player, world, isOperator) {
  if (!isOperator(player)) {
    player.sendMessage("§cCRAFTEIN settings are restricted to operator players.");
    return;
  }
  const settings = loadSettings(world);
  const form = new ActionFormData()
    .title("§dCRAFTEIN Settings")
    .body(`§7World mechanics control panel\n\n§fEffects: §b${settings.effectsQuality}\n§fCombo window: §b${settings.comboWindowTicks} ticks\n§fTest commands: §b${settings.testCommandsEnabled ? "enabled" : "disabled"}`)
    .button("Combat and Effects")
    .button("Testing Controls")
    .button("Close");

  let result;
  try {
    result = await form.show(player);
  } catch {
    return;
  }
  if (result.canceled || result.selection === 2) return;
  if (result.selection === 0) return showCombatSettings(player, world, isOperator, settings);
  return showTestingSettings(player, world, isOperator, settings);
}

async function showCombatSettings(player, world, isOperator, settings) {
  if (!isOperator(player)) return;
  const form = new ModalFormData()
    .title("§dCombat and Effects")
    .dropdown("Effect quality", ["low", "medium", "high"], Math.max(0, ["low", "medium", "high"].indexOf(settings.effectsQuality)))
    .slider("Combo timing window (ticks)", 8, 40, 1, settings.comboWindowTicks)
    .toggle("Show debug messages", settings.debugMessages);
  let result;
  try {
    result = await form.show(player);
  } catch {
    return;
  }
  if (result.canceled) return showSettingsMenu(player, world, isOperator);
  const values = result.formValues ?? [];
  const quality = ["low", "medium", "high"][Number(values[0]) ?? 2] ?? "high";
  const comboWindowTicks = Math.max(8, Math.min(40, Number(values[1]) || 18));
  saveSettings(world, { ...settings, effectsQuality: quality, comboWindowTicks, debugMessages: Boolean(values[2]) });
  player.sendMessage(`§aCRAFTEIN combat settings saved. §7Effects=${quality}, window=${comboWindowTicks} ticks.`);
}

async function showTestingSettings(player, world, isOperator, settings) {
  if (!isOperator(player)) return;
  const form = new ModalFormData()
    .title("§dTesting Controls")
    .toggle("Enable operator test commands", settings.testCommandsEnabled)
    .toggle("Enable verbose debug messages", settings.debugMessages);
  let result;
  try {
    result = await form.show(player);
  } catch {
    return;
  }
  if (result.canceled) return showSettingsMenu(player, world, isOperator);
  const values = result.formValues ?? [];
  saveSettings(world, { ...settings, testCommandsEnabled: Boolean(values[0]), debugMessages: Boolean(values[1]) });
  player.sendMessage(`§aCRAFTEIN testing settings saved. §7Commands=${values[0] ? "enabled" : "disabled"}.`);
}
