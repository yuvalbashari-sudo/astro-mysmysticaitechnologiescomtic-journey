/**
 * Mystical Profile — Unified AI Core
 * 
 * Aggregates all mystical reading data into a single profile that evolves over time.
 * Stored in localStorage. Designed for future expansion to user accounts.
 */

export interface MysticalProfileData {
  // Identity
  userName?: string;
  gender?: "male" | "female";
  zodiacSign?: string;
  zodiacSymbol?: string;
  zodiacElement?: string;
  risingSign?: string;
  risingSymbol?: string;
  risingElement?: string;
  birthDate?: string;
  birthTime?: string;

  // Relationship patterns
  compatibilityHistory: Array<{
    partnerSign: string;
    partnerSymbol: string;
    score: number;
    timestamp: string;
  }>;

  // Tarot patterns
  recentTarotCards: Array<{
    name: string;
    hebrewName: string;
    symbol: string;
    spreadType: string;
    timestamp: string;
  }>;

  // Daily cards
  dailyCards: Array<{
    hebrewName: string;
    symbol: string;
    timestamp: string;
  }>;

  // Palm reading
  palmReadingDone: boolean;
  palmReadingTimestamp?: string;

  // Energy themes (auto-detected)
  energyThemes: Record<string, number>; // theme → count

  // Timestamps
  firstReadingAt?: string;
  lastReadingAt?: string;
  totalReadings: number;
}

const STORAGE_KEY = "astrologai_mystical_profile";

// Energy theme keywords mapped from card names and spread types
const THEME_KEYWORDS: Record<string, string[]> = {
  "טרנספורמציה": ["המוות", "המגדל", "השיפוט", "death", "tower", "judgement"],
  "צמיחה_רגשית": ["הכוכב", "הירח", "השמש", "הקיסרית", "star", "moon", "sun", "empress"],
  "אמת_נסתרת": ["הכוהנת הגדולה", "הנזיר", "התלוי", "high priestess", "hermit", "hanged man"],
  "מתח_זוגי": ["האוהבים", "השטן", "lovers", "devil"],
  "אנרגיה_יצירתית": ["הקוסם", "הקיסרית", "הכוכב", "magician", "empress", "star"],
  "כוח_פנימי": ["הכוח", "המרכבה", "הקיסר", "strength", "chariot", "emperor"],
  "התחלות_חדשות": ["השוטה", "הגלגל", "העולם", "fool", "wheel", "world"],
  "בהירות_רוחנית": ["הכוכב", "השמש", "המתינות", "star", "sun", "temperance"],
  "אומץ_והחלטות": ["הצדק", "המרכבה", "justice", "chariot"],
};

function getProfile(): MysticalProfileData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    compatibilityHistory: [],
    recentTarotCards: [],
    dailyCards: [],
    palmReadingDone: false,
    energyThemes: {},
    totalReadings: 0,
  };
}

function saveProfile(profile: MysticalProfileData): void {
  profile.lastReadingAt = new Date().toISOString();
  if (!profile.firstReadingAt) profile.firstReadingAt = profile.lastReadingAt;
  profile.totalReadings++;
  
  // Cap arrays
  if (profile.recentTarotCards.length > 50) profile.recentTarotCards.length = 50;
  if (profile.dailyCards.length > 30) profile.dailyCards.length = 30;
  if (profile.compatibilityHistory.length > 20) profile.compatibilityHistory.length = 20;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function detectThemes(cardName: string, hebrewName: string): string[] {
  const detected: string[] = [];
  const lowerName = cardName.toLowerCase();
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    if (keywords.some(kw => lowerName.includes(kw.toLowerCase()) || hebrewName.includes(kw))) {
      detected.push(theme);
    }
  }
  return detected;
}

function updateThemes(profile: MysticalProfileData, themes: string[]): void {
  for (const theme of themes) {
    profile.energyThemes[theme] = (profile.energyThemes[theme] || 0) + 1;
  }
}

// ---- Recording functions ----

function recordUserName(name: string): void {
  const profile = getProfile();
  profile.userName = name.trim();
  saveProfile(profile);
}

function getUserName(): string | undefined {
  return getProfile().userName;
}

function recordZodiac(sign: string, symbol: string, element: string, birthDate: string): void {
  const profile = getProfile();
  profile.zodiacSign = sign;
  profile.zodiacSymbol = symbol;
  profile.zodiacElement = element;
  profile.birthDate = birthDate;
  saveProfile(profile);
}

function recordRising(sign: string, symbol: string, element: string, birthTime: string): void {
  const profile = getProfile();
  profile.risingSign = sign;
  profile.risingSymbol = symbol;
  profile.risingElement = element;
  profile.birthTime = birthTime;
  saveProfile(profile);
}

function recordCompatibility(partnerSign: string, partnerSymbol: string, score: number): void {
  const profile = getProfile();
  profile.compatibilityHistory.unshift({
    partnerSign, partnerSymbol, score, timestamp: new Date().toISOString(),
  });
  saveProfile(profile);
}

