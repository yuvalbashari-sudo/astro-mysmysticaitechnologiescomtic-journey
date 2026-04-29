/**
 * Premium Unlock — per-reading unlock state.
 *
 * Each premium reading must pass through: preview → unlock CTA → promo video →
 * payment / upgrade modal. Once the user completes the flow for a specific
 * reading id, we remember it for the rest of the browser session so the same
 * reading isn't re-gated on re-render. A new reading (different id) re-triggers
 * the gate.
 */

import { subscriptionManager } from "./subscriptionManager";

const STORAGE_KEY = "astrologai_unlocked_readings_v1";

function getUnlockedSet(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function persist(set: Set<string>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

function isUnlocked(readingId: string): boolean {
  if (!readingId) return false;
  // Real authenticated admin email bypasses gating. Preview-only admin
  // override does NOT bypass — otherwise testers cannot see the flow.
  const email = subscriptionManager.getUserEmail();
  if (email && email === "yuvalbashari@gmail.com") return true;
  return getUnlockedSet().has(readingId);
}

function markUnlocked(readingId: string): void {
  if (!readingId) return;
  const set = getUnlockedSet();
  set.add(readingId);
  persist(set);
}

function clearUnlock(readingId: string): void {
  const set = getUnlockedSet();
  set.delete(readingId);
  persist(set);
}

function clearAll(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export const premiumUnlock = {
  isUnlocked,
  markUnlocked,
  clearUnlock,
  clearAll,
};
