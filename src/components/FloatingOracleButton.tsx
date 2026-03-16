import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import AdvisorChatPanel from "./AdvisorChatPanel";
import { useReadingContext } from "@/contexts/ReadingContext";
import { useT } from "@/i18n";

const FloatingOracleButton = () => {
  const t = useT();
  const [chatOpen, setChatOpen] = useState(false);
  const { activeReading } = useReadingContext();

  return (
    <>
      <AdvisorChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Main Floating Button */}
      <motion.button
        className="fixed z-[110] w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          bottom: "5px",
          right: "5px",
          background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)), hsl(var(--gold-light)))",
          boxShadow: "0 4px 20px hsl(var(--gold) / 0.4)",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.5, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setChatOpen(!chatOpen)}
        aria-label={chatOpen ? t.advisor_close : t.advisor_open}
      >
        <AnimatePresence mode="wait">
          {chatOpen ? (
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
        {!chatOpen && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: "2px solid hsl(var(--gold) / 0.4)" }}
            animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {/* Active reading indicator */}
        {activeReading && !chatOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full"
            style={{
              background: "hsl(var(--gold))",
              boxShadow: "0 0 8px hsl(var(--gold) / 0.6)",
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    </>
  );
};

export default FloatingOracleButton;
