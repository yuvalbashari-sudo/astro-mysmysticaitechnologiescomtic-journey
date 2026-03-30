import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import AdvisorChatPanel from "./AdvisorChatPanel";
import { useReadingContext } from "@/contexts/ReadingContext";
import { useT } from "@/i18n";
import { useIsMobile } from "@/hooks/use-mobile";

const PORTAL_ID = "norielle-global-root";

const FloatingOracleButton = () => {
  const t = useT();
  const [chatOpen, setChatOpen] = useState(false);
  const { activeReading, modalOpen } = useReadingContext();
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById(PORTAL_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = PORTAL_ID;
      document.body.appendChild(el);
    }
    // Force full visual isolation every mount
    Object.assign(el.style, {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      zIndex: "2147483647",
      isolation: "isolate",
      opacity: "1",
      filter: "none",
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
      mixBlendMode: "normal",
      transform: "none",
      contain: "layout",
    });
    setHost(el);
    return () => {
      // Don't remove — other instances may rely on it
    };
  }, []);

  if (!host || modalOpen) return null;

  return createPortal(
    <>
      <AdvisorChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Main Floating Button */}
      <motion.button
        className="fixed w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          bottom: "5px",
          right: "5px",
          zIndex: 2147483647,
          pointerEvents: "auto",
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
              pointerEvents: "none",
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    </>,
    host
  );
};

export default FloatingOracleButton;
