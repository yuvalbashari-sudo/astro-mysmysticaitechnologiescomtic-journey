import { useRef, useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import heroFigure from "@/assets/hero-mystic-figure.jpg";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  scrollRef?: React.RefObject<HTMLDivElement>;
  fullscreen?: boolean;
}

/**
 * Cinematic scene shell — NOT a modal.
 *
 * The oracle is the scene. Content floats over her as translucent layers
 * without any visible container boundary. No box, no border, no card.
 * Children scroll naturally over a rising fog gradient that provides
 * text legibility without hiding the figure.
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
          {/* ── Layer 0: Oracle — the scene itself ── */}
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
                filter: "brightness(0.5) saturate(1.15)",
              }}
            />
          </motion.div>

          {/* ── Layer 1: Minimal vignette — edges only, center open ── */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 90% 80% at 50% 40%, transparent 50%, hsl(var(--deep-blue) / 0.65) 100%)",
              }}
            />
            {/* Top whisper for close-button legibility */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: "8%",
                background: "linear-gradient(to bottom, hsl(var(--deep-blue) / 0.45), transparent)",
              }}
            />
          </div>

          {/* ── Layer 2: Floating particles — depth cue ── */}
          {[...Array(isMobile ? 6 : 14)].map((_, i) => (
            <motion.div
              key={`cp-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: i % 3 === 0 ? 2.5 : 1.5,
                height: i % 3 === 0 ? 2.5 : 1.5,
                left: `${8 + Math.random() * 84}%`,
                top: `${10 + Math.random() * 75}%`,
                background: i % 2 === 0
                  ? "hsl(var(--gold) / 0.4)"
                  : "hsl(var(--celestial) / 0.3)",
              }}
              animate={{
                opacity: [0, 0.5, 0],
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

          {/* ── Layer 3: Warm glow near oracle's hands ── */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: "25%", right: "25%",
              top: "45%", height: "20%",
              background: "radial-gradient(ellipse 100% 100% at 50% 50%, hsl(var(--gold) / 0.04) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ── Controls: close + badge ── */}
          <motion.button
            className="fixed top-5 left-5 z-[105] w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer"
            style={{
              background: "hsl(var(--deep-blue) / 0.5)",
              border: "1px solid hsl(var(--gold) / 0.15)",
            }}
            onClick={onClose}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-4 h-4 text-gold/70" />
          </motion.button>
          <div className="fixed top-5 right-5 z-[105]">
            <span
              className="px-3 py-1 rounded-full text-[10px] font-bold font-body tracking-wider"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))",
                border: "1px solid hsl(var(--gold) / 0.2)",
                color: "hsl(var(--gold))",
              }}
            >
              ✦ חינם
            </span>
          </div>

          {/* ── Layer 4: Content — no box, just floating scene elements ── */}
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
              className="absolute inset-0 z-[102] overflow-y-auto scrollbar-hide"
            >
              {/*
                Scene composition:
                1. Oracle fills the viewport — always visible
                2. Content starts below her face (spacer)
                3. A rising fog gradient sits BEHIND the content for legibility
                4. No container box — children float directly in the scene
              */}

              {/* Spacer: oracle's face and upper body remain unobscured */}
              <div
                className="pointer-events-none"
                style={{ height: isMobile ? "28vh" : "38vh" }}
                aria-hidden="true"
              />

              {/* Rising fog — soft gradient that makes text readable
                  without a visible box. Positioned behind content via relative stacking. */}
              <div className="relative">
                <div
                  className="absolute inset-x-0 -top-24 bottom-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(to bottom, 
                      transparent 0%, 
                      hsl(var(--deep-blue) / 0.25) 60px, 
                      hsl(var(--deep-blue) / 0.55) 180px, 
                      hsl(var(--deep-blue) / 0.75) 100%)`,
                  }}
                />

                <motion.div
                  className="relative pointer-events-auto"
                  style={{
                    maxWidth: isMobile ? "100%" : "560px",
                    margin: "0 auto",
                    padding: isMobile ? "0 16px 40px" : "0 24px 60px",
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
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
