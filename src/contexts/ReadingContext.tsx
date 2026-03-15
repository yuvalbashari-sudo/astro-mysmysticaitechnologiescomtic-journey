import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface ReadingContextData {
  type: string; // "tarot" | "compatibility" | "rising" | "palm" | "forecast" | "dailyCard" | "birthChart" | "tarotWorld"
  label: string; // Human-readable label e.g. "Tarot Reading"
  summary: string; // The full AI result text
}

interface ReadingContextValue {
  activeReading: ReadingContextData | null;
  setActiveReading: (data: ReadingContextData | null) => void;
}

const ReadingContext = createContext<ReadingContextValue>({
  activeReading: null,
  setActiveReading: () => {},
});

export const useReadingContext = () => useContext(ReadingContext);

export const ReadingProvider = ({ children }: { children: ReactNode }) => {
  const [activeReading, setActiveReading] = useState<ReadingContextData | null>(null);
  return (
    <ReadingContext.Provider value={{ activeReading, setActiveReading }}>
      {children}
    </ReadingContext.Provider>
  );
};
