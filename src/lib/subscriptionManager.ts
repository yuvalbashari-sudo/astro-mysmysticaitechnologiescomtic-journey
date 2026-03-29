/**
 * Subscription Manager — Internal plan state management.
 * 
 * Stores the current user tier in localStorage.
 * This is a placeholder until a real billing provider is connected.
 * All tier checks across the app should go through this module.
 */

import type { UserTier } from "./pricingConfig";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "astrologai_user_plan";
const ADMIN_EMAIL_KEY = "astrologai_admin_email";

// Internal admin accounts — bypass all limits
const ADMIN_EMAILS = ["yuvalbashari@gmail.com"] as const;

// Cached auth email — updated via listener
// On startup, seed from localStorage so admin persists across refreshes
let _cachedAuthEmail: string | null = localStorage.getItem(ADMIN_EMAIL_KEY);
let _authReady = _cachedAuthEmail !== null; // If we have a stored admin email, consider auth "ready"
const _authReadyCallbacks: Array<() => void> = [];
// Subscribers that fire on EVERY auth state change (not just the first)
const _authChangeListeners = new Set<() => void>();

function _setAuthReady(email: string | null) {
  // If auth returns null but we have a stored admin email, keep using it
  const storedAdmin = localStorage.getItem(ADMIN_EMAIL_KEY);
  if (email === null && storedAdmin) {
    _cachedAuthEmail = storedAdmin;
  } else {
    _cachedAuthEmail = email;
  }
  // Persist admin email to localStorage so it survives app restarts
  if (email && (ADMIN_EMAILS as readonly string[]).includes(email)) {
    localStorage.setItem(ADMIN_EMAIL_KEY, email);
  }
  if (!_authReady) {
    _authReady = true;
    _authReadyCallbacks.forEach((cb) => cb());
    _authReadyCallbacks.length = 0;
  }
  // Notify all persistent listeners on every auth change
  _authChangeListeners.forEach((cb) => cb());
}

// Set up listener FIRST (fires INITIAL_SESSION before getSession resolves)
supabase.auth.onAuthStateChange((_event, session) => {
  const email = session?.user?.email?.trim().toLowerCase() ?? null;
  _setAuthReady(email);
});

// Fallback: if onAuthStateChange hasn't fired yet, read session directly
(async () => {
  const { data } = await supabase.auth.getSession();
  const email = data?.session?.user?.email?.trim().toLowerCase() ?? null;
  _setAuthReady(email);
})();

/**
 * Check if the authenticated user is an admin.
 */
function isAdminEmail(): boolean {
  if (!_cachedAuthEmail) return false;
  return (ADMIN_EMAILS as readonly string[]).includes(_cachedAuthEmail);
}

interface PlanData {
  tier: UserTier;
  activatedAt: string;
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
  if (isAdminEmail()) return "admin";
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
 * Get the currently authenticated user email.
 */
function getUserEmail(): string | null {
  return _cachedAuthEmail;
}

/**
 * Clear plan data (for testing or logout).
 */
function clearPlan(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Whether auth state has been resolved at least once.
 */
function isAuthReady(): boolean {
  return _authReady;
}

/**
 * Register a callback that fires once auth is ready (or immediately if already ready).
 */
function onAuthReady(cb: () => void): void {
  if (_authReady) { cb(); return; }
  _authReadyCallbacks.push(cb);
}

/**
 * Subscribe to auth state changes. Returns an unsubscribe function.
 * Fires on every auth change (login, logout, token refresh).
 */
function onAuthChange(cb: () => void): () => void {
  _authChangeListeners.add(cb);
  return () => { _authChangeListeners.delete(cb); };
}

export const subscriptionManager = {
  getCurrentTier,
  getPlanDetails,
  setPlan,
  isAdmin,
  isPaidTier,
  initiateUpgrade,
  clearPlan,
  getUserEmail,
  isAuthReady,
  onAuthReady,
  onAuthChange,
};