function recordTarotCards(cards: Array<{ name?: string; hebrewName: string; symbol: string }>, spreadType: string): void {
  const profile = getProfile();
  const now = new Date().toISOString();
  for (const card of cards) {
    profile.recentTarotCards.unshift({
      name: card.name || card.hebrewName,
      hebrewName: card.hebrewName,
      symbol: card.symbol,
      spreadType,
      timestamp: now,
    });
    const themes = detectThemes(card.name || card.hebrewName, card.hebrewName);
    updateThemes(profile, themes);
  }
  saveProfile(profile);
}

function recordDailyCard(hebrewName: string, symbol: string): void {
  const profile = getProfile();
  profile.dailyCards.unshift({
    hebrewName, symbol, timestamp: new Date().toISOString(),
  });
  const themes = detectThemes(hebrewName, hebrewName);
  updateThemes(profile, themes);
  saveProfile(profile);
}

function recordPalmReading(): void {
  const profile = getProfile();
  profile.palmReadingDone = true;
  profile.palmReadingTimestamp = new Date().toISOString();
  saveProfile(profile);
}

// ---- Context generation for AI ----

function buildContextForAI(): string | null {
  const profile = getProfile();
  if (profile.totalReadings === 0) return null;

  const lines: string[] = [];

  // Identity
  if (profile.userName) {
    lines.push(`שם הקורא/ת: ${profile.userName}`);
  }
  if (profile.zodiacSign) {
    lines.push(`מזל השמש: ${profile.zodiacSign} ${profile.zodiacSymbol || ""} (יסוד: ${profile.zodiacElement || "לא ידוע"})`);
  }
  if (profile.risingSign) {
    lines.push(`מזל עולה: ${profile.risingSign} ${profile.risingSymbol || ""} (יסוד: ${profile.risingElement || "לא ידוע"})`);
  }

  // Reading count
  lines.push(`מספר קריאות כולל: ${profile.totalReadings}`);
  if (profile.firstReadingAt) {
    const daysSince = Math.floor((Date.now() - new Date(profile.firstReadingAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 0) lines.push(`מלווה אותנו כבר ${daysSince} ימים`);
  }

  // Recent tarot cards (last 5)
  if (profile.recentTarotCards.length > 0) {
    const recent = profile.recentTarotCards.slice(0, 5);
    lines.push(`קלפי טארוט אחרונים: ${recent.map(c => `${c.symbol} ${c.hebrewName}`).join(", ")}`);
  }

  // Daily cards (last 3)
  if (profile.dailyCards.length > 0) {
    const recent = profile.dailyCards.slice(0, 3);
    lines.push(`קלפים יומיים אחרונים: ${recent.map(c => `${c.symbol} ${c.hebrewName}`).join(", ")}`);
  }

  // Compatibility patterns
  if (profile.compatibilityHistory.length > 0) {
    const latest = profile.compatibilityHistory[0];
    lines.push(`התאמה זוגית אחרונה: עם מזל ${latest.partnerSign} (${latest.score}%)`);
  }

  // Palm
  if (profile.palmReadingDone) {
    lines.push("ביצע/ה קריאת כף יד");
  }

  // Dominant energy themes
  const sortedThemes = Object.entries(profile.energyThemes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  if (sortedThemes.length > 0) {
    const themeLabels: Record<string, string> = {
      "טרנספורמציה": "טרנספורמציה ושינוי",
      "צמיחה_רגשית": "צמיחה רגשית",
      "אמת_נסתרת": "חיפוש אמת נסתרת",
      "מתח_זוגי": "מתח וחיבור זוגי",
      "אנרגיה_יצירתית": "אנרגיה יצירתית",
      "כוח_פנימי": "כוח פנימי ועוצמה",
      "התחלות_חדשות": "התחלות חדשות",
      "בהירות_רוחנית": "בהירות רוחנית",
      "אומץ_והחלטות": "אומץ וקבלת החלטות",
    };
    const themeStr = sortedThemes.map(([t, count]) => `${themeLabels[t] || t} (×${count})`).join(", ");
    lines.push(`נושאים אנרגטיים חוזרים: ${themeStr}`);
  }

  if (lines.length === 0) return null;

  return `פרופיל מיסטי של הקורא/ת (זיכרון מצטבר):
${lines.join("\n")}

הנחיה: שלב את המידע הזה בפירוש באופן טבעי ומיסטי. אם יש נושאים חוזרים, ציין שהאנרגיה הזו ממשיכה ללוות. אם מזל השמש או העולה ידועים, קשר את הפירוש לאישיות האסטרולוגית. אל תציין שזה "מידע מהמערכת" — דבר כאילו אתה פשוט רואה ויודע.`;
}

function clearProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export const mysticalProfile = {
  getProfile,
  recordUserName,
  getUserName,
  recordZodiac,
  recordRising,
  recordCompatibility,
  recordTarotCards,
  recordDailyCard,
  recordPalmReading,
  buildContextForAI,
  clearProfile,
};
