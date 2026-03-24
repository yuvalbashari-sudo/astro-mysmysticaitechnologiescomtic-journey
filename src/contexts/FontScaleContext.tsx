import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type FontScale = "default" | "large" | "xl";

const SCALE_VALUES: Record<FontScale, number> = {
  default: 1.0,
  large: 1.15,
  xl: 1.3,
};

const STORAGE_KEY = "astrologai_font_scale";

interface FontScaleContextType {
  scale: FontScale;
  setScale: (s: FontScale) => void;
  multiplier: number;
}

const FontScaleContext = createContext<FontScaleContextType>({
  scale: "default",
  setScale: () => {},
  multiplier: 1,
});

export const useFontScale = () => useContext(FontScaleContext);

function loadScale(): FontScale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "large" || saved === "xl") return saved;
  } catch {}
  return "default";
}

export const FontScaleProvider = ({ children }: { children: ReactNode }) => {
  const [scale, setScaleState] = useState<FontScale>(loadScale);

  const setScale = (s: FontScale) => {
    setScaleState(s);
    localStorage.setItem(STORAGE_KEY, s);
  };

  const multiplier = SCALE_VALUES[scale];

  // Apply CSS custom property on <html> so all rem/em units scale
  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(multiplier));
    // Scale the root font-size: 16px * multiplier
    document.documentElement.style.fontSize = `${16 * multiplier}px`;
    return () => {
      document.documentElement.style.removeProperty("--font-scale");
      document.documentElement.style.fontSize = "";
    };
  }, [multiplier]);

  return (
    <FontScaleContext.Provider value={{ scale, setScale, multiplier }}>
      {children}
    </FontScaleContext.Provider>
  );
};
