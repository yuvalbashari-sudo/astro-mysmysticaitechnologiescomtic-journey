import { entitlements } from "@/lib/entitlements";
import type { FeatureKey } from "@/lib/pricingConfig";
import { useT } from "@/i18n/LanguageContext";

interface Props {
  feature: FeatureKey;
  className?: string;
}

const RemainingReadingsBadge = ({ feature, className = "" }: Props) => {
  const t = useT();
  const remaining = entitlements.getRemainingFreeUses(feature, "free");

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
