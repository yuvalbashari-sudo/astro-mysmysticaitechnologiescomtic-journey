import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mysticalProfile } from "@/lib/mysticalProfile";
import { useT } from "@/i18n/LanguageContext";

interface Props {
  value: string;
  onChange: (name: string) => void;
  delay?: number;
  className?: string;
}

const MysticalNameInput = ({ value, onChange, delay = 0.28, className = "" }: Props) => {
  const t = useT();
  const [focused, setFocused] = useState(false);
  const [greeting, setGreeting] = useState("");

  const handleBlur = () => {
    setFocused(false);
    if (value.trim()) {
      mysticalProfile.recordUserName(value.trim());
      setGreeting(value.trim());
    } else {
      setGreeting("");
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setGreeting("");
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

      <div className="relative">
        {/* Ambient glow behind input on focus */}
        <motion.div
          className="absolute -inset-1 rounded-xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(var(--gold) / 0.12), transparent 70%)" }}
          animate={{ opacity: focused ? 1 : 0, scale: focused ? 1.02 : 0.98 }}
          transition={{ duration: 0.4 }}
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={t.daily_name_placeholder}
          maxLength={50}
          className="relative w-full py-2.5 px-4 rounded-lg font-body text-sm text-foreground/80 placeholder:text-foreground/25 focus:outline-none transition-all duration-500"
          style={{
            background: "hsl(var(--deep-blue-light) / 0.3)",
            border: `1px solid hsl(var(--gold) / ${focused ? "0.35" : "0.08"})`,
            boxShadow: focused
              ? "0 0 16px hsl(var(--gold) / 0.1), inset 0 0 8px hsl(var(--gold) / 0.03)"
              : "none",
          }}
          dir="auto"
        />

        {/* Subtle shimmer line at bottom on focus */}
        <motion.div
          className="absolute bottom-0 left-[10%] right-[10%] h-px rounded-full pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.4), transparent)" }}
          animate={{ opacity: focused ? 1 : 0, scaleX: focused ? 1 : 0.3 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Greeting after typing */}
      <AnimatePresence>
        {greeting && !focused && (
          <motion.p
            className="mt-2 text-xs font-body text-gold/50 tracking-wide"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4 }}
          >
            ✦ Nice to meet you, {greeting}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MysticalNameInput;
