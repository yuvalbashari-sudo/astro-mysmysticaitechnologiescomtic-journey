import { Calendar } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  showHelper?: boolean;
  className?: string;
  error?: string;
}

const MysticalDateInput = ({ value, onChange, label, showHelper = true, className = "", error }: Props) => {
  const { language, dir } = useLanguage();
  const isRTL = dir === "rtl";

  const helperTexts: Record<string, string> = {
    he: "ניתן להקליד תאריך או לבחור מהיומן",
    ar: "يمكنك كتابة التاريخ أو اختيار من التقويم",
    ru: "Введите дату вручную или выберите из календаря",
    en: "Type your date or tap the calendar",
  };

  const placeholders: Record<string, string> = {
    he: "יום / חודש / שנה",
    ar: "يوم / شهر / سنة",
    ru: "ДД / ММ / ГГГГ",
    en: "DD / MM / YYYY",
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm text-gold/70 font-body mb-2" style={{ textAlign: isRTL ? "right" : "left" }}>
          <Calendar className={`w-3.5 h-3.5 inline-block ${isRTL ? "ml-1.5" : "mr-1.5"}`} />
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholders[language] || placeholders.en}
          className="mystical-input font-body w-full"
          style={{
            direction: "ltr",
            colorScheme: "dark",
            minHeight: "48px",
            paddingLeft: isRTL ? "12px" : "40px",
            paddingRight: isRTL ? "40px" : "12px",
            textAlign: "center",
          }}
        />
        <Calendar
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gold/40 pointer-events-none"
          style={{ [isRTL ? "right" : "left"]: "12px" }}
        />
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
