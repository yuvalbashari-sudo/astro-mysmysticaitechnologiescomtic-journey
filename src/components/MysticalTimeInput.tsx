import { useState, useRef, useEffect, useCallback } from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  value: string; // HH:MM (24h)
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Custom time input that is fully controlled by the app language,
 * bypassing native OS locale for the picker UI.
 * Renders a simple HH:MM text input with increment/decrement controls.
 */
const MysticalTimeInput = ({ value, onChange, className = "", style }: Props) => {
  const { language } = useLanguage();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hours = value ? parseInt(value.split(":")[0] || "0", 10) : 0;
  const minutes = value ? parseInt(value.split(":")[1] || "0", 10) : 0;

  const formatTime = (h: number, m: number) =>
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  const setHours = useCallback(
    (h: number) => {
      const wrapped = ((h % 24) + 24) % 24;
      onChange(formatTime(wrapped, minutes));
    },
    [minutes, onChange]
  );

  const setMinutes = useCallback(
    (m: number) => {
      const wrapped = ((m % 60) + 60) % 60;
      onChange(formatTime(hours, wrapped));
    },
    [hours, onChange]
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
      let digits = e.target.value.replace(/[^0-9]/g, "");
      if (digits.length > 4) digits = digits.slice(0, 4);

      let formatted = "";
      if (digits.length <= 2) {
        formatted = digits;
      } else {
        formatted = digits.slice(0, 2) + ":" + digits.slice(2);
      }

      // Only fire onChange if we have a valid time
      if (digits.length === 4) {
        const h = parseInt(digits.slice(0, 2), 10);
        const m = parseInt(digits.slice(2, 4), 10);
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          onChange(formatTime(h, m));
          return;
        }
      }

      // For partial input, update the display but keep existing value
      if (formatted === "") {
        onChange("");
      }
    },
    [onChange]
  );

  const displayValue = value || "";

  const spinnerBtnClass =
    "flex items-center justify-center w-10 h-8 rounded-lg transition-colors hover:bg-gold/10 active:bg-gold/20 text-gold/60 hover:text-gold";

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleTextChange}
        placeholder="HH:MM"
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

      {/* Custom time spinner */}
      {isPickerOpen && (
        <div
          className="absolute z-50 mt-2 rounded-xl border shadow-2xl p-4 flex items-center gap-4 justify-center"
          style={{
            background: "hsl(var(--deep-space))",
            borderColor: "hsl(var(--gold) / 0.2)",
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: 200,
            direction: "ltr"
          }}
        >
          {/* Hours */}
          <div className="flex flex-col items-center gap-1">
            <button type="button" className={spinnerBtnClass} onClick={() => setHours(hours + 1)}>
              <ChevronUp className="w-5 h-5" />
            </button>
            <span
              className="font-body text-2xl font-bold tabular-nums"
              style={{ color: "hsl(var(--gold))", minWidth: 40, textAlign: "center" }}
            >
              {String(hours).padStart(2, "0")}
            </span>
            <button type="button" className={spinnerBtnClass} onClick={() => setHours(hours - 1)}>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <span className="font-body text-2xl font-bold" style={{ color: "hsl(var(--gold) / 0.5)" }}>
            :
          </span>

          {/* Minutes */}
          <div className="flex flex-col items-center gap-1">
            <button type="button" className={spinnerBtnClass} onClick={() => setMinutes(minutes + 5)}>
              <ChevronUp className="w-5 h-5" />
            </button>
            <span
              className="font-body text-2xl font-bold tabular-nums"
              style={{ color: "hsl(var(--gold))", minWidth: 40, textAlign: "center" }}
            >
              {String(minutes).padStart(2, "0")}
            </span>
            <button type="button" className={spinnerBtnClass} onClick={() => setMinutes(minutes - 5)}>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MysticalTimeInput;
