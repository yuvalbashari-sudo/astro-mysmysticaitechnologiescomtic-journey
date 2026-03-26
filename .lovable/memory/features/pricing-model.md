Business model: hybrid free+subscription+pay-per-use. Monthly ₪39, yearly ₪29/mo.

Free: daily card (always free), horoscope (always free), 1 tarot/day (then ₪9), 1 short compat/month (full ₪9), palm ₪29.
Subscriber: 3 tarot/day (then ₪5), 5 full compat/month (then ₪7), palm ₪9 (3/month, then ₪29).

Key files:
- src/lib/pricingConfig.ts — all constants, tiers, feature rules
- src/lib/usageTracker.ts — localStorage daily/monthly usage tracking with auto-reset
- src/lib/entitlements.ts — access checks, price computation, gating prompts (he/en)
- src/pages/PremiumUpgrade.tsx — 2-plan upgrade screen (Free + Premium)

Daily resets at midnight local time. Monthly resets on subscription billing date.
VIP tier removed — only Free and Subscriber (Premium) tiers exist.
