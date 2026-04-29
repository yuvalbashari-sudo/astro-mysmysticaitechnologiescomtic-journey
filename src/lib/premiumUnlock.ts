/**
 * Premium Unlock — per-reading unlock state.
 *
 * Each premium reading must pass through: preview → unlock CTA → promo video →
 * payment / upgrade modal. Once the user completes the flow for a specific
 * reading id, we remember it for the rest of the browser session so the same
 * reading isn't re-gated on re-render. A new reading (different id) re-triggers
 * the gate.
 */

import { useEffect, useState } from "react";

const STORAGE_KEY = "astrologai_unlocked_readings_v1";
const EVENT_NAME = "astrologai:unlock-changed";

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
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch { /* ignore */ }
}

function isUnlocked(readingId: string): boolean {
  if (!readingId) return false;
  // No automatic bypass — gating must be passed for every reading.
  // Admin bypass is only available via an explicit `forceUnlock` flag passed
  // to the PremiumUnlockOverlay component (never inferred from environment,
  // tier, or email).
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
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch { /* ignore */ }
}

export const premiumUnlock = {
  isUnlocked,
  markUnlocked,
  clearUnlock,
  clearAll,
};

/**
 * React hook — returns whether a given reading id is currently unlocked.
 * Re-renders when unlock state changes anywhere in the app.
 */
export function usePremiumUnlocked(readingId: string): boolean {
  const [unlocked, setUnlocked] = useState<boolean>(() => premiumUnlock.isUnlocked(readingId));
  useEffect(() => {
    const sync = () => setUnlocked(premiumUnlock.isUnlocked(readingId));
    sync();
    window.addEventListener(EVENT_NAME, sync);
    return () => window.removeEventListener(EVENT_NAME, sync);
  }, [readingId]);
  return unlocked;
}
