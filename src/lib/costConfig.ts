/**
 * Internal cost estimation config — single source of truth for per-request cost assumptions.
 * All values in USD. Adjust as real costs become clearer.
 */

export interface FeatureCostProfile {
  /** Estimated AI model cost per request */
  aiCost: number;
  /** Estimated image processing cost (vision models) */
  imageCost: number;
  /** Model typically used */
  defaultModel: string;
}

export const COST_PROFILES: Record<string, FeatureCostProfile> = {
  palm: {
    aiCost: 0.025,
    imageCost: 0.015,
    defaultModel: "google/gemini-2.5-flash",
  },
  tarotSpread: {
    aiCost: 0.008,
    imageCost: 0,
    defaultModel: "google/gemini-3-flash-preview",
  },
  compatibility: {
    aiCost: 0.012,
    imageCost: 0,
    defaultModel: "google/gemini-3-flash-preview",
  },
  forecast: {
    aiCost: 0.008,
    imageCost: 0,
    defaultModel: "google/gemini-3-flash-preview",
  },
  rising: {
    aiCost: 0.008,
    imageCost: 0,
    defaultModel: "google/gemini-3-flash-preview",
  },
  birthChart: {
    aiCost: 0.010,
    imageCost: 0,
    defaultModel: "google/gemini-3-flash-preview",
  },
  dailyCard: {
    aiCost: 0.005,
    imageCost: 0,
    defaultModel: "gpt-4o-mini",
  },
  advisor: {
    aiCost: 0.005,
    imageCost: 0,
    defaultModel: "gpt-4o-mini",
  },
};

/** Alert thresholds for anomaly detection */
export const COST_THRESHOLDS = {
  /** Max estimated cost per user per day (USD) */
  maxDailyCostPerUser: 1.0,
  /** Max requests per user per day */
  maxDailyRequestsPerUser: 30,
  /** Max requests per IP per hour */
  maxRequestsPerIpHour: 20,
  /** Daily total cost warning (USD) */
  dailyCostWarning: 25.0,
};

export function getCostProfile(feature: string): FeatureCostProfile {
  return COST_PROFILES[feature] || { aiCost: 0.008, imageCost: 0, defaultModel: "unknown" };
}
