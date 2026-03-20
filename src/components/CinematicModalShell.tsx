import { useRef, useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import heroFigure from "@/assets/hero-mystic-figure.jpg";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Optional: scroll ref forwarded to parent */
  scrollRef?: React.RefObject<HTMLDivElement>;
  /** When true, renders children full-screen without the glass panel container */
  fullscreen?: boolean;
}

/**
 * Shared cinematic full-screen modal with persistent oracle woman,
 * ambient particles, depth layers, and consistent animation language.
 * Replaces flat generic panels across all reading experiences.
 */
const CinematicModalShell = ({ isOpen, onClose, children, scrollRef }: Props) => {
  const [isMobile, setIsMobile] = useState(false);
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const activeScrollRef = scrollRef || internalScrollRef;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const shell = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* ── Oracle woman background ── */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: 1.04 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <img
              src={heroFigure}
              alt=""
              className="w-full h-full object-cover"
              style={{
                objectPosition: isMobile ? "center calc(0% + 70px)" : "center calc(0% + 100px)",
                filter: "brightness(0.35)",
              }}
            />
          </motion.div>

          {/* ── Depth gradients ── */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 65% 55% at 50% 50%, transparent 30%, hsl(var(--deep-blue) / 0.88) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, hsl(var(--deep-blue) / 0.65) 0%, transparent 25%)",
              }}
            />
          </div>

          {/* ── Ambient particles ── */}
          {[...Array(isMobile ? 8 : 16)].map((_, i) => (
            <motion.div
              key={`cp-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: i % 3 === 0 ? 2.5 : 1.5,
                height: i % 3 === 0 ? 2.5 : 1.5,
                left: `${8 + Math.random() * 84}%`,
                top: `${10 + Math.random() * 75}%`,
                background: i % 2 === 0
                  ? "hsl(var(--gold) / 0.45)"
                  : "hsl(var(--celestial) / 0.35)",
              }}
              animate={{
                opacity: [0, 0.6, 0],
                y: [0, -(18 + Math.random() * 25)],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeOut",
              }}
            />
          ))}

          {/* ── Subtle ambient glow ── */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: "20%", right: "20%",
              top: "40%", height: "25%",
              background: "radial-gradient(ellipse 100% 100% at 50% 60%, hsl(var(--gold) / 0.04) 0%, transparent 70%)",
              filter: "blur(25px)",
            }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ── Close button ── */}
          <motion.button
            className="fixed top-5 left-5 z-[105] w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer"
            style={{
              background: "hsl(var(--deep-blue) / 0.6)",
              border: "1px solid hsl(var(--gold) / 0.2)",
            }}
            onClick={onClose}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-4 h-4 text-gold/70" />
          </motion.button>

          {/* ── Free badge ── */}
          <div className="fixed top-5 right-5 z-[105]">
            <span
              className="px-3 py-1 rounded-full text-[10px] font-bold font-body tracking-wider"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))",
                border: "1px solid hsl(var(--gold) / 0.3)",
                color: "hsl(var(--gold))",
              }}
            >
              ✦ חינם
            </span>
          </div>

          {/* ── Content area — scrollable glass panel ── */}
          <div className="absolute inset-0 z-[102] flex items-center justify-center pointer-events-none">
            <motion.div
              ref={activeScrollRef as React.RefObject<HTMLDivElement>}
              className="pointer-events-auto w-full max-w-2xl max-h-[88vh] overflow-y-auto mx-4 rounded-2xl"
              style={{
                background: "linear-gradient(160deg, hsl(var(--deep-blue-light) / 0.85), hsl(var(--deep-blue) / 0.92))",
                border: "1px solid hsl(var(--gold) / 0.12)",
                boxShadow: "0 0 80px hsl(var(--deep-blue) / 0.4), 0 0 30px hsl(var(--gold) / 0.06), inset 0 1px 0 hsl(var(--gold) / 0.08)",
                backdropFilter: "blur(12px)",
              }}
              initial={{ opacity: 0, scale: 0.92, y: 30, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.92, y: 30, filter: "blur(6px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(shell, document.body);
};

export default CinematicModalShell;
