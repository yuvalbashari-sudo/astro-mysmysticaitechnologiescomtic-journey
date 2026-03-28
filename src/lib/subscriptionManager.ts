/**
 * Subscription Manager — Internal plan state management.
 * 
 * Stores the current user tier in localStorage.
 * This is a placeholder until a real billing provider is connected.
 * All tier checks across the app should go through this module.
 */

import type { UserTier } from "./pricingConfig";

const STORAGE_KEY = "astrologai_user_plan";
const ADMIN_EMAIL_KEY = "astrologai_admin_email";

// Internal admin accounts — bypass all limits
const ADMIN_EMAILS = ["yuvalbashari@gmail.com"] as const;

interface PlanData {
  tier: UserTier;
  /** ISO date string when the plan was set */
  activatedAt: string;
  /** ISO date string when the plan expires (null = never for free/admin) */
  expiresAt: string | null;
}

function loadPlan(): PlanData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlanData;
      // Validate tier
      if (["admin", "free", "pro", "vip"].includes(parsed.tier)) {
        // Check expiration for paid tiers
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
          // Plan expired — revert to free
          const reverted: PlanData = { tier: "free", activatedAt: new Date().toISOString(), expiresAt: null };
          savePlan(reverted);
          return reverted;
        }
        return parsed;
      }
    }
  } catch { /* ignore */ }
  return { tier: "free", activatedAt: new Date().toISOString(), expiresAt: null };
}

function savePlan(data: PlanData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Get the current user tier. All entitlement checks should use this.
 */
function getCurrentTier(): UserTier {
  return loadPlan().tier;
}

/**
 * Get full plan details.
 */
function getPlanDetails(): PlanData {
  return loadPlan();
}

/**
 * Set the user's plan (called when upgrading, or internally for testing).
 * In production, this will be called by the billing webhook handler.
 */
function setPlan(tier: UserTier, expiresAt?: string | null): void {
  const data: PlanData = {
    tier,
    activatedAt: new Date().toISOString(),
    expiresAt: expiresAt ?? null,
  };
  savePlan(data);
}

/**
 * Check if current user is admin (unlimited access).
 */
function isAdmin(): boolean {
  return getCurrentTier() === "admin";
}

/**
 * Check if current user has a paid plan (pro or vip).
 */
function isPaidTier(): boolean {
  const tier = getCurrentTier();
  return tier === "pro" || tier === "vip";
}

/**
 * Placeholder for future billing integration.
 * Returns a promise that resolves when checkout is complete.
 * Currently just shows a toast / placeholder.
 */
async function initiateUpgrade(_targetTier: "pro" | "vip"): Promise<boolean> {
  // TODO: Connect to Stripe/billing provider
  // For now, return false to indicate no payment was processed
  return false;
}

/**
 * Clear plan data (for testing or logout).
 */
function clearPlan(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export const subscriptionManager = {
  getCurrentTier,
  getPlanDetails,
  setPlan,
  isAdmin,
  isPaidTier,
  initiateUpgrade,
  clearPlan,
};
