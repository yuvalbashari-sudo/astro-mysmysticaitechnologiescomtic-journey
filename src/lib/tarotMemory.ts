/**
 * Tarot Memory System
 * Tracks cards that appeared in previous readings to create
 * a sense of continuity and depth across sessions.
 * Stored in localStorage — no login required.
 * Designed for future expansion to user profiles.
 */

export interface TarotMemoryEntry {
  cardName: string;        // English name (key)
  hebrewName: string;      // Hebrew display name
  symbol: string;          // Card emoji/symbol
  spreadType: string;      // e.g. "daily", "love", "timeline"
  positionLabel: string;   // Position in spread
  timestamp: string;       // ISO string
}

export interface TarotCardHistory {
  cardName: string;
  hebrewName: string;
  symbol: string;
  appearances: number;
  lastSeen: string;        // ISO string
  spreadTypes: string[];   // unique spread types where it appeared
}

const STORAGE_KEY = "astrologai_tarot_memory";
const MAX_ENTRIES = 200;

function getAllEntries(): TarotMemoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: TarotMemoryEntry[]): void {
  if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Record cards from a completed reading.
 */
function recordReading(
  spreadType: string,
  cards: { name?: string; hebrewName: string; symbol: string; positionLabel: string }[]
): void {
  const entries = getAllEntries();
  const now = new Date().toISOString();

  for (const card of cards) {
    entries.unshift({
      cardName: card.name || card.hebrewName,
      hebrewName: card.hebrewName,
      symbol: card.symbol,
      spreadType,
      positionLabel: card.positionLabel,
      timestamp: now,
    });
  }

  saveEntries(entries);
}

/**
 * Get history summary for specific cards.
 * Returns only cards that have appeared before (prior to this reading).
 */
function getCardHistories(cardNames: string[]): TarotCardHistory[] {
  const entries = getAllEntries();
  const histories: TarotCardHistory[] = [];

  for (const name of cardNames) {
    const matching = entries.filter(
      (e) => e.cardName === name || e.hebrewName === name
    );
    if (matching.length > 0) {
      const uniqueSpreads = [...new Set(matching.map((m) => m.spreadType))];
      histories.push({
        cardName: matching[0].cardName,
        hebrewName: matching[0].hebrewName,
        symbol: matching[0].symbol,
        appearances: matching.length,
        lastSeen: matching[0].timestamp,
        spreadTypes: uniqueSpreads,
      });
    }
  }

  return histories;
}

/**
 * Build a context block for the AI prompt describing returning cards.
 */
function buildMemoryContext(
  cards: { name?: string; hebrewName: string; symbol: string }[]
): string | null {
  const names = cards.map((c) => c.name || c.hebrewName);
  const histories = getCardHistories(names);

  if (histories.length === 0) return null;

  const lines = histories.map((h) => {
    const daysSince = Math.floor(
      (Date.now() - new Date(h.lastSeen).getTime()) / (1000 * 60 * 60 * 24)
    );
    const timeAgo = daysSince === 0 ? "היום" : daysSince === 1 ? "אתמול" : `לפני ${daysSince} ימים`;
    return `- ${h.symbol} ${h.hebrewName}: הופיע ${h.appearances} פעמים בעבר (לאחרונה ${timeAgo}, בקריאות: ${h.spreadTypes.join(", ")})`;
  });

  return `קלפים חוזרים (זיכרון מיסטי):
${lines.join("\n")}
שים לב: אם קלף חוזר, ציין זאת בפירוש באופן מיסטי — למשל "הקלף הזה חוזר אליך שוב, סימן שהאנרגיה הזו ממשיכה לפעול בחייך". אל תתעלם מזה.`;
}

/**
 * Clear all memory (for privacy).
 */
function clearMemory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export const tarotMemory = {
  getAllEntries,
  recordReading,
  getCardHistories,
  buildMemoryContext,
  clearMemory,
};
