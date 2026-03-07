import { useMemo } from "react";
import { motion } from "framer-motion";

const StarField = () => {
  const stars = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 8,
      duration: 3 + Math.random() * 4,
      peak: 0.3 + Math.random() * 0.5,
    })),
  []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: "hsl(var(--gold))",
          }}
          animate={{ opacity: [0, s.peak, 0] }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default StarField;
