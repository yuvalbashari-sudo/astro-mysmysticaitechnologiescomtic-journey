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
  listeners.forEach((fn) => fn());
}

const RemainingReadingsBadge = ({ feature, className = "" }: Props) => {
  const [remaining, setRemaining] = useState(() =>
    entitlements.getRemainingFreeUses(feature, "free")
  );

  const refresh = useCallback(() => {
    setRemaining(entitlements.getRemainingFreeUses(feature, "free"));
  }, [feature]);

  useEffect(() => {
    listeners.add(refresh);
    // Also poll every 2s for safety (handles external usage changes)
    const interval = setInterval(refresh, 2000);
    return () => {
      listeners.delete(refresh);
      clearInterval(interval);
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
