/**
 * Entitlements — Access checks, price computation, and gating prompt generation.
 */

import {
  FEATURE_RULES,
  SUBSCRIBER_PALM_DISCOUNTED_LIMIT,
  SUBSCRIBER_PALM_FULL_PRICE,
  SUBSCRIBER_PALM_DISCOUNT_PRICE,
  type UserTier,
  type FeatureKey,
  type ResetCycle,
} from "./pricingConfig";
import { usageTracker } from "./usageTracker";
import { subscriptionManager } from "./subscriptionManager";

export type AccessResult =
  | { allowed: true; isFree: true; limitedDepth: boolean }
  | { allowed: true; isFree: false; priceILS: number }
  | { allowed: false; priceILS: number; promptKey: GatingPromptKey; resetCycle: ResetCycle };

export type GatingPromptKey =
  | "tarot_free_exhausted"
  | "tarot_sub_exhausted"
  | "compatibility_free_exhausted"
  | "compatibility_sub_exhausted"
  | "palm_free"
  | "palm_sub_discounted"
  | "palm_sub_full";

/**
 * Check whether a user can access a feature and at what cost.
 * If no tier is provided, uses the current tier from subscriptionManager.
 */
function checkAccess(feature: FeatureKey, tier?: UserTier): AccessResult {
  const resolvedTier = tier ?? subscriptionManager.getCurrentTier();
  const rule = FEATURE_RULES[resolvedTier][feature];

  // Admin always has unlimited access
  if (resolvedTier === "admin") {
    return { allowed: true, isFree: true, limitedDepth: false };
  }

  // Always-free features
  if (rule.freeUses === Infinity) {
    return { allowed: true, isFree: true, limitedDepth: rule.limitedDepth };
  }

  // Special palm reading logic for paid tiers
  if (feature === "palm_reading" && (resolvedTier === "pro" || resolvedTier === "vip")) {
    const monthlyPalmUsage = usageTracker.getMonthlyPalmUsage();
    if (monthlyPalmUsage < SUBSCRIBER_PALM_DISCOUNTED_LIMIT) {
      return { allowed: true, isFree: false, priceILS: SUBSCRIBER_PALM_DISCOUNT_PRICE };
    }
    return { allowed: true, isFree: false, priceILS: SUBSCRIBER_PALM_FULL_PRICE };
  }

  // Palm reading for free users — always paid
  if (feature === "palm_reading" && resolvedTier === "free") {
    return { allowed: true, isFree: false, priceILS: rule.payPerUsePrice };
  }

  // Check usage quota
  const used = usageTracker.getUsageCount(feature, rule.resetCycle);

  if (used < rule.freeUses) {
    return { allowed: true, isFree: true, limitedDepth: rule.limitedDepth };
  }

  // Quota exhausted — pay-per-use
  const promptKey = getPromptKey(feature, resolvedTier);
  return { allowed: false, priceILS: rule.payPerUsePrice, promptKey, resetCycle: rule.resetCycle };
}

function getPromptKey(feature: FeatureKey, tier: UserTier): GatingPromptKey {
  const isPaid = tier === "pro" || tier === "vip";
  switch (feature) {
    case "tarot_reading":
      return isPaid ? "tarot_sub_exhausted" : "tarot_free_exhausted";
    case "compatibility_reading":
      return isPaid ? "compatibility_sub_exhausted" : "compatibility_free_exhausted";
    case "palm_reading":
      if (tier === "free") return "palm_free";
      const used = usageTracker.getMonthlyPalmUsage();
      return used < SUBSCRIBER_PALM_DISCOUNTED_LIMIT ? "palm_sub_discounted" : "palm_sub_full";
    default:
      return "tarot_free_exhausted";
  }
}

/**
 * Record that a feature was used (call after successful access / payment).
 * If no tier is provided, uses the current tier from subscriptionManager.
 */
function recordFeatureUse(feature: FeatureKey, tier?: UserTier): void {
  const resolvedTier = tier ?? subscriptionManager.getCurrentTier();
  // Admin usage is not tracked
  if (resolvedTier === "admin") return;
  const rule = FEATURE_RULES[resolvedTier][feature];
  usageTracker.recordUsage(feature, rule.resetCycle);
}

/**
 * Get remaining free uses for a feature.
 * If no tier is provided, uses the current tier from subscriptionManager.
 */
function getRemainingFreeUses(feature: FeatureKey, tier?: UserTier): number {
  const resolvedTier = tier ?? subscriptionManager.getCurrentTier();
  // Admin has unlimited
  if (resolvedTier === "admin") return Infinity;
  const rule = FEATURE_RULES[resolvedTier][feature];
  if (rule.freeUses === Infinity) return Infinity;
  if (rule.freeUses === 0) return 0;
  const used = usageTracker.getUsageCount(feature, rule.resetCycle);
  return Math.max(0, rule.freeUses - used);
}

