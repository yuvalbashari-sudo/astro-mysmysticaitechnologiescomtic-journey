import { Calendar } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useRef } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  showHelper?: boolean;
  className?: string;
  error?: string;
}

/**
 * Auto-formats text as DD / MM / YYYY while the user types digits.
 * Returns the formatted display string.
 */
function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`;
}

/** Convert DD / MM / YYYY display string → YYYY-MM-DD for internal value */
function displayToIso(display: string): string {
  const digits = display.replace(/\D/g, "");
  if (digits.length < 8) return "";
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  return `${yyyy}-${mm}-${dd}`;
}

/** Convert YYYY-MM-DD → DD / MM / YYYY display string */
function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const [yyyy, mm, dd] = iso.split("-");
  if (!yyyy || !mm || !dd) return "";
  return `${dd} / ${mm} / ${yyyy}`;
}

const MysticalDateInput = ({ value, onChange, label, showHelper = true, className = "", error }: Props) => {
  const { language, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  const helperTexts: Record<string, string> = {
    he: "ניתן להקליד תאריך או לבחור מהיומן",
    ar: "يمكنك كتابة التاريخ أو اختيار من التقويم",
    ru: "Введите дату вручную или выберите из календаря",
    en: "Type your date or tap the calendar",
  };

  const placeholders: Record<string, string> = {
    he: "יום / חודש / שנה",
    ar: "יום / شهر / سنة",
    ru: "ДД / ММ / ГГГГ",
    en: "DD / MM / YYYY",
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    const iso = displayToIso(formatted);
    // Update internal value when we have a full date, otherwise keep partial for UX
    if (iso) {
      // Validate the date is real
      const d = new Date(iso);
      if (!isNaN(d.getTime())) {
        onChange(iso);
      }
    } else if (formatted === "") {
      onChange("");
    }
    // Always update the text input display
    e.target.value = formatted;
  };

  const handleCalendarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onChange(e.target.value);
    }
  };

  const openNativePicker = () => {
    hiddenDateRef.current?.showPicker?.();
    hiddenDateRef.current?.focus();
  };

  const displayValue = isoToDisplay(value);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm text-gold/70 font-body mb-2" style={{ textAlign: isRTL ? "right" : "left" }}>
          <Calendar className={`w-3.5 h-3.5 inline-block ${isRTL ? "ml-1.5" : "mr-1.5"}`} />
          {label}
        </label>
      )}
      <div className="relative">
        {/* Visible text input for manual typing */}
        <input
          type="text"
          inputMode="numeric"
          defaultValue={displayValue}
          key={value} // re-sync when value changes externally (e.g. calendar pick)
          onChange={handleTextChange}
          placeholder={placeholders[language] || placeholders.en}
          className="mystical-input font-body w-full"
          autoComplete="off"
          style={{
            direction: "ltr",
            minHeight: "48px",
            paddingLeft: isRTL ? "12px" : "40px",
            paddingRight: isRTL ? "40px" : "12px",
            textAlign: "center",
          }}
        />
        {/* Hidden native date input for calendar picker */}
        <input
          ref={hiddenDateRef}
          type="date"
          value={value}
          onChange={handleCalendarPick}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          tabIndex={-1}
          style={{ colorScheme: "dark" }}
        />
        {/* Calendar icon - tappable to open native picker */}
        <button
          type="button"
          onClick={openNativePicker}
          className="absolute top-1/2 -translate-y-1/2 p-2 -m-2"
          style={{ [isRTL ? "right" : "left"]: "12px" }}
          aria-label="Open calendar"
        >
          <Calendar className="w-4 h-4 text-gold/50" />
        </button>
      </div>
      {error && (
        <p className="font-body text-xs mt-1.5" style={{ color: "hsl(var(--crimson))", textAlign: isRTL ? "right" : "left" }}>
          {error}
        </p>
      )}
      {showHelper && !error && (
        <p className="text-[10px] text-foreground/40 font-body mt-1.5" style={{ textAlign: isRTL ? "right" : "left" }}>
          {helperTexts[language] || helperTexts.en}
        </p>
      )}
    </div>
  );
};

export default MysticalDateInput;
