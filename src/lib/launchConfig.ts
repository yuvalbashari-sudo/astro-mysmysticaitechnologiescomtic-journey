/**
 * Launch Access Configuration
 * 
 * During launch period, all features are free.
 * To convert features to paid, set isLaunchPeriod to false
 * and configure individual feature access levels.
 */

export const LAUNCH_CONFIG = {
  isLaunchPeriod: true,
  launchEndDate: "2026-04-07", // One month from launch

  features: {
    zodiacAnalysis: { free: true, futurePremium: false },
    risingSign: { free: true, futurePremium: true },
    compatibility: { free: true, futurePremium: true },
    tarotReading: { free: true, futurePremium: false },
    palmReading: { free: true, futurePremium: true },
    monthlyForecast: { free: true, futurePremium: false },
    fullMysticalReading: { free: true, futurePremium: true },
  },
} as const;

export type FeatureKey = keyof typeof LAUNCH_CONFIG.features;

/**
 * Check if a feature is currently accessible for free
 */
export function isFeatureFree(feature: FeatureKey): boolean {
  if (LAUNCH_CONFIG.isLaunchPeriod) return true;
  return LAUNCH_CONFIG.features[feature].free;
}

/**
 * Check if we're still in the launch period
 */
export function isInLaunchPeriod(): boolean {
  if (!LAUNCH_CONFIG.isLaunchPeriod) return false;
  const now = new Date();
  const end = new Date(LAUNCH_CONFIG.launchEndDate);
  return now <= end;
}

/**
 * Get days remaining in launch period
 */
export function getLaunchDaysRemaining(): number {
  const now = new Date();
  const end = new Date(LAUNCH_CONFIG.launchEndDate);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
