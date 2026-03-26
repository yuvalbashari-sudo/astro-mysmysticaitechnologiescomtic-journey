import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Simple admin key check — use a secret for production
  const adminKey = req.headers.get("x-admin-key");
  const expectedKey = Deno.env.get("ADMIN_ANALYTICS_KEY") || "astro-admin-2026";
  if (adminKey !== expectedKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "today";

    // Determine date filter
    const now = new Date();
    let dateFilter: string;
    if (range === "month") {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    } else if (range === "week") {
      const d = new Date(now); d.setDate(d.getDate() - 7);
      dateFilter = d.toISOString();
    } else {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    }

    // Fetch raw logs for the period
    const { data: logs, error } = await supabase
      .from("cost_logs")
      .select("*")
      .gte("created_at", dateFilter)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw error;

    // Aggregate in-memory
    const byFeature: Record<string, { count: number; success: number; blocked: number; failed: number; totalCost: number }> = {};
    const byUser: Record<string, { count: number; totalCost: number }> = {};
    const byDay: Record<string, number> = {};
    let totalCost = 0;
    let totalRequests = 0;

    for (const log of (logs || [])) {
      const f = log.feature;
      const cost = parseFloat(log.total_cost_estimate) || 0;
      totalCost += cost;
      totalRequests++;

      // By feature
      if (!byFeature[f]) byFeature[f] = { count: 0, success: 0, blocked: 0, failed: 0, totalCost: 0 };
      byFeature[f].count++;
      byFeature[f].totalCost += cost;
      if (log.status === "success") byFeature[f].success++;
      else if (log.status === "rate_limited" || log.status === "blocked") byFeature[f].blocked++;
      else byFeature[f].failed++;

      // By user
      const uid = log.user_identifier || log.client_ip || "anonymous";
      if (!byUser[uid]) byUser[uid] = { count: 0, totalCost: 0 };
      byUser[uid].count++;
      byUser[uid].totalCost += cost;

      // By day
      const day = log.created_at.slice(0, 10);
      byDay[day] = (byDay[day] || 0) + cost;
    }

    // Top users by cost
    const topByCost = Object.entries(byUser)
      .sort(([, a], [, b]) => b.totalCost - a.totalCost)
      .slice(0, 10)
      .map(([id, d]) => ({ id, ...d }));

    // Top users by volume
    const topByVolume = Object.entries(byUser)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([id, d]) => ({ id, ...d }));

    // Alerts
    const alerts: string[] = [];
    for (const [uid, d] of Object.entries(byUser)) {
      if (d.totalCost > 1.0) alerts.push(`High cost user: ${uid} ($${d.totalCost.toFixed(4)})`);
      if (d.count > 30) alerts.push(`High volume user: ${uid} (${d.count} requests)`);
    }
    if (totalCost > 25) alerts.push(`Daily cost warning: $${totalCost.toFixed(2)}`);

    return new Response(JSON.stringify({
      range,
      totalRequests,
      totalCost: +totalCost.toFixed(4),
      byFeature,
      byDay,
      topByCost,
      topByVolume,
      alerts,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
