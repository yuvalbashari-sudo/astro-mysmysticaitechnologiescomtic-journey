import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import astrologerAvatarCta from "@/assets/astrologer-avatar-cta.png";
import { useT } from "@/i18n";

interface AstrologerAvatarButtonProps {
  size: number;
  onClick: () => void;
  style?: CSSProperties;
  className?: string;
  entranceDelay?: number;
}

const AstrologerAvatarButton = ({
  size,
  onClick,
  style,
  className = "",
  entranceDelay = 1.1,
}: AstrologerAvatarButtonProps) => {
  return (
    <motion.button
      type="button"
      className={`absolute pointer-events-auto cursor-pointer flex items-center justify-center bg-transparent border-0 outline-none appearance-none group ${className}`.trim()}
      style={{ width: size, height: size, ...style }}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      whileHover={{ filter: "brightness(1.15)", scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      aria-label={t.astrologer_aria_label}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: entranceDelay }}
    >
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          width: "100%",
          height: "100%",
          boxShadow:
            "0 2px 10px hsl(270 60% 45% / 0.3), 0 0 12px hsl(200 70% 50% / 0.1), 0 0 4px hsl(var(--gold) / 0.15)",
          border: "1.5px solid hsl(var(--gold) / 0.25)",
        }}
        animate={{ y: [0, -1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src={astrologerAvatarCta}
          alt="שיחה עם האסטרולוגית"
          className="w-full h-full object-cover scale-105"
          style={{ objectPosition: "center 42%" }}
          draggable={false}
        />
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["-100% 0%", "200% 0%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.button>
  );
};

export default AstrologerAvatarButton;