// ─── Gating prompt messages ─────────────────────────────

export interface GatingMessage {
  he: string;
  en: string;
  ar: string;
  ru: string;
  priceILS: number;
}

const GATING_MESSAGES: Record<GatingPromptKey, (priceILS: number) => GatingMessage> = {
  tarot_free_exhausted: (p) => ({
    he: `השתמשת בקריאת הטארוט החינמית להיום. פתח קריאה נוספת תמורת ${p} ₪.`,
    en: `You've used your free tarot reading for today. Unlock another reading for ₪${p}.`,
    ar: `لقد استخدمت قراءة التارو المجانية لليوم. افتح قراءة أخرى مقابل ${p} ₪.`,
    ru: `Вы использовали бесплатное чтение Таро на сегодня. Разблокируйте ещё одно за ₪${p}.`,
    priceILS: p,
  }),
  tarot_sub_exhausted: (p) => ({
    he: `השתמשת בקריאות הטארוט הכלולות להיום. קריאות נוספות ב-${p} ₪ כל אחת.`,
    en: `You've used your included tarot readings for today. Additional readings are ₪${p} each.`,
    ar: `لقد استخدمت قراءات تارو المضمنة لليوم. قراءات إضافية بسعر ${p} ₪ لكل واحدة.`,
    ru: `Вы использовали включённые чтения Таро на сегодня. Дополнительные — по ₪${p}.`,
    priceILS: p,
  }),
  compatibility_free_exhausted: (p) => ({
    he: `השתמשת ב-2 קריאות ההתאמה החינמיות להיום. פתח קריאה נוספת תמורת ${p} ₪.`,
    en: `You've used your 2 free compatibility readings for today. Unlock another reading for ₪${p}.`,
    ar: `لقد استخدمت قراءتي التوافق المجانيتين لليوم. افتح قراءة أخرى مقابل ${p} ₪.`,
    ru: `Вы использовали 2 бесплатных чтения совместимости на сегодня. Разблокируйте ещё одно за ₪${p}.`,
    priceILS: p,
  }),
  compatibility_sub_exhausted: (p) => ({
    he: `השתמשת בקריאות ההתאמה הכלולות החודש. קריאות נוספות ב-${p} ₪ כל אחת.`,
    en: `You've used your included compatibility readings this month. Additional readings are ₪${p} each.`,
    ar: `لقد استخدمت قراءات التوافق المضمنة هذا الشهر. قراءات إضافية بسعر ${p} ₪ لكل واحدة.`,
    ru: `Вы использовали включённые чтений совместимости в этом месяце. Дополнительные — по ₪${p}.`,
    priceILS: p,
  }),
  palm_free: (p) => ({
    he: `קריאת כף יד זמינה תמורת ${p} ₪.`,
    en: `Palm reading is available for ₪${p}.`,
    ar: `قراءة الكف متاحة مقابل ${p} ₪.`,
    ru: `Чтение по ладони доступно за ₪${p}.`,
    priceILS: p,
  }),
  palm_sub_discounted: (p) => ({
    he: `כמנוי/ה, קריאת כף יד ב-${p} ₪ בלבד, עד 3 פעמים בחודש.`,
    en: `As a subscriber, palm reading is only ₪${p}, up to 3 times per month.`,
    ar: `كمشترك، قراءة الكف فقط ${p} ₪، حتى 3 مرات في الشهر.`,
    ru: `Как подписчик, чтение по ладони — всего ₪${p}, до 3 раз в месяц.`,
    priceILS: p,
  }),
  palm_sub_full: (p) => ({
    he: `השתמשת ב-3 קריאות כף היד המוזלות החודש. קריאות נוספות ב-${p} ₪.`,
    en: `You've used your 3 discounted palm readings this month. Additional readings are ₪${p} each.`,
    ar: `لقد استخدمت 3 قراءات الكف المخفضة هذا الشهر. قراءات إضافية بسعر ${p} ₪.`,
    ru: `Вы использовали 3 чтения по ладони со скидкой в этом месяце. Дополнительные — по ₪${p}.`,
    priceILS: p,
  }),
};

/**
 * Generate the appropriate gating message for a denied or paid feature.
 */
function getGatingMessage(promptKey: GatingPromptKey, priceILS: number): GatingMessage {
  return GATING_MESSAGES[promptKey](priceILS);
}

export const entitlements = {
  checkAccess,
  recordFeatureUse,
  getRemainingFreeUses,
  getGatingMessage,
};
