import { useState, useEffect, useCallback } from "react";
import { entitlements } from "@/lib/entitlements";
import type { FeatureKey } from "@/lib/pricingConfig";

interface Props {
  feature: FeatureKey;
  className?: string;
}

// Global event emitter for usage changes
const listeners = new Set<() => void>();
export function notifyUsageChanged() {
  // Use setTimeout to ensure localStorage write has completed before reading
  setTimeout(() => {
    listeners.forEach((fn) => fn());
  }, 0);
}

const RemainingReadingsBadge = ({ feature, className = "" }: Props) => {
  const [remaining, setRemaining] = useState(() =>
    entitlements.getRemainingFreeUses(feature)
  );

  const refresh = useCallback(() => {
    const val = entitlements.getRemainingFreeUses(feature);
    setRemaining(prev => prev === val ? prev : val);
  }, [feature]);

  useEffect(() => {
    listeners.add(refresh);
    // Poll every 1s for safety (handles external usage changes)
    const interval = setInterval(refresh, 1000);
    // Also refresh on visibility change (returning from modal/tab)
    const onVisChange = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVisChange);
    // Listen for storage events (cross-tab sync)
    const onStorage = (e: StorageEvent) => { if (e.key === "astrologai_usage" || e.key === "astrologai_user_plan") refresh(); };
    window.addEventListener("storage", onStorage);
    // Refresh immediately on mount
    refresh();
    return () => {
      listeners.delete(refresh);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  // Don't show badge if unlimited or no free tier
  if (remaining === Infinity || remaining === undefined) return null;

  const isExhausted = remaining === 0;

  return (
    <span
      className={`inline-flex items-center justify-center font-body text-[10px] font-bold leading-none rounded-full min-w-[18px] h-[18px] px-1.5 ${className}`}
      style={{
        background: isExhausted
          ? "hsl(var(--gold) / 0.15)"
          : "hsl(var(--gold) / 0.12)",
        color: isExhausted
          ? "hsl(var(--gold) / 0.5)"
          : "hsl(var(--gold) / 0.85)",
        border: `1px solid ${isExhausted ? "hsl(var(--gold) / 0.15)" : "hsl(var(--gold) / 0.25)"}`,
        boxShadow: isExhausted ? "none" : "0 0 8px hsl(var(--gold) / 0.08)",
      }}
    >
      {remaining}
    </span>
  );
};

export default RemainingReadingsBadge;
