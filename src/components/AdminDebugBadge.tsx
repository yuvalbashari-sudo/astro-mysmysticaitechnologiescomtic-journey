import { useState, useEffect } from "react";
import { Shield, ShieldOff } from "lucide-react";
import { subscriptionManager } from "@/lib/subscriptionManager";

/**
 * ADMIN MODE indicator + preview toggle.
 * - For authenticated admins: shows a static badge.
 * - In preview/dev mode without auth: shows a clickable toggle to enable admin override.
 */
const AdminDebugBadge = () => {
  const [isAdmin, setIsAdmin] = useState(subscriptionManager.isAdmin());
  const [isOverride, setIsOverride] = useState(subscriptionManager.isAdminOverride());

  const isPreview =
    window.location.hostname.includes("preview") ||
    window.location.hostname.includes("lovableproject.com") ||
    window.location.hostname === "localhost" ||
    import.meta.env.DEV;

  useEffect(() => {
    const sync = () => {
      setIsAdmin(subscriptionManager.isAdmin());
      setIsOverride(subscriptionManager.isAdminOverride());
    };
    sync();
    const unsubscribe = subscriptionManager.onAuthChange(sync);
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    if (isOverride) {
      subscriptionManager.disableAdminOverride();
    } else {
      subscriptionManager.enableAdminOverride();
    }
  };

  // In preview mode, always show (either as active badge or toggle button)
  if (isPreview && !isAdmin) {
    return (
      <button
        onClick={handleToggle}
        className="fixed top-3 left-3 z-[99999] flex items-center gap-1.5 px-3 py-1.5 rounded-full select-none transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, hsl(0 0% 50% / 0.12), hsl(0 0% 50% / 0.05))",
          border: "1px solid hsl(0 0% 50% / 0.2)",
          backdropFilter: "blur(10px)",
          cursor: "pointer",
        }}
        title="Enable Admin Test Mode"
      >
        <ShieldOff className="w-3 h-3 text-foreground/40" />
        <span className="text-foreground/40 text-[10px] font-heading tracking-[0.12em] uppercase leading-none">
          Enable Admin
        </span>
      </button>
    );
  }

  if (!isAdmin) return null;

  return (
    <div
      className="fixed top-3 left-3 z-[99999] flex items-center gap-1.5 rounded-full select-none"
      style={{
        background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.05))",
        border: "1px solid hsl(var(--gold) / 0.25)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 2px 10px hsl(var(--gold) / 0.08)",
      }}
    >
      <div className="flex items-center gap-1.5 px-3 py-1.5 pointer-events-none">
        <Shield className="w-3 h-3 text-gold/70" />
        <span className="text-gold/70 text-[10px] font-heading tracking-[0.15em] uppercase leading-none">
          Admin Mode
        </span>
      </div>
      {/* Show disable button only for override (not real auth admin) */}
      {isOverride && (
        <button
          onClick={handleToggle}
          className="pr-2.5 text-gold/40 hover:text-gold/70 transition-colors text-[10px] font-heading"
          title="Disable Admin Override"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default AdminDebugBadge;
