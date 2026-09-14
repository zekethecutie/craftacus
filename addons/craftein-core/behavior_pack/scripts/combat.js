import { EntityDamageCause, system, world } from "@minecraft/server";
import { CONFIG, PROTOTYPE_WEAPON, STATES } from "./config.js";

const props = CONFIG.properties;
const COMBO_RESET_TICKS = 18;
const RECOVERY_TICKS = 12;
const FINISHER_COOLDOWN_TICKS = 120;
const RANGE = 4.2;

const FORMS = Object.freeze([
  { name: "First Form: Starfall Cut", damage: 4, particle: "craftein:astral_arc", sound: "random.orb" },
  { name: "Second Form: Orbit Breaker", damage: 5, particle: "craftein:astral_arc", sound: "random.anvil_land" },
  { name: "Third Form: Astral Sever", damage: 7, particle: "craftein:astral_arc", sound: "random.explode" }
]);

function readInt(player, id, fallback = 0) {
  const value = player.getDynamicProperty(id);
  return typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : fallback;
}

function itemIsPrototype(itemStack) {
  return itemStack?.typeId === PROTOTYPE_WEAPON;
}

function stateAllowsCombat(player) {
  const state = player.getDynamicProperty(props.state);
  return state !== STATES.SOUL_LOST && state !== STATES.AWAITING_RESURRECTION && state !== STATES.RESURRECTING;
}

function showCombo(player, text, step, total = 3) {
  player.onScreenDisplay.setActionBar(`§b${text} §7[${step}/${total}]`);
}

function frontPoint(player, distance = 2.2, y = 1.1) {
  const location = player.location;
  const view = player.getViewDirection();
  return { x: location.x + view.x * distance, y: location.y + y, z: location.z + view.z * distance };
}

function emitSkill(player, particle, sound, point = frontPoint(player)) {
  try {
    player.dimension.spawnParticle(particle, point);
    player.playSound(sound, { volume: 0.65, pitch: 1.1 });
  } catch {
    // Visual/audio failure must never cancel the authoritative combat state.
  }
}

function damageTargets(player, amount, radius = RANGE) {
  const origin = frontPoint(player, 1.8, 1.0);
  const entities = player.dimension.getEntities({ location: origin, maxDistance: radius });
  for (const entity of entities) {
    if (entity === player || entity.typeId === "minecraft:item" || entity.typeId === "minecraft:xp_orb") continue;
    try {
      entity.applyDamage(amount, { cause: EntityDamageCause.entityAttack, damagingEntity: player });
    } catch {
      // Unsupported entities are ignored; one bad target cannot break the combo.
    }
  }
}

function runForm(player, form, step) {
  emitSkill(player, form.particle, form.sound);
  damageTargets(player, form.damage, step === 3 ? RANGE + 1 : RANGE);
  showCombo(player, form.name, step);
}

function startRecovery(player, until) {
  player.setDynamicProperty(props.comboLockUntil, until);
  system.runTimeout(() => {
    if (player.isValid()) player.sendMessage("§7Your stance opens again.");
  }, RECOVERY_TICKS);
}

function useCombo(player) {
  if (!stateAllowsCombat(player)) return;
  const now = system.currentTick;
  const lockUntil = readInt(player, props.comboLockUntil, 0);
  if (now < lockUntil) {
    player.onScreenDisplay.setActionBar("§8Recovering...");
    return;
  }

  const previous = readInt(player, props.comboLastTick, -COMBO_RESET_TICKS);
  let step = readInt(player, props.comboStep, 0);
  if (now - previous > COMBO_RESET_TICKS) step = 0;
  step = (step % FORMS.length) + 1;

  player.setDynamicProperty(props.comboStep, step);
  player.setDynamicProperty(props.comboLastTick, now);
  runForm(player, FORMS[step - 1], step);

  const recovery = step === 3 ? RECOVERY_TICKS + 8 : RECOVERY_TICKS;
  startRecovery(player, now + recovery);

  if (step === 3) {
    player.sendMessage("§5The third cut completes the Astral sequence. Hold your timing for the Crown.");
  }
}

function useFinisher(player) {
  if (!stateAllowsCombat(player)) return;
  const now = system.currentTick;
  const last = readInt(player, props.comboLockUntil, 0);
  if (now < last) {
    player.onScreenDisplay.setActionBar("§8Recovering...");
    return;
  }
  const step = readInt(player, props.comboStep, 0);
  const lastHit = readInt(player, props.comboLastTick, -9999);
  if (step !== 3 || now - lastHit > 20) {
    player.sendMessage("§cThe Crown requires three connected cuts.");
    return;
  }
  emitSkill(player, "craftein:resurrection_ring", "random.totem", frontPoint(player, 2.4, 1.3));
  damageTargets(player, 14, RANGE + 2);
  player.setDynamicProperty(props.comboStep, 0);
  player.setDynamicProperty(props.comboLastTick, now);
  player.setDynamicProperty(props.comboLockUntil, now + FINISHER_COOLDOWN_TICKS);
  player.sendMessage("§dCrown of Returning unleashed. §7The blade enters recovery.");
}

export function registerCombatEvents() {
  world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
    if (!source || source.typeId !== "minecraft:player" || !itemIsPrototype(itemStack)) return;
    useCombo(source);
  });

  world.afterEvents.itemReleaseUse.subscribe(({ source, itemStack }) => {
    if (!source || source.typeId !== "minecraft:player" || !itemIsPrototype(itemStack)) return;
    useFinisher(source);
  });
}
