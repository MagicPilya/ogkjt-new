/**
 * Фиксированные подписи календаря по локалям (ru, be, en).
 * Используем словари вместо Intl, чтобы сервер и клиент рендерили одинаково и не было hydration mismatch.
 */
import type { Locale } from "./i18n";

/** Полные названия месяцев (long), индекс 0 = январь */
export const MONTH_NAMES_LONG: Record<Locale, string[]> = {
  ru: [
    "январь", "февраль", "март", "апрель", "май", "июнь",
    "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
  ],
  be: [
    "студзень", "люты", "сакавік", "красавік", "май", "чэрвень",
    "ліпень", "жнівень", "верасень", "кастрычнік", "лістапад", "снежань",
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
};

/** Короткие названия месяцев (short) для дропдауна */
export const MONTH_NAMES_SHORT: Record<Locale, string[]> = {
  ru: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
  be: ["сту", "лют", "сак", "кра", "май", "чер", "ліп", "жні", "вер", "кас", "ліс", "сне"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/** Короткие названия дней недели (пн–вс для ru/be, Sun–Sat для en) */
export const WEEKDAY_NAMES_SHORT: Record<Locale, string[]> = {
  ru: ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
  be: ["нд", "пн", "аў", "ср", "чц", "пт", "сб"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

/** Суффикс года для подписи (ru: «г.», be/en: пусто или год как есть) */
export function formatCaption(month: Date, locale: Locale): string {
  const monthIndex = month.getMonth();
  const year = month.getFullYear();
  const monthName = MONTH_NAMES_LONG[locale][monthIndex];
  if (locale === "ru") return `${monthName} ${year} г.`;
  if (locale === "be") return `${monthName} ${year}`;
  return `${monthName} ${year}`;
}

export function formatMonthDropdown(month: Date, locale: Locale): string {
  return MONTH_NAMES_SHORT[locale][month.getMonth()];
}

export function formatWeekdayName(weekday: Date, locale: Locale): string {
  const dayIndex = weekday.getDay();
  return WEEKDAY_NAMES_SHORT[locale][dayIndex];
}

/** Дата для попапа календаря (день, месяц год) */
export function formatPopoverDate(date: Date, locale: Locale): string {
  const d = date.getDate();
  const monthName = MONTH_NAMES_LONG[locale][date.getMonth()];
  const year = date.getFullYear();
  if (locale === "ru") return `${d} ${monthName} ${year} г.`;
  return `${d} ${monthName} ${year}`;
}
