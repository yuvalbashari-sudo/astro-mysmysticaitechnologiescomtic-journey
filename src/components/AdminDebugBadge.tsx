import { useState, useEffect } from "react";
import { Shield, ShieldOff } from "lucide-react";
import { subscriptionManager } from "@/lib/subscriptionManager";
import { logAdminDebugState } from "@/lib/adminTestMode";
import { usageTracker } from "@/lib/usageTracker";

const IS_PREVIEW =
  window.location.hostname.includes("preview") ||
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname === "localhost" ||
  import.meta.env.DEV;

/**
 * ADMIN TEST MODE toggle + indicator.
 * In preview/dev: shows a clickable toggle that enables real admin bypass.
 * Toggling forces a page reload so ALL components pick up the new state.
 */
const AdminDebugBadge = () => {
  const [isAdmin, setIsAdmin] = useState(subscriptionManager.isAdmin());
  const [isOverride, setIsOverride] = useState(subscriptionManager.isAdminOverride());

  useEffect(() => {
    const sync = () => {
      setIsAdmin(subscriptionManager.isAdmin());
      setIsOverride(subscriptionManager.isAdminOverride());
    };
    sync();
    const unsubscribe = subscriptionManager.onAuthChange(sync);
    return unsubscribe;
  }, []);

  // Log debug state on mount and when state changes
  useEffect(() => {
    if (IS_PREVIEW) {
      logAdminDebugState();
    }
  }, [isAdmin, isOverride]);

  const handleEnable = () => {
    subscriptionManager.enableAdminOverride();
    // Force full page reload so every component re-initializes with admin state
    window.location.reload();
  };

  const handleDisable = () => {
    subscriptionManager.disableAdminOverride();
    window.location.reload();
  };

  // Not preview and not admin — hide completely
  if (!IS_PREVIEW && !isAdmin) return null;

  // ACTIVE admin mode (either real auth or override)
  if (isAdmin) {
    return (
      <div
        className="fixed top-3 left-3 z-[99999] flex flex-col gap-1 select-none"
        style={{ maxWidth: 220 }}
      >
        {/* Main badge */}
        <div
          className="flex items-center gap-1.5 rounded-full"
          style={{
            background: "linear-gradient(135deg, hsl(var(--gold) / 0.18), hsl(var(--gold) / 0.06))",
            border: "1px solid hsl(var(--gold) / 0.3)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 2px 12px hsl(var(--gold) / 0.12)",
          }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 pointer-events-none">
            <Shield className="w-3.5 h-3.5 text-gold" />
            <span className="text-gold text-[10px] font-heading tracking-[0.15em] uppercase leading-none font-semibold">
              Admin Test Mode Active
            </span>
          </div>
          {isOverride && (
            <button
              onClick={handleDisable}
              className="pr-2.5 text-gold/50 hover:text-gold transition-colors text-xs font-heading cursor-pointer"
              title="Disable Admin Test Mode"
            >
              ✕
            </button>
          )}
        </div>

        {/* Debug line — preview only */}
        {IS_PREVIEW && (
          <div
            className="text-[8px] font-mono text-foreground/30 px-2 leading-tight pointer-events-none"
          >
            override: {isOverride ? "ON" : "off"} | tier: {subscriptionManager.getCurrentTier()} | bypass: active
            <br />
            lang: {document.documentElement.lang} | dir: {document.documentElement.dir}
            <br />
            tarot: {usageTracker.getUsageCount("tarot_reading", "daily")}/day | compat: {usageTracker.getUsageCount("compatibility_reading", "daily")}/day
          </div>
        )}
      </div>
    );
  }

  // Preview mode, NOT admin — show enable button
  if (IS_PREVIEW) {
    return (
      <div className="fixed top-3 left-3 z-[99999] flex flex-col gap-1 select-none" style={{ maxWidth: 220 }}>
        <button
          onClick={handleEnable}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          style={{
            background: "linear-gradient(135deg, hsl(0 0% 50% / 0.15), hsl(0 0% 50% / 0.05))",
            border: "1px solid hsl(0 0% 50% / 0.25)",
            backdropFilter: "blur(10px)",
          }}
          title="Enable Admin Test Mode for preview testing"
        >
          <ShieldOff className="w-3.5 h-3.5 text-foreground/40" />
          <span className="text-foreground/50 text-[10px] font-heading tracking-[0.12em] uppercase leading-none">
            Admin Test Mode Off
          </span>
        </button>

        <div className="text-[8px] font-mono text-foreground/20 px-2 leading-tight pointer-events-none">
          override: off | tier: {subscriptionManager.getCurrentTier()} | bypass: inactive
        </div>
      </div>
    );
  }

  return null;
};

export default AdminDebugBadge;
