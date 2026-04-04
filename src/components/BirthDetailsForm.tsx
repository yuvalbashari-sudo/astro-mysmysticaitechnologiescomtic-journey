import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import MysticalNameInput from "@/components/MysticalNameInput";
import MysticalDateInput from "@/components/MysticalDateInput";
import { useT } from "@/i18n/LanguageContext";

export interface BirthDetails {
  userName: string;
  gender: "male" | "female" | "";
  birthDate: string;
  birthTime: string;
  birthCity: string;
}

interface Props {
  values: BirthDetails;
  onChange: (patch: Partial<BirthDetails>) => void;
  attempted: boolean;
  /** Show birth-time field? */
  showTime?: boolean;
  /** Desktop large sizing */
  size?: "default" | "large";
}

/**
 * Unified birth-details form used across all astrology modals.
 * Always renders: Name → Gender → Date → Time → City.
 * Fully visible on every device — no conditional rendering, no hidden wrappers.
 */
const BirthDetailsForm = ({ values, onChange, attempted, showTime = true, size = "default" }: Props) => {
  const t = useT();
  const isLarge = size === "large";

  const labelClass = isLarge
    ? "block font-body mb-3"
    : "block font-body text-sm mb-2";
  const labelStyle = isLarge
    ? { fontSize: "20px", color: "hsl(var(--gold) / 0.7)" }
    : { color: "hsl(var(--gold) / 0.7)" };

  const genderBtnStyle = (active: boolean) => ({
    fontSize: isLarge ? "20px" : "14px",
    padding: isLarge ? "14px 0" : "10px 0",
    background: active
      ? "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.08))"
      : "hsl(222 47% 11% / 0.5)",
    border: active
      ? "1px solid hsl(var(--gold) / 0.45)"
      : "1px solid hsl(var(--gold) / 0.1)",
    color: active
      ? "hsl(var(--gold))"
      : "hsl(var(--foreground) / 0.5)",
    backdropFilter: "blur(8px)",
  });

  const inputSizeStyle = isLarge
    ? { fontSize: "20px", padding: "14px", height: "56px" }
    : {};

  const errorClass = isLarge
    ? "font-body mt-2"
    : "font-body text-xs mt-1.5";
  const errorStyle = { color: "hsl(var(--crimson))", fontSize: isLarge ? "14px" : undefined };

  return (
    <div className="space-y-5">
      {/* ── Name ── */}
      <MysticalNameInput
        value={values.userName}
        onChange={(v) => onChange({ userName: v })}
        delay={0.1}
      />

      {/* ── Gender ── */}
      <div>
        <label className={labelClass} style={labelStyle}>
          {t.forecast_gender_label}
        </label>
        <div className="flex gap-3">
          <motion.button
            type="button"
            onClick={() => onChange({ gender: "male" })}
            className="flex-1 rounded-xl font-body transition-all duration-300"
            style={genderBtnStyle(values.gender === "male")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t.forecast_gender_male}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => onChange({ gender: "female" })}
            className="flex-1 rounded-xl font-body transition-all duration-300"
            style={genderBtnStyle(values.gender === "female")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t.forecast_gender_female}
          </motion.button>
        </div>
        {attempted && !values.gender && (
          <p className={errorClass} style={errorStyle}>{t.forecast_gender_required}</p>
        )}
      </div>

      {/* ── Birth Date ── */}
      <div>
        <label className={labelClass} style={labelStyle}>
          {t.forecast_birthdate_label || t.birth_chart_date_label}
        </label>
        <MysticalDateInput
          value={values.birthDate}
          onChange={(v) => onChange({ birthDate: v })}
          style={inputSizeStyle}
        />
        {attempted && !values.birthDate && (
          <p className={errorClass} style={errorStyle}>{t.forecast_birthdate_required}</p>
        )}
      </div>

      {/* ── Birth Time ── */}
      {showTime && (
        <div>
          <label className={labelClass} style={labelStyle}>
            {t.birth_chart_time_label}
          </label>
          <input
            type="time"
            value={values.birthTime}
            onChange={(e) => onChange({ birthTime: e.target.value })}
            className="mystical-input font-body text-center w-full"
            style={{ direction: "ltr", ...inputSizeStyle }}
          />
          {attempted && !values.birthTime && (
            <p className={errorClass} style={errorStyle}>{t.forecast_birthdate_required}</p>
          )}
        </div>
      )}

      {/* ── Birth City (always visible, always required) ── */}
      <div>
        <label className={labelClass} style={labelStyle}>
          <MapPin
            className="inline-block ml-1"
            style={{ width: isLarge ? 18 : 14, height: isLarge ? 18 : 14 }}
          />
          {" "}
          {t.birth_chart_city_label}
        </label>
        <input
          type="text"
          value={values.birthCity}
          onChange={(e) => onChange({ birthCity: e.target.value })}
          placeholder={t.birth_chart_city_placeholder || "City, Country..."}
          className="mystical-input font-body w-full"
          style={{ direction: "ltr", textAlign: "center", ...inputSizeStyle }}
          maxLength={100}
          autoComplete="off"
          required
        />
        {attempted && !values.birthCity.trim() && (
          <p className={errorClass} style={errorStyle}>
            {t.birth_chart_error_required || t.forecast_birthdate_required}
          </p>
        )}
      </div>
    </div>
  );
};

export default BirthDetailsForm;
