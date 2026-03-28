import { useState, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";
import type { ResetCycle } from "@/lib/pricingConfig";
import { useT } from "@/i18n/LanguageContext";

interface Props {
  resetCycle: ResetCycle;
  className?: string;
}

function getTimeUntilReset(cycle: ResetCycle): { hours: number; minutes: number; seconds: number; totalMs: number } {
  const now = new Date();

  if (cycle === "daily") {
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const totalMs = midnight.getTime() - now.getTime();
    return {
      hours: Math.floor(totalMs / 3_600_000),
      minutes: Math.floor((totalMs % 3_600_000) / 60_000),
      seconds: Math.floor((totalMs % 60_000) / 1_000),
      totalMs,
    };
  }

  if (cycle === "monthly") {
    // Reset on 1st of next month (or subscription day — simplified to calendar month)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    const totalMs = nextMonth.getTime() - now.getTime();
    const days = Math.floor(totalMs / 86_400_000);
    const hours = Math.floor((totalMs % 86_400_000) / 3_600_000);
    const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
    const seconds = Math.floor((totalMs % 60_000) / 1_000);
    return { hours: days * 24 + hours, minutes, seconds, totalMs };
  }

  return { hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
}

function formatCountdown(cycle: ResetCycle, hours: number, minutes: number, seconds: number, t: ReturnType<typeof useT>): string {
  if (cycle === "daily") {
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return t.gating_resets_in.replace("{time}", `${hh}:${mm}:${ss}`);
  }

  if (cycle === "monthly") {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days > 0) {
      return t.gating_resets_in_days.replace("{days}", String(days)).replace("{hours}", String(remainingHours));
    }
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return t.gating_resets_in.replace("{time}", `${hh}:${mm}`);
  }

  return "";
}

const UsageCountdown = ({ resetCycle, className = "" }: Props) => {
  const t = useT();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (resetCycle === "none") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [resetCycle]);

  const { hours, minutes, seconds } = useMemo(
    () => getTimeUntilReset(resetCycle),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetCycle, now]
  );

  if (resetCycle === "none") return null;

  const text = formatCountdown(resetCycle, hours, minutes, seconds, t);

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Clock className="w-3.5 h-3.5 text-gold/50" />
      <span
        className="font-body text-xs tracking-wide"
        style={{ color: "hsl(var(--gold) / 0.55)" }}
      >
        {text}
      </span>
    </div>
  );
};

export default UsageCountdown;
