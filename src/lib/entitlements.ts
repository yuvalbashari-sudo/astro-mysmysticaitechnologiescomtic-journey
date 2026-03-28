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
 */
function checkAccess(feature: FeatureKey, tier: UserTier): AccessResult {
  const rule = FEATURE_RULES[tier][feature];

  // Always-free features
  if (rule.freeUses === Infinity) {
    return { allowed: true, isFree: true, limitedDepth: rule.limitedDepth };
  }

  // Special palm reading logic for subscribers
  if (feature === "palm_reading" && tier === "subscriber") {
    const monthlyPalmUsage = usageTracker.getMonthlyPalmUsage();
    if (monthlyPalmUsage < SUBSCRIBER_PALM_DISCOUNTED_LIMIT) {
      return { allowed: true, isFree: false, priceILS: SUBSCRIBER_PALM_DISCOUNT_PRICE };
    }
    return { allowed: true, isFree: false, priceILS: SUBSCRIBER_PALM_FULL_PRICE };
  }

  // Palm reading for free users — always paid
  if (feature === "palm_reading" && tier === "free") {
    return { allowed: true, isFree: false, priceILS: rule.payPerUsePrice };
  }

  // Check usage quota
  const used = usageTracker.getUsageCount(feature, rule.resetCycle);

  if (used < rule.freeUses) {
    return { allowed: true, isFree: true, limitedDepth: rule.limitedDepth };
  }

  // Quota exhausted — pay-per-use
  const promptKey = getPromptKey(feature, tier);
  return { allowed: false, priceILS: rule.payPerUsePrice, promptKey, resetCycle: rule.resetCycle };
}

function getPromptKey(feature: FeatureKey, tier: UserTier): GatingPromptKey {
  switch (feature) {
    case "tarot_reading":
      return tier === "free" ? "tarot_free_exhausted" : "tarot_sub_exhausted";
    case "compatibility_reading":
      return tier === "free" ? "compatibility_free_exhausted" : "compatibility_sub_exhausted";
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
 */
function recordFeatureUse(feature: FeatureKey, tier: UserTier): void {
  const rule = FEATURE_RULES[tier][feature];
  usageTracker.recordUsage(feature, rule.resetCycle);
}

/**
 * Get remaining free uses for a feature.
 */
function getRemainingFreeUses(feature: FeatureKey, tier: UserTier): number {
  const rule = FEATURE_RULES[tier][feature];
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
    he: `השתמשת ב-3 קריאות הטארוט הכלולות להיום. קריאות נוספות ב-${p} ₪ כל אחת.`,
    en: `You've used your 3 included tarot readings for today. Additional readings are ₪${p} each.`,
    ar: `لقد استخدمت 3 قراءات تارو المضمنة لليوم. قراءات إضافية بسعر ${p} ₪ لكل واحدة.`,
    ru: `Вы использовали 3 включённых чтения Таро на сегодня. Дополнительные — по ₪${p}.`,
    priceILS: p,
  }),
  compatibility_free_exhausted: (p) => ({
    he: `סיכום ההתאמה החינמי שלך זמין. פתח קריאת התאמה מלאה ומעמיקה תמורת ${p} ₪.`,
    en: `Your free compatibility summary is available. Unlock the full in-depth compatibility reading for ₪${p}.`,
    ar: `ملخص التوافق المجاني متاح. افتح قراءة التوافق الكاملة مقابل ${p} ₪.`,
    ru: `Ваш бесплатный обзор совместимости доступен. Разблокируйте полное чтение за ₪${p}.`,
    priceILS: p,
  }),
  compatibility_sub_exhausted: (p) => ({
    he: `השתמשת ב-5 קריאות ההתאמה הכלולות החודש. קריאות נוספות ב-${p} ₪ כל אחת.`,
    en: `You've used your 5 included compatibility readings this month. Additional readings are ₪${p} each.`,
    ar: `لقد استخدمت 5 قراءات التوافق المضمنة هذا الشهر. قراءات إضافية بسعر ${p} ₪ لكل واحدة.`,
    ru: `Вы использовали 5 включённых чтений совместимости в этом месяце. Дополнительные — по ₪${p}.`,
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
