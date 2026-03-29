/**
 * Pricing Configuration — Single source of truth for all pricing, limits, and tiers.
 */

export type UserTier = "admin" | "free" | "pro" | "vip";

export type FeatureKey =
  | "daily_card"
  | "monthly_horoscope"
  | "tarot_reading"
  | "compatibility_reading"
  | "palm_reading";

export type ResetCycle = "daily" | "monthly" | "none";

export interface FeatureRule {
  /** Number of free uses per cycle (0 = none free, Infinity = always free) */
  freeUses: number;
  /** Reset cycle for the free uses counter */
  resetCycle: ResetCycle;
  /** Price in ILS for additional uses after free quota exhausted */
  payPerUsePrice: number;
  /** Whether the free version is a short/limited experience */
  limitedDepth: boolean;
}

export interface SubscriptionPlan {
  monthlyPriceILS: number;
  yearlyPricePerMonthILS: number;
}

// ─── Subscription pricing ───────────────────────────────

export const SUBSCRIPTION_PLANS: Record<"pro" | "vip", SubscriptionPlan> = {
  pro: { monthlyPriceILS: 39, yearlyPricePerMonthILS: 29 },
  vip: { monthlyPriceILS: 69, yearlyPricePerMonthILS: 49 },
};

/** @deprecated Use SUBSCRIPTION_PLANS.pro instead */
export const SUBSCRIPTION: SubscriptionPlan = SUBSCRIPTION_PLANS.pro;

// ─── Unlimited rule (used by admin) ─────────────────────

const UNLIMITED_RULE: FeatureRule = {
  freeUses: Infinity,
  resetCycle: "none",
  payPerUsePrice: 0,
  limitedDepth: false,
};

// ─── Feature rules per tier ─────────────────────────────

export const FEATURE_RULES: Record<UserTier, Record<FeatureKey, FeatureRule>> = {
  admin: {
    daily_card: { ...UNLIMITED_RULE },
    monthly_horoscope: { ...UNLIMITED_RULE },
    tarot_reading: { ...UNLIMITED_RULE },
    compatibility_reading: { ...UNLIMITED_RULE },
    palm_reading: { ...UNLIMITED_RULE },
  },
  free: {
    daily_card: {
      freeUses: Infinity,
      resetCycle: "none",
      payPerUsePrice: 0,
      limitedDepth: false,
    },
    monthly_horoscope: {
      freeUses: Infinity,
      resetCycle: "none",
      payPerUsePrice: 0,
      limitedDepth: false,
    },
    tarot_reading: {
      freeUses: 3,
      resetCycle: "daily",
      payPerUsePrice: 9,
      limitedDepth: true,
    },
    compatibility_reading: {
      freeUses: 2,
      resetCycle: "daily",
      payPerUsePrice: 9,
      limitedDepth: false,
    },
    palm_reading: {
      freeUses: 0,
      resetCycle: "none",
      payPerUsePrice: 29,
      limitedDepth: false,
    },
  },
  pro: {
    daily_card: {
      freeUses: Infinity,
      resetCycle: "none",
      payPerUsePrice: 0,
      limitedDepth: false,
    },
    monthly_horoscope: {
      freeUses: Infinity,
      resetCycle: "none",
      payPerUsePrice: 0,
      limitedDepth: false,
    },
    tarot_reading: {
      freeUses: 3,
      resetCycle: "daily",
      payPerUsePrice: 5,
      limitedDepth: false,
    },
    compatibility_reading: {
      freeUses: 5,
      resetCycle: "monthly",
      payPerUsePrice: 7,
      limitedDepth: false,
    },
    palm_reading: {
      freeUses: 0,
      resetCycle: "monthly",
      payPerUsePrice: 9,
      limitedDepth: false,
    },
  },
  vip: {
    daily_card: {
      freeUses: Infinity,
      resetCycle: "none",
      payPerUsePrice: 0,
      limitedDepth: false,
    },
    monthly_horoscope: {
      freeUses: Infinity,
      resetCycle: "none",
      payPerUsePrice: 0,
      limitedDepth: false,
    },
    tarot_reading: {
      freeUses: 10,
      resetCycle: "daily",
      payPerUsePrice: 3,
      limitedDepth: false,
    },
    compatibility_reading: {
      freeUses: Infinity,
      resetCycle: "none",
      payPerUsePrice: 0,
      limitedDepth: false,
    },
    palm_reading: {
      freeUses: 3,
      resetCycle: "monthly",
      payPerUsePrice: 9,
      limitedDepth: false,
    },
  },
};

// ─── Subscriber palm reading special rules ──────────────

export const SUBSCRIBER_PALM_DISCOUNTED_LIMIT = 3; // per month
export const SUBSCRIBER_PALM_FULL_PRICE = 29; // after discount exhausted
export const SUBSCRIBER_PALM_DISCOUNT_PRICE = 9;
