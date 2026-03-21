import { motion } from "framer-motion";

export type TextSize = "default" | "large" | "xl";

interface Props {
  value: TextSize;
  onChange: (size: TextSize) => void;
}

const OPTIONS: { key: TextSize; label: string }[] = [
  { key: "default", label: "A" },
  { key: "large", label: "A+" },
  { key: "xl", label: "A++" },
];

const TextSizeControl = ({ value, onChange }: Props) => {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-1"
      style={{
        background: "hsl(var(--deep-blue-light) / 0.6)",
        border: "1px solid hsl(var(--gold) / 0.15)",
      }}
      role="radiogroup"
      aria-label="Text size"
    >
      {OPTIONS.map(({ key, label }) => {
        const isActive = value === key;
        return (
          <button
            key={key}
            role="radio"
            aria-checked={isActive}
            aria-label={`Text size ${label}`}
            onClick={() => onChange(key)}
            className="relative px-3 py-1.5 rounded-full font-heading transition-colors focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-1"
            style={{
              color: isActive ? "hsl(var(--primary-foreground))" : "hsl(var(--gold) / 0.6)",
              fontSize: key === "default" ? 14 : key === "large" ? 17 : 20,
            }}
          >
            {isActive && (
              <motion.div
                layoutId="text-size-pill"
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                  boxShadow: "0 0 12px hsl(var(--gold) / 0.25)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TextSizeControl;

/**
 * Typography scaling system.
 * 
 * The "default" tier = old A++ (xl) size — this is the new baseline.
 * "A" button = default (old xl), "A+" = larger, "A++" = largest.
 */
export const TEXT_SIZE_CLASSES: Record<TextSize, {
  body: string;
  heading: string;
  subheading: string;
  quote: string;
  label: string;
  gap: string;
}> = {
  default: {
    body: "text-xl md:text-2xl leading-[2.05] md:leading-[2.15]",
    heading: "text-2xl md:text-3xl",
    subheading: "text-lg md:text-xl",
    quote: "text-xl md:text-2xl",
    label: "text-base md:text-lg",
    gap: "h-6 md:h-7",
  },
  large: {
    body: "text-2xl md:text-[1.75rem] leading-[2.1] md:leading-[2.2]",
    heading: "text-3xl md:text-4xl",
    subheading: "text-xl md:text-2xl",
    quote: "text-2xl md:text-[1.75rem]",
    label: "text-lg md:text-xl",
    gap: "h-7 md:h-8",
  },
  xl: {
    body: "text-[1.75rem] md:text-[2rem] leading-[2.15] md:leading-[2.25]",
    heading: "text-4xl md:text-5xl",
    subheading: "text-2xl md:text-3xl",
    quote: "text-[1.75rem] md:text-[2rem]",
    label: "text-xl md:text-2xl",
    gap: "h-8 md:h-10",
  },
};
