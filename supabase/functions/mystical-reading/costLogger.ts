/**
 * Cost logging helper for edge functions.
 * Logs request cost estimates to the cost_logs table using service_role.
 */

interface CostLogEntry {
  clientIp: string;
  userIdentifier?: string;
  feature: string;
  status: "success" | "blocked" | "failed" | "rate_limited";
  userTier: string;
  aiCost: number;
  imageCost: number;
  model?: string;
  metadata?: Record<string, unknown>;
}

// Cost profiles — mirror of src/lib/costConfig.ts for edge runtime
const COST_PROFILES: Record<string, { aiCost: number; imageCost: number }> = {
  palm:          { aiCost: 0.025, imageCost: 0.015 },
  tarotSpread:   { aiCost: 0.008, imageCost: 0 },
  compatibility: { aiCost: 0.012, imageCost: 0 },
  forecast:      { aiCost: 0.008, imageCost: 0 },
  rising:        { aiCost: 0.008, imageCost: 0 },
  birthChart:    { aiCost: 0.010, imageCost: 0 },
  dailyCard:     { aiCost: 0.005, imageCost: 0 },
};

export function getFeatureCosts(feature: string) {
  return COST_PROFILES[feature] || { aiCost: 0.008, imageCost: 0 };
}

export async function logCost(entry: CostLogEntry): Promise<void> {
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const total = entry.aiCost + entry.imageCost;

    await supabase.from("cost_logs").insert({
      client_ip: entry.clientIp,
      user_identifier: entry.userIdentifier || null,
      feature: entry.feature,
      status: entry.status,
      user_tier: entry.userTier,
      ai_cost_estimate: entry.aiCost,
      image_cost_estimate: entry.imageCost,
      total_cost_estimate: total,
      model_used: entry.model || null,
      metadata: entry.metadata || {},
    });
  } catch (e) {
    console.error("Cost logging failed (non-blocking):", e);
  }
}
