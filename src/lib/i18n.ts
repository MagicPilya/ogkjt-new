/**
 * Поддерживаемые локали сайта (контент из Strapi + маршруты).
 * Админка Strapi может оставаться на русском/английском.
 */
export const locales = ["ru", "be", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

/** Языковые метки для переключателя и SEO */
export const localeNames: Record<Locale, string> = {
  ru: "Русский",
  be: "Беларуская",
  en: "English",
};

/** Короткие коды для отображения (флаги/селектор) */
export const localeShortLabels: Record<Locale, string> = {
  ru: "RU",
  be: "BY",
  en: "EN",
};

/** Пометка при авто-переводе контента (новости и т.п.) */
export const translationDisclaimer: Record<Locale, string> = {
  ru: "Перевод может быть неточным",
  be: "Пераклад можа быць недакладным",
  en: "Translation may be inaccurate",
};

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
