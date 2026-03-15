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
            className="relative px-3 py-1.5 rounded-full font-heading text-xs transition-colors focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-1"
            style={{
              color: isActive ? "hsl(var(--primary-foreground))" : "hsl(var(--gold) / 0.6)",
              fontSize: key === "xl" ? 11 : key === "large" ? 12 : 12,
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

/** CSS class maps for each text size tier */
export const TEXT_SIZE_CLASSES: Record<TextSize, {
  body: string;
  heading: string;
  subheading: string;
  quote: string;
  label: string;
  gap: string;
}> = {
  default: {
    body: "text-base md:text-lg leading-[1.9] md:leading-[2]",
    heading: "text-lg md:text-xl",
    subheading: "text-sm md:text-base",
    quote: "text-base md:text-lg",
    label: "text-sm",
    gap: "h-4 md:h-5",
  },
  large: {
    body: "text-lg md:text-xl leading-[2] md:leading-[2.1]",
    heading: "text-xl md:text-2xl",
    subheading: "text-base md:text-lg",
    quote: "text-lg md:text-xl",
    label: "text-base",
    gap: "h-5 md:h-6",
  },
  xl: {
    body: "text-xl md:text-2xl leading-[2.05] md:leading-[2.15]",
    heading: "text-2xl md:text-3xl",
    subheading: "text-lg md:text-xl",
    quote: "text-xl md:text-2xl",
    label: "text-base md:text-lg",
    gap: "h-6 md:h-7",
  },
};
