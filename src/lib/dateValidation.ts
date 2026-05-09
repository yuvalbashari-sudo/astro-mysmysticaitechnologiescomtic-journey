/**
 * Strict birth-date validation shared by every birth/personal date input
 * across the local/multilingual project (HE, EN, RU, AR).
 *
 * Validates: realistic year range, month 1-12, day 1-31, real calendar
 * days per month (incl. leap years), and blocks future dates.
 */

export type DateLang = "he" | "en" | "ru" | "ar" | string;

export type DateErrorCode =
  | "future"
  | "year_range"
  | "month_range"
  | "day_range"
  | "invalid_day_for_month"
  | "invalid";

const MIN_YEAR = 1900;

export function getMaxYear(): number {
  return new Date().getFullYear();
}

function getTodayISO(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeap(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

/** Validate parsed Y/M/D parts. Returns null if valid, else error code. */
export function validateBirthParts(
  year: number,
  month: number,
  day: number
): DateErrorCode | null {
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return "invalid";
  }
  if (month < 1 || month > 12) return "month_range";
  if (day < 1 || day > 31) return "day_range";
  if (year < MIN_YEAR || year > getMaxYear()) return "year_range";
  if (day > daysInMonth(year, month)) return "invalid_day_for_month";

  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (iso > getTodayISO()) return "future";
  return null;
}

/** Validate an ISO YYYY-MM-DD string. */
export function validateBirthIso(iso: string): DateErrorCode | null {
  if (!iso) return "invalid";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "invalid";
  return validateBirthParts(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10));
}

const MESSAGES: Record<string, Record<DateErrorCode, string>> = {
  en: {
    future: "✦ Future dates are not allowed",
    year_range: `✦ Year must be between ${MIN_YEAR} and ${getMaxYear()}`,
    month_range: "✦ Month must be between 1 and 12",
    day_range: "✦ Day must be between 1 and 31",
    invalid_day_for_month: "✦ This day does not exist in the selected month",
    invalid: "✦ Please enter a valid date",
  },
  he: {
    future: "✦ לא ניתן להזין תאריך עתידי",
    year_range: `✦ השנה חייבת להיות בין ${MIN_YEAR} לבין ${getMaxYear()}`,
    month_range: "✦ החודש חייב להיות בין 1 ל-12",
    day_range: "✦ היום חייב להיות בין 1 ל-31",
    invalid_day_for_month: "✦ היום לא קיים בחודש שנבחר",
    invalid: "✦ נא להזין תאריך תקין",
  },
  ru: {
    future: "✦ Будущие даты не допускаются",
    year_range: `✦ Год должен быть от ${MIN_YEAR} до ${getMaxYear()}`,
    month_range: "✦ Месяц должен быть от 1 до 12",
    day_range: "✦ День должен быть от 1 до 31",
    invalid_day_for_month: "✦ Такого дня в этом месяце не существует",
    invalid: "✦ Введите корректную дату",
  },
  ar: {
    future: "✦ لا يُسمح بتواريخ مستقبلية",
    year_range: `✦ يجب أن تكون السنة بين ${MIN_YEAR} و ${getMaxYear()}`,
    month_range: "✦ يجب أن يكون الشهر بين 1 و 12",
    day_range: "✦ يجب أن يكون اليوم بين 1 و 31",
    invalid_day_for_month: "✦ هذا اليوم غير موجود في الشهر المحدد",
    invalid: "✦ يرجى إدخال تاريخ صالح",
  },
};

export function getDateErrorMessage(code: DateErrorCode, language: DateLang): string {
  const lang = (language || "en").toLowerCase();
  return (MESSAGES[lang] || MESSAGES.en)[code];
}
