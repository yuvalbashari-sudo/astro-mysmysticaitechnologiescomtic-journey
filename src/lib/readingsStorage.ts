export interface SavedReading {
  id: string;
  type: "forecast" | "rising" | "compatibility" | "tarot" | "palm";
  title: string;
  subtitle: string;
  symbol: string;
  date: string; // ISO string
  data: Record<string, unknown>;
}

const STORAGE_KEY = "astrologai_readings";

function getAll(): SavedReading[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(reading: Omit<SavedReading, "id" | "date">): SavedReading {
  const readings = getAll();
  const newReading: SavedReading = {
    ...reading,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };
  readings.unshift(newReading);
  // Keep max 50 readings
  if (readings.length > 50) readings.length = 50;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  return newReading;
}

function remove(id: string): void {
  const readings = getAll().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
}

function clearAll(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export const readingsStorage = { getAll, save, remove, clearAll };
