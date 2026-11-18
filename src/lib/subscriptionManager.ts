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
const ADMIN_EMAILS = ["yuvalbashari@gmail.com"];

function isConfiguredAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

let authEmail: string | null = null;
let verifiedAdmin = false;
let authReady = false;
let activeToken: string | null | undefined;
const readyCallbacks: Array<() => void> = [];
const authListeners = new Set<() => void>();

function updateAuth(email: string | null, admin: boolean) {
  authEmail = email;
  verifiedAdmin = admin;
  if (!authReady) {
    authReady = true;
    for (const callback of readyCallbacks.splice(0)) callback();
  }
  for (const listener of authListeners) listener();
}

supabase.auth.onAuthStateChange((_event, session) => {
  const token = session?.access_token ?? null;
  if (activeToken === token) return;
  activeToken = token;
  const email = session?.user.email?.trim().toLowerCase() ?? null;
  if (!token || !isConfiguredAdminEmail(email)) {
    updateAuth(email, false);
    return;
  }
  if (authEmail !== email && authReady) updateAuth(email, false);
  // Leave the auth callback before validating the token with Supabase.
  setTimeout(async () => {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (activeToken !== token) return;
      const user = data?.user;
      updateAuth(email, !error && !!user?.email_confirmed_at && isConfiguredAdminEmail(user.email));
    } catch {
      if (activeToken === token) updateAuth(email, false);
    }
  }, 0);
});

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
      if (["free", "pro", "vip"].includes(parsed.tier)) {
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
  if (verifiedAdmin) return "admin";
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
function setPlan(tier: Exclude<UserTier, "admin">, expiresAt?: string | null): void {
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
  return verifiedAdmin;
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
  return authEmail;
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
  return authReady;
}

/**
 * Register a callback that fires once auth is ready (or immediately if already ready).
 */
function onAuthReady(cb: () => void): void {
  if (authReady) { cb(); return; }
  readyCallbacks.push(cb);
}

/**
 * Subscribe to auth state changes. Returns an unsubscribe function.
 * Fires on every auth change (login, logout, token refresh).
 */
function onAuthChange(cb: () => void): () => void {
  authListeners.add(cb);
  return () => { authListeners.delete(cb); };
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
  getAccessToken: () => activeToken ?? null,
  isAuthReady,
  onAuthReady,
  onAuthChange,
  isConfiguredAdminEmail,
};
