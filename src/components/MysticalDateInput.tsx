import { useState, useRef, useCallback, useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  validateBirthParts,
  validateBirthIso,
  getDateErrorMessage,
  getMaxYear,
  type DateErrorCode,
} from "@/lib/dateValidation";

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

/**
 * A mobile-friendly date input that shows a visible text field.
 * English → MM/DD/YYYY, others → DD/MM/YYYY.
 * Outputs YYYY-MM-DD for internal consistency.
 *
 * Strict birth-date validation:
 *   - Year between 1900 and current year
 *   - Month 1–12, Day 1–31
 *   - Real calendar days per month (incl. leap years)
 *   - Future dates blocked
 * Localized error messages (HE / EN / RU / AR).
 */
const MysticalDateInput = ({ value, onChange, className = "", style, placeholder }: Props) => {
  const { language } = useLanguage();
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [errorCode, setErrorCode] = useState<DateErrorCode | null>(null);

  const isEN = language === "en";
  const todayISO = useMemo(() => getTodayISO(), []);
  const minDateISO = `${1900}-01-01`;

  // Convert YYYY-MM-DD → display string
  const toDisplay = useCallback((iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return isEN ? `${m}/${d}/${y}` : `${d}/${m}/${y}`;
  }, [isEN]);

  /**
   * Parse display string → { iso, errorCode }.
   * Validates only when the user has typed a complete date (DD/MM/YYYY or MM/DD/YYYY).
   */
  const parseDisplay = useCallback((display: string): { iso: string; error: DateErrorCode | null } => {
    const cleaned = display.replace(/[^0-9/]/g, "");
    const parts = cleaned.split("/");
    if (parts.length !== 3) return { iso: "", error: null };
    if (parts[0].length === 0 || parts[1].length === 0 || parts[2].length < 4) {
      return { iso: "", error: null };
    }

    const p0 = parts[0].padStart(2, "0");
    const p1 = parts[1].padStart(2, "0");
    const yStr = parts[2];

    const month = isEN ? parseInt(p0, 10) : parseInt(p1, 10);
    const day = isEN ? parseInt(p1, 10) : parseInt(p0, 10);
    const year = parseInt(yStr, 10);

    const err = validateBirthParts(year, month, day);
    if (err) return { iso: "", error: err };

    const m = String(month).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return { iso: `${yStr}-${m}-${d}`, error: null };
  }, [isEN]);

  const [displayValue, setDisplayValue] = useState(toDisplay(value));

  // Sync if parent value changes externally
  const prevValueRef = useRef(value);
  const prevLangRef = useRef(language);
  if (value !== prevValueRef.current || language !== prevLangRef.current) {
    prevValueRef.current = value;
    prevLangRef.current = language;
    setDisplayValue(toDisplay(value));
    setErrorCode(null);
  }

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/[^0-9]/g, "");
    if (digits.length > 8) digits = digits.slice(0, 8);

    // Auto-format with slashes
    let formatted = "";
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    } else {
      formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    }

    setDisplayValue(formatted);

    if (formatted === "") {
      setErrorCode(null);
      onChange("");
      return;
    }

    const { iso, error } = parseDisplay(formatted);
    if (error) {
      setErrorCode(error);
      onChange("");
      return;
    }
    if (iso) {
      setErrorCode(null);
      onChange(iso);
    } else {
      // Incomplete input — clear any stale error/value silently
      setErrorCode(null);
      onChange("");
    }
  }, [onChange, parseDisplay]);

  const handleNativePick = useCallback(() => {
    hiddenRef.current?.showPicker?.();
    hiddenRef.current?.focus();
    hiddenRef.current?.click();
  }, []);

  const handleNativeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    const err = validateBirthIso(v);
    if (err) {
      setErrorCode(err);
      onChange("");
      return;
    }
    setErrorCode(null);
    onChange(v);
    setDisplayValue(toDisplay(v));
  }, [onChange, toDisplay]);

  const defaultPlaceholder = isEN ? "MM / DD / YYYY" : "DD / MM / YYYY";

  return (
    <div className="relative w-full">
      <input
        type="text"
        inputMode="numeric"
        lang={language}
        value={displayValue}
        onChange={handleTextChange}
        placeholder={placeholder || defaultPlaceholder}
        className={`mystical-input font-body text-center w-full ${className} ${errorCode ? "ring-1 ring-crimson/60" : ""}`}
        style={{ direction: "ltr", paddingRight: 36, ...style }}
        autoComplete="off"
        aria-invalid={!!errorCode}
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
      {/* Hidden native date input for calendar picker — bounded to [1900-01-01, today] */}
      <input
        ref={hiddenRef}
        type="date"
        lang={language}
        value={value}
        min={minDateISO}
        max={todayISO}
        onChange={handleNativeChange}
        className="absolute inset-0 opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
        style={{ width: 0, height: 0, overflow: "hidden", position: "absolute" }}
      />
      {errorCode && (
        <p
          className="text-xs mt-1 font-body"
          style={{ color: "hsl(var(--crimson))" }}
          role="alert"
        >
          {getDateErrorMessage(errorCode, language)}
        </p>
      )}
    </div>
  );
};

export default MysticalDateInput;
