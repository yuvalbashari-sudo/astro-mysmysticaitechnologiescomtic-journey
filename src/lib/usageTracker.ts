/**
 * Usage Tracker — Tracks daily and monthly feature usage in localStorage.
 * Handles automatic resets at midnight (daily) and billing cycle (monthly).
 */

import type { FeatureKey, ResetCycle } from "./pricingConfig";

interface UsageRecord {
  count: number;
  /** ISO date string of the period start */
  periodStart: string;
}

interface UsageData {
  daily: Partial<Record<FeatureKey, UsageRecord>>;
  monthly: Partial<Record<FeatureKey, UsageRecord>>;
  /** ISO date of subscription start (for monthly cycle calculation) */
  subscriptionStartDate?: string;
}

const STORAGE_KEY = "astrologai_usage";

function getToday(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getMonthPeriod(subscriptionStartDate?: string): string {
  const now = new Date();
  if (subscriptionStartDate) {
    // Calculate current billing period based on subscription start day
    const startDay = new Date(subscriptionStartDate).getDate();
    const year = now.getFullYear();
    const month = now.getMonth();
    const currentDay = now.getDate();
    
    if (currentDay >= startDay) {
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(startDay).padStart(2, "0")}`;
    } else {
      // We're before the billing day, so period started last month
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      return `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(startDay).padStart(2, "0")}`;
    }
  }
  // Fallback: use calendar month start
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function loadUsage(): UsageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { daily: {}, monthly: {} };
}

function saveUsage(data: UsageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Get current usage count for a feature, auto-resetting if the period has expired.
 */
function getUsageCount(feature: FeatureKey, cycle: ResetCycle): number {
  if (cycle === "none") return 0;
  
  const data = loadUsage();
  const bucket = cycle === "daily" ? data.daily : data.monthly;
  const record = bucket[feature];
  
  if (!record) return 0;
  
  const currentPeriod = cycle === "daily"
    ? getToday()
    : getMonthPeriod(data.subscriptionStartDate);
  
  // Period expired — reset
  if (record.periodStart !== currentPeriod) return 0;
  
  return record.count;
}

/**
 * Increment usage count for a feature.
 */
function recordUsage(feature: FeatureKey, cycle: ResetCycle): void {
  if (cycle === "none") return;
  
  const data = loadUsage();
  const bucketKey = cycle === "daily" ? "daily" : "monthly";
  const currentPeriod = cycle === "daily"
    ? getToday()
    : getMonthPeriod(data.subscriptionStartDate);
  
  const existing = data[bucketKey][feature];
  
  if (existing && existing.periodStart === currentPeriod) {
    existing.count++;
  } else {
    data[bucketKey][feature] = { count: 1, periodStart: currentPeriod };
  }
  
  saveUsage(data);
}

/**
 * Set the subscription start date for monthly cycle calculations.
 */
function setSubscriptionStartDate(isoDate: string): void {
  const data = loadUsage();
  data.subscriptionStartDate = isoDate;
  saveUsage(data);
}

/**
 * Get the number of discounted palm readings used this month (subscriber-specific).
 */
function getMonthlyPalmUsage(): number {
  return getUsageCount("palm_reading", "monthly");
}

/**
 * Clear all usage data.
 */
function clearUsage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export const usageTracker = {
  getUsageCount,
  recordUsage,
  setSubscriptionStartDate,
  getMonthlyPalmUsage,
  clearUsage,
};
