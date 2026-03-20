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
 * Content floats as a translucent layer — the oracle always remains visible.
 */
const CinematicModalShell = ({ isOpen, onClose, children, scrollRef, fullscreen = false }: Props) => {
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
          {/* ── Oracle woman background — brighter, always present ── */}
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
                filter: "brightness(0.45) saturate(1.1)",
              }}
            />
          </motion.div>

          {/* ── Subtle depth — light vignette, oracle stays visible ── */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Edges-only vignette — center stays clear */}
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 40%, hsl(var(--deep-blue) / 0.7) 100%)",
              }}
            />
            {/* Very subtle top fade for close button readability */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, hsl(var(--deep-blue) / 0.5) 0%, transparent 12%)",
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

          {/* ── Content area — floating translucent layer ── */}
          {fullscreen ? (
            <div
              ref={activeScrollRef as React.RefObject<HTMLDivElement>}
              className="absolute inset-0 z-[102] overflow-y-auto"
            >
              {children}
            </div>
          ) : (
            <div
              ref={activeScrollRef as React.RefObject<HTMLDivElement>}
              className="absolute inset-0 z-[102] overflow-y-auto"
            >
              {/* Scroll spacer — pushes content below oracle's face on desktop */}
              {!isMobile && (
                <div className="h-[18vh] pointer-events-none" aria-hidden="true" />
              )}
              <div className={`flex justify-center pointer-events-none ${isMobile ? "px-3 pt-16 pb-8" : "px-6 pb-12"}`}>
                <motion.div
                  className="pointer-events-auto w-full rounded-2xl"
                  style={{
                    maxWidth: isMobile ? "100%" : "540px",
                    background: "linear-gradient(170deg, hsl(var(--deep-blue-light) / 0.55), hsl(var(--deep-blue) / 0.65))",
                    border: "1px solid hsl(var(--gold) / 0.1)",
                    boxShadow: "0 8px 60px hsl(var(--deep-blue) / 0.5), 0 0 1px hsl(var(--gold) / 0.15), inset 0 1px 0 hsl(var(--gold) / 0.06)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                  initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  {children}
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(shell, document.body);
};

export default CinematicModalShell;
