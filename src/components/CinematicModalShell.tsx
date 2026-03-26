import { useRef, useEffect, useState, type ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import heroFigure from "@/assets/hero-mystic-figure.jpg";
import astrologerAvatar from "@/assets/astrologer-avatar-cta.png";
import AdvisorChatPanel from "./AdvisorChatPanel";
import AvatarHoverTeaser from "./AvatarHoverTeaser";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  scrollRef?: React.RefObject<HTMLDivElement>;
  fullscreen?: boolean;
  /** When true, content expands to ~92% width instead of narrow column */
  wide?: boolean;
  /** When true, hides the built-in advisor avatar button */
  hideAdvisor?: boolean;
  /** When true, skips oracle background — shows only a subtle dark backdrop */
  transparent?: boolean;
  /** Override default avatar positioning styles */
  avatarStyle?: React.CSSProperties;
}

/**
 * Cinematic scene shell — NOT a modal.
 *
 * The oracle is the scene. Content floats over her as translucent layers
 * without any visible container boundary. No box, no border, no card.
 * Children scroll naturally over a rising fog gradient that provides
 * text legibility without hiding the figure.
 */
const CinematicModalShell = ({ isOpen, onClose, children, scrollRef, fullscreen = false, wide = false, hideAdvisor = false, transparent = false, avatarStyle }: Props) => {
  const [isMobile, setIsMobile] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  
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
          {transparent ? (
            /* Subtle dark backdrop — hero shows through */
            <div
              className="absolute inset-0"
              style={{ background: "hsl(222 47% 3% / 0.55)" }}
            />
          ) : (
            <>
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

              {/* ── Layer 1: Minimal vignette ── */}
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse 90% 80% at 50% 40%, transparent 50%, hsl(var(--deep-blue) / 0.65) 100%)",
                  }}
                />
                <div
                  className="absolute top-0 left-0 right-0"
                  style={{
                    height: "8%",
                    background: "linear-gradient(to bottom, hsl(var(--deep-blue) / 0.45), transparent)",
                  }}
                />
              </div>

              {/* ── Layer 2: Floating particles ── */}
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

              {/* ── Layer 3: Warm glow ── */}
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
            </>
          )}

          {/* ── Controls: close + badge ── */}
          <motion.button
            className="fixed top-5 left-5 z-[105] w-[52px] h-[52px] min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors duration-200"
            style={{
              background: "hsl(var(--deep-blue) / 0.55)",
              border: "1px solid hsl(var(--gold) / 0.2)",
            }}
            onClick={onClose}
            whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--deep-blue) / 0.7)" }}
            whileTap={{ scale: 0.92 }}
          >
            <X className="w-6 h-6 text-gold/80" />
          </motion.button>
          <div className="fixed top-5 right-5 z-[105]">
            <span
              className="px-6 py-2 rounded-full text-[20px] font-bold font-body tracking-wider"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))",
                border: "1px solid hsl(var(--gold) / 0.2)",
                color: "hsl(var(--gold))",
              }}
            >
              ✦ חינם
            </span>
          </div>

          {!hideAdvisor && (
            <AvatarHoverTeaser
              disabled={isMobile}
              className="absolute z-[106]"
              style={avatarStyle ?? (isMobile ? {
                bottom: 16,
                right: 12,
                top: "auto",
                left: "auto",
                width: 64,
                height: 64,
              } : {
                bottom: 32,
                right: 40,
                left: "auto",
                width: 168,
                height: 168,
              })}
            >
              <motion.button
                className="w-full h-full rounded-full overflow-hidden cursor-pointer group"
                style={{
                  boxShadow: "0 4px 24px hsl(270 60% 45% / 0.3), 0 0 30px hsl(200 70% 50% / 0.12), 0 0 8px hsl(var(--gold) / 0.2)",
                  border: "2px solid hsl(var(--gold) / 0.35)",
                }}
                onClick={() => setAdvisorOpen(true)}
                whileHover={{ filter: "brightness(1.15)" }}
                whileTap={{ filter: "brightness(0.9)" }}
                aria-label="התייעצות עם האסטרולוגית"
              >
                <img
                  src={astrologerAvatar}
                  alt="האסטרולוגית"
                  className="w-full h-full object-cover scale-105"
                  style={{ objectPosition: "center 42%" }}
                  draggable={false}
                />
                <div
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ border: "2px solid hsl(var(--gold) / 0.4)" }}
                  animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                />
              </motion.button>
            </AvatarHoverTeaser>
          )}

          {/* Advisor chat panel */}
          <AdvisorChatPanel isOpen={advisorOpen} onClose={() => setAdvisorOpen(false)} forceRightAnchor />


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

              {/* Spacer: oracle's face and upper body remain unobscured (skip in wide mode — content fills viewport) */}
              {!wide && (
                <div
                  className="pointer-events-none"
                  style={{ height: isMobile ? "28vh" : "38vh" }}
                  aria-hidden="true"
                />
              )}

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
                    maxWidth: wide ? "92%" : (isMobile ? "100%" : "560px"),
                    margin: "0 auto",
                    padding: isMobile ? "0 16px 40px" : wide ? "0 0 60px" : "0 24px 60px",
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
