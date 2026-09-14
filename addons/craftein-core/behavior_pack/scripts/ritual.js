import { world } from "@minecraft/server";
import { CONFIG, STATES } from "./config.js";

const STORAGE_KEY = CONFIG.worldProperties.ritualTransactions;
const MAX_TRANSACTIONS = 256;

function loadTransactions() {
  const raw = world.getDynamicProperty(STORAGE_KEY);
  if (typeof raw !== "string" || raw.length === 0) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTransactions(transactions) {
  const trimmed = transactions.slice(-MAX_TRANSACTIONS);
  world.setDynamicProperty(STORAGE_KEY, JSON.stringify(trimmed));
}

function makeId(prefix, targetUuid) {
  return `${prefix}:${targetUuid}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

function emitRitualVisual(player, particle, sound) {
  try {
    player.dimension.spawnParticle(particle, { x: player.location.x, y: player.location.y + 0.1, z: player.location.z });
    player.playSound(sound, { volume: 0.8, pitch: 1.0 });
  } catch {
    // Visual/audio failure must not corrupt the transaction.
  }
}

export function findActiveTransaction(targetUuid) {
  return loadTransactions().find((entry) => entry.targetUuid === targetUuid && entry.completionState === "pending");
}

export function hasCompletedReservation(targetUuid) {
  return loadTransactions().some((entry) => entry.type === "reservation" && entry.targetUuid === targetUuid && entry.completionState === "completed");
}

export function beginReservation(targetUuid, altarId, costKey) {
  const transactions = loadTransactions();
  if (hasCompletedReservation(targetUuid)) return { ok: false, reason: "reservation_exists" };
  const entry = {
    transactionId: makeId("reservation", targetUuid), type: "reservation", targetUuid, altarId, costKey,
    stage: "pending_cost", offeringState: "held", completionState: "pending",
    startedAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  transactions.push(entry); saveTransactions(transactions); return { ok: true, transaction: entry };
}

export function commitReservation(transactionId) {
  const transactions = loadTransactions();
  const index = transactions.findIndex((entry) => entry.transactionId === transactionId);
  if (index < 0 || transactions[index].completionState !== "pending") return { ok: false, reason: "not_pending" };
  transactions[index] = { ...transactions[index], stage: "reserved", offeringState: "consumed", completionState: "completed", updatedAt: new Date().toISOString() };
  saveTransactions(transactions); return { ok: true, transaction: transactions[index] };
}

export function beginResurrection(targetUuid, donorUuid, altarId, costKey) {
  const transactions = loadTransactions();
  if (findActiveTransaction(targetUuid)) return { ok: false, reason: "transaction_exists" };
  const entry = {
    transactionId: makeId("resurrection", targetUuid), type: "resurrection", targetUuid, donorUuid, altarId, costKey,
    stage: "pending_cost", offeringState: "held", completionState: "pending",
    startedAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  transactions.push(entry); saveTransactions(transactions); return { ok: true, transaction: entry };
}

export function completeTransaction(transactionId) {
  const transactions = loadTransactions();
  const index = transactions.findIndex((entry) => entry.transactionId === transactionId);
  if (index < 0 || transactions[index].completionState !== "pending") return { ok: false, reason: "not_pending" };
  transactions[index] = { ...transactions[index], stage: "completed", offeringState: "consumed", completionState: "completed", updatedAt: new Date().toISOString() };
  saveTransactions(transactions); return { ok: true, transaction: transactions[index] };
}

export function cancelTransaction(transactionId, reason = "cancelled") {
  const transactions = loadTransactions();
  const index = transactions.findIndex((entry) => entry.transactionId === transactionId);
  if (index < 0 || transactions[index].completionState !== "pending") return { ok: false, reason: "not_pending" };
  transactions[index] = { ...transactions[index], stage: reason, offeringState: "restored", completionState: "cancelled", updatedAt: new Date().toISOString() };
  saveTransactions(transactions); return { ok: true, transaction: transactions[index] };
}

export function restorePlayerFromTransaction(target, donor, altarId = "prototype_altar") {
  const targetUuid = target.id;
  const donorUuid = donor.id;
  if (!target || !donor || targetUuid === donorUuid) return { ok: false, reason: "invalid_target" };
  if (target.getDynamicProperty(CONFIG.properties.state) !== STATES.SOUL_LOST) return { ok: false, reason: "target_not_soul_lost" };
  if (donor.getDynamicProperty(CONFIG.properties.lives) <= 1) return { ok: false, reason: "donor_protected_minimum" };

  const started = beginResurrection(targetUuid, donorUuid, altarId, "donor_life_plus_rare_catalyst");
  if (!started.ok) return started;
  donor.setDynamicProperty(CONFIG.properties.lives, donor.getDynamicProperty(CONFIG.properties.lives) - 1);
  target.setDynamicProperty(CONFIG.properties.lives, 1);
  target.setDynamicProperty(CONFIG.properties.state, STATES.RESTORED);
  target.setDynamicProperty(CONFIG.properties.comboStep, 0);
  target.setDynamicProperty(CONFIG.properties.comboLockUntil, 0);
  const completed = completeTransaction(started.transaction.transactionId);
  emitRitualVisual(target, "craftein:resurrection_ring", "random.totem");
  target.sendMessage("§dYour soul returns through equivalent exchange.");
  donor.sendMessage("§5A life has been given at the Resurrection Altar.");
  return completed;
}
