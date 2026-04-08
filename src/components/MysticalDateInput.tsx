import { useState, useRef, useCallback, useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}

/** Get today as YYYY-MM-DD in the user's local timezone */
function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Check if an ISO date string is in the future */
function isFutureDate(iso: string): boolean {
  if (!iso) return false;
  return iso > getTodayISO();
}

/**
 * A mobile-friendly date input that shows a visible text field with DD/MM/YYYY
 * format. Users can type manually OR tap the calendar icon to use native picker.
 * Outputs YYYY-MM-DD for internal consistency.
 * Future dates are blocked.
 */
const MysticalDateInput = ({ value, onChange, className = "", style, placeholder }: Props) => {
  const { language } = useLanguage();
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [futureError, setFutureError] = useState(false);

  const todayISO = useMemo(() => getTodayISO(), []);

  // Convert YYYY-MM-DD → DD/MM/YYYY for display
  const toDisplay = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
  };

  // Convert DD/MM/YYYY → YYYY-MM-DD for storage
  const toIso = (display: string) => {
    const cleaned = display.replace(/[^0-9/]/g, "");
    const parts = cleaned.split("/");
    if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
      const d = parts[0].padStart(2, "0");
      const m = parts[1].padStart(2, "0");
      const y = parts[2];
      const day = parseInt(d, 10);
      const month = parseInt(m, 10);
      const year = parseInt(y, 10);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        return `${y}-${m}-${d}`;
      }
    }
    return "";
  };

  const [displayValue, setDisplayValue] = useState(toDisplay(value));

  // Sync if parent value changes externally
  const prevValueRef = useRef(value);
  if (value !== prevValueRef.current) {
    prevValueRef.current = value;
    setDisplayValue(toDisplay(value));
    setFutureError(false);
  }

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip everything except digits
    let digits = e.target.value.replace(/[^0-9]/g, "");
    if (digits.length > 8) digits = digits.slice(0, 8);
    
    // Auto-format with slashes: DD/MM/YYYY
    let formatted = "";
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    } else {
      formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    }
    
    setDisplayValue(formatted);
    const iso = toIso(formatted);
    if (iso) {
      if (isFutureDate(iso)) {
        setFutureError(true);
        onChange(""); // Clear the value — don't allow future dates
        return;
      }
      setFutureError(false);
      onChange(iso);
    } else if (formatted === "") {
      setFutureError(false);
      onChange("");
    }
  }, [onChange]);

  const handleNativePick = useCallback(() => {
    hiddenRef.current?.showPicker?.();
    hiddenRef.current?.focus();
    hiddenRef.current?.click();
  }, []);

  const handleNativeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (isFutureDate(v)) {
      setFutureError(true);
      onChange("");
      return;
    }
    setFutureError(false);
    onChange(v);
    setDisplayValue(toDisplay(v));
  }, [onChange]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        inputMode="numeric"
        lang={language}
        value={displayValue}
        onChange={handleTextChange}
        placeholder={placeholder || "DD / MM / YYYY"}
        className={`mystical-input font-body text-center w-full ${className} ${futureError ? "ring-1 ring-crimson/60" : ""}`}
        style={{ direction: "ltr", paddingRight: 36, ...style }}
        autoComplete="off"
      />
      <button
        type="button"
        onClick={handleNativePick}
        className="absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors"
        style={{ right: 6, color: "hsl(var(--gold) / 0.5)" }}
        aria-label="Open calendar"
        tabIndex={-1}
      >
        <CalendarDays className="w-4 h-4" />
      </button>
      {/* Hidden native date input for calendar picker — max set to today */}
      <input
        ref={hiddenRef}
        type="date"
        lang={language}
        value={value}
        max={todayISO}
        onChange={handleNativeChange}
        className="absolute inset-0 opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
        style={{ width: 0, height: 0, overflow: "hidden", position: "absolute" }}
      />
      {futureError && (
        <p className="text-xs mt-1 font-body" style={{ color: "hsl(var(--crimson))" }}>
          ✦ Future dates are not allowed
        </p>
      )}
    </div>
  );
};

export default MysticalDateInput;
