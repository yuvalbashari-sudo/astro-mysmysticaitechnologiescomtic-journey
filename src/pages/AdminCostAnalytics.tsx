import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, AlertTriangle, DollarSign, Users, Activity, Shield, TrendingUp, Loader2 } from "lucide-react";

interface AnalyticsData {
  range: string;
  totalRequests: number;
  totalCost: number;
  byFeature: Record<string, { count: number; success: number; blocked: number; failed: number; totalCost: number }>;
  byDay: Record<string, number>;
  topByCost: { id: string; count: number; totalCost: number }[];
  topByVolume: { id: string; count: number; totalCost: number }[];
  alerts: string[];
}

const ADMIN_KEY_STORAGE = "astro_admin_key";

const AdminCostAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<"today" | "week" | "month">("today");
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem(ADMIN_KEY_STORAGE) || "");
  const [authenticated, setAuthenticated] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cost-analytics?range=${range}`;
      const resp = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      if (resp.status === 401) { setError("Unauthorized"); setAuthenticated(false); return; }
      if (!resp.ok) throw new Error("Failed to fetch");
      const result = await resp.json();
      setData(result);
      setAuthenticated(true);
      localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (authenticated) fetchData(); }, [range]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-2xl p-8"
          style={{ background: "hsl(222 47% 8%)", border: "1px solid hsl(var(--gold) / 0.15)" }}
        >
          <Shield className="w-10 h-10 mx-auto mb-4" style={{ color: "hsl(var(--gold))" }} />
          <h1 className="text-xl font-heading text-center mb-6" style={{ color: "hsl(var(--gold))" }}>Admin Access</h1>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin key"
            className="w-full rounded-lg px-4 py-3 mb-4 font-body text-sm"
            style={{ background: "hsl(var(--foreground) / 0.05)", border: "1px solid hsl(var(--foreground) / 0.1)", color: "hsl(var(--foreground))" }}
            onKeyDown={(e) => e.key === "Enter" && fetchData()}
          />
          {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}
          <button onClick={fetchData} disabled={loading} className="w-full py-3 rounded-lg font-body text-sm" style={{ background: "hsl(var(--gold) / 0.15)", border: "1px solid hsl(var(--gold) / 0.3)", color: "hsl(var(--gold))" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Enter"}
          </button>
        </motion.div>
      </div>
    );
  }

  const featureNames: Record<string, string> = {
    palm: "Palm Reading", tarotSpread: "Tarot Reading", compatibility: "Compatibility",
    forecast: "Horoscope", rising: "Rising Sign", birthChart: "Birth Chart", dailyCard: "Daily Card",
    advisor: "Mystical Advisor",
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "hsl(222 47% 6%)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" style={{ color: "hsl(var(--gold))" }} />
            <h1 className="text-2xl font-heading" style={{ color: "hsl(var(--gold))" }}>Cost Analytics</h1>
          </div>
          <div className="flex gap-2">
            {(["today", "week", "month"] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className="px-4 py-2 rounded-lg text-xs font-body transition-all"
                style={{
                  background: range === r ? "hsl(var(--gold) / 0.2)" : "hsl(var(--foreground) / 0.05)",
                  border: `1px solid ${range === r ? "hsl(var(--gold) / 0.4)" : "hsl(var(--foreground) / 0.1)"}`,
                  color: range === r ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.5)",
                }}>
                {r === "today" ? "Today" : r === "week" ? "7 Days" : "Month"}
              </button>
            ))}
            <button onClick={fetchData} className="px-4 py-2 rounded-lg text-xs font-body" style={{ background: "hsl(var(--foreground) / 0.05)", border: "1px solid hsl(var(--foreground) / 0.1)", color: "hsl(var(--foreground) / 0.5)" }}>
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh"}
            </button>
          </div>
        </div>

        {!data ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(var(--gold) / 0.4)" }} />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Cost", value: `$${data.totalCost.toFixed(4)}`, icon: DollarSign, color: "142 70% 50%" },
                { label: "Requests", value: data.totalRequests.toString(), icon: Activity, color: "200 70% 50%" },
                { label: "Unique Users", value: data.topByVolume.length.toString(), icon: Users, color: "270 60% 50%" },
                { label: "Alerts", value: data.alerts.length.toString(), icon: AlertTriangle, color: data.alerts.length > 0 ? "0 70% 50%" : "142 70% 50%" },
              ].map((card) => (
                <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-5" style={{ background: "hsl(222 40% 10%)", border: "1px solid hsl(var(--foreground) / 0.06)" }}>
                  <card.icon className="w-4 h-4 mb-2" style={{ color: `hsl(${card.color})` }} />
                  <p className="text-2xl font-heading" style={{ color: "hsl(var(--foreground) / 0.9)" }}>{card.value}</p>
                  <p className="text-xs font-body mt-1" style={{ color: "hsl(var(--foreground) / 0.4)" }}>{card.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Alerts */}
            {data.alerts.length > 0 && (
              <div className="rounded-xl p-5 mb-8" style={{ background: "hsl(0 50% 15% / 0.3)", border: "1px solid hsl(0 50% 40% / 0.3)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <h3 className="font-heading text-sm text-red-400">Alerts</h3>
                </div>
                {data.alerts.map((a, i) => (
                  <p key={i} className="text-xs font-body text-red-300/70 mb-1">• {a}</p>
                ))}
              </div>
            )}

            {/* By Feature */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="rounded-xl p-6" style={{ background: "hsl(222 40% 10%)", border: "1px solid hsl(var(--foreground) / 0.06)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4" style={{ color: "hsl(var(--gold))" }} />
                  <h3 className="font-heading text-sm" style={{ color: "hsl(var(--gold))" }}>Cost by Feature</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(data.byFeature).sort(([, a], [, b]) => b.totalCost - a.totalCost).map(([f, d]) => (
                    <div key={f} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-body" style={{ color: "hsl(var(--foreground) / 0.8)" }}>{featureNames[f] || f}</p>
                        <p className="text-[10px] font-body" style={{ color: "hsl(var(--foreground) / 0.35)" }}>
                          {d.count} reqs • {d.success} ok • {d.blocked} blocked • {d.failed} fail
                        </p>
                      </div>
                      <p className="text-sm font-heading" style={{ color: "hsl(142 70% 50%)" }}>${d.totalCost.toFixed(4)}</p>
                    </div>
                  ))}
                  {Object.keys(data.byFeature).length === 0 && (
                    <p className="text-xs" style={{ color: "hsl(var(--foreground) / 0.3)" }}>No data yet</p>
                  )}
                </div>
              </div>

              {/* Top users by cost */}
              <div className="rounded-xl p-6" style={{ background: "hsl(222 40% 10%)", border: "1px solid hsl(var(--foreground) / 0.06)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4" style={{ color: "hsl(var(--gold))" }} />
                  <h3 className="font-heading text-sm" style={{ color: "hsl(var(--gold))" }}>Top Users by Cost</h3>
                </div>
                <div className="space-y-3">
                  {data.topByCost.map((u, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-body truncate max-w-[200px]" style={{ color: "hsl(var(--foreground) / 0.7)" }}>{u.id}</p>
                        <p className="text-[10px] font-body" style={{ color: "hsl(var(--foreground) / 0.35)" }}>{u.count} requests</p>
                      </div>
                      <p className="text-sm font-heading" style={{ color: "hsl(142 70% 50%)" }}>${u.totalCost.toFixed(4)}</p>
                    </div>
                  ))}
                  {data.topByCost.length === 0 && (
                    <p className="text-xs" style={{ color: "hsl(var(--foreground) / 0.3)" }}>No data yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Daily cost chart (simple text-based) */}
            {Object.keys(data.byDay).length > 0 && (
              <div className="rounded-xl p-6" style={{ background: "hsl(222 40% 10%)", border: "1px solid hsl(var(--foreground) / 0.06)" }}>
                <h3 className="font-heading text-sm mb-4" style={{ color: "hsl(var(--gold))" }}>Daily Cost Breakdown</h3>
                <div className="space-y-2">
                  {Object.entries(data.byDay).sort(([a], [b]) => a.localeCompare(b)).map(([day, cost]) => {
                    const maxCost = Math.max(...Object.values(data.byDay));
                    const pct = maxCost > 0 ? (cost / maxCost) * 100 : 0;
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-[10px] font-body w-20 shrink-0" style={{ color: "hsl(var(--foreground) / 0.4)" }}>{day}</span>
                        <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "hsl(var(--foreground) / 0.04)" }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 2)}%`, background: "linear-gradient(90deg, hsl(142 70% 40% / 0.6), hsl(142 70% 50% / 0.3))" }} />
                        </div>
                        <span className="text-xs font-heading w-16 text-right" style={{ color: "hsl(142 70% 50%)" }}>${cost.toFixed(4)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCostAnalytics;
