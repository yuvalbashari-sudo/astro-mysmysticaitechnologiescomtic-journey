import { expect, it, vi } from "vitest";
import { entitlements } from "./entitlements";
import { usageTracker } from "./usageTracker";
import type { FeatureKey } from "./pricingConfig";

vi.mock("./subscriptionManager", () => ({ subscriptionManager: { getCurrentTier: () => "free" } }));

it("opens every reading at full depth for a guest during launch, including after prior usage", () => {
  const track = vi.spyOn(usageTracker, "recordUsage");
  const features: FeatureKey[] = ["tarot_reading", "compatibility_reading", "palm_reading", "daily_card", "monthly_horoscope"];
  for (const feature of features) {
    for (let i = 0; i < 4; i++) entitlements.recordFeatureUse(feature);
    expect(entitlements.checkAccess(feature)).toEqual({ allowed: true, isFree: true, limitedDepth: false });
    expect(entitlements.getRemainingFreeUses(feature)).toBe(Infinity);
  }
  expect(track).not.toHaveBeenCalled();
  track.mockRestore();
});
