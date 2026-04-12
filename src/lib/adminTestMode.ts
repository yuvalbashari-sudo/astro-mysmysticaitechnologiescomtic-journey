/**
 * Admin Test Mode — Bypass all blocking flows for admin users.
 * 
 * When active, provides fallback test data so admins can test
 * every feature without filling forms or hitting limits.
 */

import { subscriptionManager } from "./subscriptionManager";
import { mysticalProfile } from "./mysticalProfile";

/** Default test values injected when admin has no real data */
const ADMIN_DEFAULTS = {
  userName: "Test User",
  birthDate: "1990-01-01",
  birthTime: "12:00",
  gender: "prefer_not_to_say" as const,
  zodiacSign: "Capricorn",
  zodiacSymbol: "♑",
  zodiacElement: "Earth",
};

/**
 * Whether admin test mode is currently active.
 * True only when the authenticated user is a recognized admin.
 */
export function isAdminTestMode(): boolean {
  return subscriptionManager.isAdmin();
}

/**
 * Get a profile field, falling back to admin defaults if the user
 * is an admin and the field is missing.
 */
export function getAdminSafeProfile() {
  const profile = mysticalProfile.getProfile();
  const admin = isAdminTestMode();

  if (!admin) return profile;

  return {
    ...profile,
    userName: profile.userName || ADMIN_DEFAULTS.userName,
    birthDate: profile.birthDate || ADMIN_DEFAULTS.birthDate,
    birthTime: profile.birthTime || ADMIN_DEFAULTS.birthTime,
    gender: profile.gender || ADMIN_DEFAULTS.gender,
    zodiacSign: profile.zodiacSign || ADMIN_DEFAULTS.zodiacSign,
    zodiacSymbol: profile.zodiacSymbol || ADMIN_DEFAULTS.zodiacSymbol,
    zodiacElement: profile.zodiacElement || ADMIN_DEFAULTS.zodiacElement,
  };
}

/**
 * For components that need a zodiac sign — returns a fallback for admins.
 */
export function getAdminSafeZodiac(): { sign: string | null; symbol: string } {
  const profile = mysticalProfile.getProfile();
  if (profile.zodiacSign) {
    return { sign: profile.zodiacSign, symbol: profile.zodiacSymbol || "✦" };
  }
  if (isAdminTestMode()) {
    return { sign: ADMIN_DEFAULTS.zodiacSign, symbol: ADMIN_DEFAULTS.zodiacSymbol };
  }
  return { sign: null, symbol: "✦" };
}

/**
 * Check if a required field should block the user.
 * Admins are never blocked.
 */
export function shouldBlockForMissing(...fields: (string | undefined | null)[]): boolean {
  if (isAdminTestMode()) return false;
  return fields.some((f) => !f || f.trim() === "");
}

export { ADMIN_DEFAULTS };
