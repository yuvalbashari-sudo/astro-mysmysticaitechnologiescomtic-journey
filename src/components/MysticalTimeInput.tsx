import { useState, useRef, useEffect, useCallback } from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  value: string; // HH:MM (24h) — internal format is always 24h
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** Convert 24h hour to 12h display */
function to12h(h24: number): { hour12: number; period: "AM" | "PM" } {
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  let hour12 = h24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, period };
}

/** Convert 12h back to 24h */
function to24h(hour12: number, period: "AM" | "PM"): number {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

const MysticalTimeInput = ({ value, onChange, className = "", style }: Props) => {
  const { language } = useLanguage();
  const is12h = language === "en";
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hours24 = value ? parseInt(value.split(":")[0] || "0", 10) : 0;
  const minutes = value ? parseInt(value.split(":")[1] || "0", 10) : 0;
  const { hour12, period } = to12h(hours24);

  const formatTime24 = (h: number, m: number) =>
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  /** Display value shown in the text input */
  const displayValue = !value
    ? ""
    : is12h
      ? `${hour12}:${String(minutes).padStart(2, "0")} ${period}`
      : value;

  const setHours24 = useCallback(
    (h: number) => {
      const wrapped = ((h % 24) + 24) % 24;
      onChange(formatTime24(wrapped, minutes));
    },
    [minutes, onChange]
  );

  const setMinutesVal = useCallback(
    (m: number) => {
      const wrapped = ((m % 60) + 60) % 60;
      onChange(formatTime24(hours24, wrapped));
    },
    [hours24, onChange]
  );

  /** Toggle AM/PM keeping the same hour12 */
  const togglePeriod = useCallback(() => {
    const newPeriod = period === "AM" ? "PM" : "AM";
    const newH24 = to24h(hour12, newPeriod);
    onChange(formatTime24(newH24, minutes));
  }, [hour12, period, minutes, onChange]);

  /** Increment/decrement in 12h mode — cycles 12,1,2…11 */
  const inc12hHour = useCallback(
    (delta: number) => {
      let next = hour12 + delta;
      if (next > 12) next = 1;
      if (next < 1) next = 12;
      onChange(formatTime24(to24h(next, period), minutes));
    },
    [hour12, period, minutes, onChange]
  );

  // Close picker on outside click
  useEffect(() => {
    if (!isPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isPickerOpen]);

  // Handle manual text input
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (is12h) {
        // Allow typing like "345PM" or "3:45 PM" or "1145AM"
        const raw = e.target.value.toUpperCase();
        const digits = raw.replace(/[^0-9]/g, "");
        const hasAM = raw.includes("A");
        const hasPM = raw.includes("P");

        if (digits.length >= 3) {
          let h: number, m: number;
          if (digits.length === 3) {
            h = parseInt(digits[0], 10);
            m = parseInt(digits.slice(1, 3), 10);
          } else {
            h = parseInt(digits.slice(0, 2), 10);
            m = parseInt(digits.slice(2, 4), 10);
          }
          if (h >= 1 && h <= 12 && m >= 0 && m <= 59) {
            const p: "AM" | "PM" = hasPM ? "PM" : hasAM ? "AM" : period;
            onChange(formatTime24(to24h(h, p), m));
            return;
          }
        }
        if (raw === "") onChange("");
      } else {
        // 24h mode — existing logic
        let digits = e.target.value.replace(/[^0-9]/g, "");
        if (digits.length > 4) digits = digits.slice(0, 4);

        if (digits.length === 4) {
          const h = parseInt(digits.slice(0, 2), 10);
          const m = parseInt(digits.slice(2, 4), 10);
          if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
            onChange(formatTime24(h, m));
            return;
          }
        }
        if (e.target.value === "") onChange("");
      }
    },
    [onChange, is12h, period]
  );

  const spinnerBtnClass =
    "flex items-center justify-center w-10 h-8 rounded-lg transition-colors hover:bg-gold/10 active:bg-gold/20 text-gold/60 hover:text-gold";

  const amPmBtnClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg font-body text-sm font-bold transition-all duration-200 ${
      active
        ? "text-gold"
        : "text-gold/30 hover:text-gold/60"
    }`;

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        inputMode={is12h ? "text" : "numeric"}
        value={displayValue}
        onChange={handleTextChange}
        placeholder={is12h ? "3:45 PM" : "HH:MM"}
        className={`mystical-input font-body text-center w-full ${className}`}
        style={{ direction: "ltr", paddingRight: 36, ...style }}
        autoComplete="off"
        onFocus={() => setIsPickerOpen(true)}
      />
      <button
        type="button"
        onClick={() => setIsPickerOpen(!isPickerOpen)}
        className="absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors"
        style={{ right: 6, color: "hsl(var(--gold) / 0.5)" }}
        aria-label="Open time picker"
        tabIndex={-1}
      >
        <Clock className="w-4 h-4" />
      </button>

      {/* Helper text for English */}
      {is12h && !value && (
        <p
          className="font-body text-xs mt-1"
          style={{ color: "hsl(var(--gold) / 0.35)", textAlign: "center" }}
        >
          Example: 3:45 PM
        </p>
      )}

      {/* Custom time spinner */}
      {isPickerOpen && (
        <div
          className="absolute z-50 mt-2 rounded-xl border shadow-2xl p-4 flex items-center gap-3 justify-center"
          style={{
            background: "hsl(var(--deep-space))",
            borderColor: "hsl(var(--gold) / 0.2)",
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: is12h ? 260 : 200,
            direction: "ltr"
          }}
        >
          {/* Hours */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              className={spinnerBtnClass}
              onClick={() => (is12h ? inc12hHour(1) : setHours24(hours24 + 1))}
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <span
              className="font-body text-2xl font-bold tabular-nums"
              style={{ color: "hsl(var(--gold))", minWidth: 40, textAlign: "center" }}
            >
              {is12h
                ? String(hour12).padStart(2, "0")
                : String(hours24).padStart(2, "0")}
            </span>
            <button
              type="button"
              className={spinnerBtnClass}
              onClick={() => (is12h ? inc12hHour(-1) : setHours24(hours24 - 1))}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <span className="font-body text-2xl font-bold" style={{ color: "hsl(var(--gold) / 0.5)" }}>
            :
          </span>

          {/* Minutes */}
          <div className="flex flex-col items-center gap-1">
            <button type="button" className={spinnerBtnClass} onClick={() => setMinutesVal(minutes + 5)}>
              <ChevronUp className="w-5 h-5" />
            </button>
            <span
              className="font-body text-2xl font-bold tabular-nums"
              style={{ color: "hsl(var(--gold))", minWidth: 40, textAlign: "center" }}
            >
              {String(minutes).padStart(2, "0")}
            </span>
            <button type="button" className={spinnerBtnClass} onClick={() => setMinutesVal(minutes - 5)}>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* AM/PM toggle — English only */}
          {is12h && (
            <div
              className="flex flex-col items-center gap-1 rounded-xl ml-1"
              style={{
                background: "hsl(var(--gold) / 0.06)",
                padding: "4px",
              }}
            >
              <button
                type="button"
                className={amPmBtnClass(period === "AM")}
                onClick={() => period !== "AM" && togglePeriod()}
                style={
                  period === "AM"
                    ? { background: "hsl(var(--gold) / 0.15)", boxShadow: "0 0 8px hsl(var(--gold) / 0.1)" }
                    : {}
                }
              >
                AM
              </button>
              <button
                type="button"
                className={amPmBtnClass(period === "PM")}
                onClick={() => period !== "PM" && togglePeriod()}
                style={
                  period === "PM"
                    ? { background: "hsl(var(--gold) / 0.15)", boxShadow: "0 0 8px hsl(var(--gold) / 0.1)" }
                    : {}
                }
              >
                PM
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MysticalTimeInput;
