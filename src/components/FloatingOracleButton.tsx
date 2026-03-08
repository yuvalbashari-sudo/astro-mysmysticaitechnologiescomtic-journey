import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Moon, Hand, X } from "lucide-react";
import TarotModal from "./TarotModal";
import CompatibilityModal from "./CompatibilityModal";
import RisingSignModal from "./RisingSignModal";
import PalmReadingModal from "./PalmReadingModal";
import { useT } from "@/i18n";

const MENU_ITEMS = [
  { icon: Hand, labelKey: "nav_palm_title" as const, action: "palm", emoji: "✋" },
  { icon: Moon, labelKey: "nav_birthchart_title" as const, action: "rising", emoji: "🌙" },
  { icon: Heart, labelKey: "nav_compatibility_title" as const, action: "compatibility", emoji: "💞" },
  { icon: Sparkles, labelKey: "hero_tarot" as const, action: "tarot", emoji: "🔮" },
];

const FloatingOracleButton = () => {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [tarotOpen, setTarotOpen] = useState(false);
  const [compatibilityOpen, setCompatibilityOpen] = useState(false);
  const [risingOpen, setRisingOpen] = useState(false);
  const [palmOpen, setPalmOpen] = useState(false);

  const handleAction = (action: string) => {
    setIsOpen(false);
    setTimeout(() => {
      if (action === "tarot") setTarotOpen(true);
      else if (action === "compatibility") setCompatibilityOpen(true);
      else if (action === "rising") setRisingOpen(true);
      else if (action === "palm") setPalmOpen(true);
    }, 200);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-24 right-5 z-[61] flex flex-col items-end gap-3">
            {MENU_ITEMS.map((item, i) => (
              <motion.button
                key={item.action}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
                onClick={() => handleAction(item.action)}
                className="flex items-center gap-3 px-4 py-3 rounded-full min-h-[48px] transition-all"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--deep-blue-light)), hsl(var(--deep-blue)))",
                  border: "1px solid hsl(var(--gold) / 0.25)",
                  boxShadow: "0 4px 20px hsl(var(--deep-blue) / 0.6), 0 0 15px hsl(var(--gold) / 0.1)",
                }}
              >
                <span className="text-sm font-body text-foreground whitespace-nowrap">
                  {(t as any)[item.labelKey]}
                </span>
                <span className="text-lg">{item.emoji}</span>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <motion.button
        className="fixed bottom-5 right-5 z-[62] w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)), hsl(var(--gold-light)))",
          boxShadow: "0 4px 20px hsl(var(--gold) / 0.4)",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.5, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="שאלו את האורקל"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div key="oracle" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow pulse */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: "2px solid hsl(var(--gold) / 0.4)" }}
            animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.button>

      {/* Modals */}
      <TarotModal isOpen={tarotOpen} onClose={() => setTarotOpen(false)} />
      <CompatibilityModal isOpen={compatibilityOpen} onClose={() => setCompatibilityOpen(false)} />
      <RisingSignModal isOpen={risingOpen} onClose={() => setRisingOpen(false)} />
      <PalmReadingModal isOpen={palmOpen} onClose={() => setPalmOpen(false)} />
    </>
  );
};

export default FloatingOracleButton;
