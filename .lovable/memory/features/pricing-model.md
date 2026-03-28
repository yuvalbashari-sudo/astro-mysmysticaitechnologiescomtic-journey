Business model: hybrid free+subscription+pay-per-use.

Tiers: admin, free, pro, vip.
- Admin: unlimited access, bypasses all limits (internal only).
- Free: daily card (always free), horoscope (always free), 1 tarot/day (then ₪9), 2 compat/day (then ₪9), palm ₪29.
- Pro (₪39/mo or ₪29/mo yearly): 3 tarot/day (then ₪5), 5 full compat/month (then ₪7), palm ₪9 (3/month, then ₪29).
- VIP (₪69/mo or ₪49/mo yearly): 10 tarot/day (then ₪3), unlimited compat, palm 3 free/month (then ₪9).

Key files:
- src/lib/pricingConfig.ts — all constants, tiers, feature rules
- src/lib/subscriptionManager.ts — localStorage-based plan state (getCurrentTier, setPlan, isAdmin)
- src/lib/usageTracker.ts — localStorage daily/monthly usage tracking with auto-reset
- src/lib/entitlements.ts — access checks auto-resolve tier via subscriptionManager; price computation, gating prompts
- src/pages/PremiumUpgrade.tsx — upgrade screen (Free + Pro plans shown)
- src/components/PaymentGatingModal.tsx — modal shown when quota is exhausted
- src/components/RemainingReadingsBadge.tsx — remaining uses badge, auto-resolves tier

Daily resets at midnight local time. Monthly resets on subscription billing date.
No live billing connected yet — upgrade CTAs show placeholder toast.
