import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { mysticalProfile } from "@/lib/mysticalProfile";
import { useT } from "@/i18n/LanguageContext";

interface Props {
  value: string;
  onChange: (name: string) => void;
  delay?: number;
  className?: string;
}

/**
 * Elegant inline name input for reading flows.
 * Saves to mysticalProfile on blur so AI can use it.
 */
const MysticalNameInput = ({ value, onChange, delay = 0.28, className = "" }: Props) => {
  const t = useT();

  const handleBlur = () => {
    if (value.trim()) {
      mysticalProfile.recordUserName(value.trim());
    }
  };

  return (
    <motion.div
      className={`w-full ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <label className="block text-xs text-gold/50 font-body mb-2 tracking-wider uppercase">
        {t.daily_name_label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={t.daily_name_placeholder}
        maxLength={50}
        className="w-full py-2.5 px-4 rounded-lg font-body text-sm text-foreground/80 placeholder:text-foreground/25 focus:outline-none transition-all duration-300"
        style={{
          background: "hsl(var(--deep-blue-light) / 0.3)",
          border: "1px solid hsl(var(--gold) / 0.08)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.3)";
          e.currentTarget.style.boxShadow = "0 0 12px hsl(var(--gold) / 0.08)";
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.08)";
          e.currentTarget.style.boxShadow = "none";
        }}
        dir="auto"
      />
    </motion.div>
  );
};

export default MysticalNameInput;
