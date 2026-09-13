import { world } from "@minecraft/server";
import { CONFIG } from "./config.js";

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

export function findActiveTransaction(targetUuid) {
  return loadTransactions().find((entry) => entry.targetUuid === targetUuid && entry.completionState === "pending");
}

export function beginReservation(targetUuid, altarId, costKey) {
  const transactions = loadTransactions();
  if (transactions.some((entry) => entry.type === "reservation" && entry.targetUuid === targetUuid && entry.completionState === "completed")) {
    return { ok: false, reason: "reservation_exists" };
  }
  const entry = {
    transactionId: makeId("reservation", targetUuid),
    type: "reservation",
    targetUuid,
    altarId,
    costKey,
    stage: "pending_cost",
    offeringState: "held",
    completionState: "pending",
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  transactions.push(entry);
  saveTransactions(transactions);
  return { ok: true, transaction: entry };
}

export function beginResurrection(targetUuid, donorUuid, altarId, costKey) {
  const transactions = loadTransactions();
  if (findActiveTransaction(targetUuid)) return { ok: false, reason: "transaction_exists" };
  const entry = {
    transactionId: makeId("resurrection", targetUuid),
    type: "resurrection",
    targetUuid,
    donorUuid,
    altarId,
    costKey,
    stage: "pending_cost",
    offeringState: "held",
    completionState: "pending",
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  transactions.push(entry);
  saveTransactions(transactions);
  return { ok: true, transaction: entry };
}

export function advanceTransaction(transactionId, stage, offeringState = "held") {
  const transactions = loadTransactions();
  const index = transactions.findIndex((entry) => entry.transactionId === transactionId);
  if (index < 0 || transactions[index].completionState !== "pending") return { ok: false, reason: "not_pending" };
  transactions[index] = {
    ...transactions[index],
    stage,
    offeringState,
    updatedAt: new Date().toISOString()
  };
  saveTransactions(transactions);
  return { ok: true, transaction: transactions[index] };
}

export function completeTransaction(transactionId) {
  const transactions = loadTransactions();
  const index = transactions.findIndex((entry) => entry.transactionId === transactionId);
  if (index < 0 || transactions[index].completionState !== "pending") return { ok: false, reason: "not_pending" };
  transactions[index] = {
    ...transactions[index],
    stage: "completed",
    offeringState: "consumed",
    completionState: "completed",
    updatedAt: new Date().toISOString()
  };
  saveTransactions(transactions);
  return { ok: true, transaction: transactions[index] };
}

export function cancelTransaction(transactionId, reason = "cancelled") {
  const transactions = loadTransactions();
  const index = transactions.findIndex((entry) => entry.transactionId === transactionId);
  if (index < 0 || transactions[index].completionState !== "pending") return { ok: false, reason: "not_pending" };
  transactions[index] = {
    ...transactions[index],
    stage: reason,
    offeringState: "restored",
    completionState: "cancelled",
    updatedAt: new Date().toISOString()
  };
  saveTransactions(transactions);
  return { ok: true, transaction: transactions[index] };
}
