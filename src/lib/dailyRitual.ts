import { majorArcanaCards, type MajorArcanaCard } from "@/data/majorArcanaCards";

const STORAGE_KEY = "astrologai_daily_ritual";

/* ── Daily mystical messages ── */
const DAILY_MESSAGES = [
  "היקום שולח לכם אות — עצרו והקשיבו לדופק הפנימי שלכם.",
  "היום האנרגיה הקוסמית תומכת בשינוי. אל תפחדו מהלא-נודע.",
  "משהו שהתחלתם מזמן מתחיל לפרוח. תנו לו מקום.",
  "הכוכבים מיישרים קו לטובתכם — פעלו מתוך אמון.",
  "חוכמה ישנה מתעוררת בכם היום. הקשיבו לה.",
  "הנשמה שלכם יודעת את התשובה. שתקו ותשמעו.",
  "אנרגיה חדשה נכנסת לחייכם — קבלו אותה בזרועות פתוחות.",
  "היום הוא יום של ריפוי שקט. תנו לעצמכם לנוח בתוך האור.",
  "מפגש לא צפוי עשוי לשנות את הכיוון. היו ערניים.",
  "כוח נסתר מתעורר בתוככם — השתמשו בו בחוכמה.",
  "היקום מזמין אתכם לשחרר מה שכבר לא משרת אתכם.",
  "היום האינטואיציה שלכם חדה במיוחד. סמכו עליה.",
  "אור חדש מתחיל לחדור דרך הסדקים. אל תסתירו אותם.",
  "מסע פנימי מתחיל כשעוצרים את המסע החיצוני. עצרו.",
  "הירח מאיר את מה שהשמש לא מגלה. חפשו בין הצללים.",
  "כל סוף הוא התחלה מחופשת. אל תתאבלו — חגגו.",
  "התבוננו במראה הקוסמית — מה שתראו הוא האמת העמוקה ביותר.",
  "היום האנרגיה תומכת ביצירתיות. צרו משהו — כל דבר.",
  "חיבור עמוק עם מישהו קרוב ייתן לכם כוח בלתי צפוי.",
  "הכוכבים לוחשים: הסבלנות שלכם עומדת להתגמל.",
  "האור שאתם מחפשים בחוץ — כבר דולק בפנים.",
  "היום תגלו שפחד ישן כבר לא שייך לכם. שחררו אותו.",
  "מסר מהיקום: עצרו לרגע, נשמו, וזכרו מי אתם באמת.",
  "אנרגיה של שפע זורמת לכיוון שלכם. פתחו את הידיים.",
  "היום הגוף שלכם מדבר. הקשיבו — הוא חכם יותר ממה שחשבתם.",
  "חלום שחלמתם לאחרונה מכיל רמז חשוב. נסו להיזכר.",
  "הנשמה שלכם בחרה להיות כאן, עכשיו, מסיבה. גלו אותה.",
  "מחזור חדש מתחיל. השאירו את הישן מאחור בכבוד.",
  "היום אתם קרובים יותר מתמיד לתשובה שחיפשתם.",
  "היקום מחבק אתכם. גם אם לא מרגישים — האהבה הקוסמית כאן.",
  "אנרגיה חזקה של אומץ מלווה אתכם היום. השתמשו בה.",
];

/* ── Daily energy insights ── */
const ENERGY_INSIGHTS = [
  { theme: "טרנספורמציה", insight: "היום האנרגיה תומכת בשינוי עמוק. מה שנראה כסוף — הוא למעשה התחלה של מציאות חדשה.", icon: "🔥" },
  { theme: "אינטואיציה", insight: "החוש השישי שלכם חד במיוחד היום. החלטות שתקבלו מתוך תחושת בטן — יהיו מדויקות.", icon: "👁️" },
  { theme: "ריפוי", insight: "אנרגיית ריפוי עדינה עוטפת אתכם. תנו לעצמכם לנוח, לקבל ולהתחדש.", icon: "💫" },
  { theme: "יצירתיות", insight: "הכוח היצירתי שלכם בשיא. כל מה שתיצרו היום — ישא בתוכו קסם אמיתי.", icon: "✨" },
  { theme: "חיבור", insight: "האנרגיה הקוסמית תומכת בחיבורים עמוקים. שיחה כנה עם מישהו קרוב עשויה לשנות הכל.", icon: "💞" },
  { theme: "אומץ", insight: "כוכב לכת מרס שולח לכם אנרגיית אומץ. מה שפחדתם לעשות — היום זה הזמן.", icon: "⚡" },
  { theme: "שפע", insight: "הירח תומך בשפע. פתחו את עצמכם לקבל — לא רק לתת. השפע כבר בדרך.", icon: "🌙" },
  { theme: "בהירות", insight: "מעטה של ערפל מתפוגג. דברים שהיו מבלבלים — מתבהרים לאט לאט.", icon: "☀️" },
  { theme: "שורשים", insight: "האנרגיה היום מזמינה חיבור לשורשים. משפחה, מסורת, זיכרונות — יש בהם כוח.", icon: "🌿" },
  { theme: "חופש", insight: "אנרגיית שחרור עוצמתית. שחררו דפוסים ישנים, מחשבות מגבילות, ויחסים שכבשו.", icon: "🕊️" },
  { theme: "חוכמה", insight: "חוכמה עתיקה זורמת אליכם. קראו, למדו, או פשוט שבו בשקט — התשובות יגיעו.", icon: "📜" },
  { theme: "שמחה", insight: "האנרגיה היום היא של שמחה פשוטה. אל תחפשו עומק — תרשו לעצמכם ליהנות.", icon: "🌟" },
  { theme: "הגנה", insight: "מגן אנרגטי סובב אתכם. אנרגיות שליליות לא יחדרו — אתם מוגנים.", icon: "🛡️" },
  { theme: "סנכרון", insight: "סנכרוניות תתגלה היום. שימו לב למקריות — הן לא מקריות כלל.", icon: "🔮" },
];

export interface DailyRitualData {
  card: MajorArcanaCard;
  message: string;
  energy: { theme: string; insight: string; icon: string };
  timestamp: number; // ms
  revealed: boolean;
}

function getDayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Deterministic index based on date (same card/message every day for all users) */
function dayIndex(): number {
  const now = new Date();
  const start = new Date(2024, 0, 1);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

function getSaved(): (DailyRitualData & { dayKey: string }) | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getDailyRitual(): DailyRitualData & { isNew: boolean } {
  const key = getDayKey();
  const saved = getSaved();

  if (saved && saved.dayKey === key) {
    return { ...saved, isNew: false };
  }

  // Generate new daily ritual
  const idx = dayIndex();
  const cards = drawTarotCards(22); // get all, pick deterministically
  const card = cards[idx % cards.length];
  const message = DAILY_MESSAGES[idx % DAILY_MESSAGES.length];
  const energy = ENERGY_INSIGHTS[idx % ENERGY_INSIGHTS.length];

  const data: DailyRitualData & { dayKey: string } = {
    card,
    message,
    energy,
    timestamp: Date.now(),
    revealed: false,
    dayKey: key,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return { ...data, isNew: true };
}

export function revealDailyRitual(): void {
  const saved = getSaved();
  if (saved) {
    saved.revealed = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }
}

export function getNextResetTime(): Date {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  return tomorrow;
}

export function msUntilReset(): number {
  return Math.max(0, getNextResetTime().getTime() - Date.now());
}
