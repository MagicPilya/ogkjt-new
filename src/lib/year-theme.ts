import type { Locale } from "./i18n";

export const yearTheme = {
  path: "/year-theme",
  fallbackTitle: {
    ru: "Тематический год",
    be: "Тэматычны год",
    en: "Thematic year",
  } as Record<Locale, string>,
  fallbackDescription: {
    ru: "Подробнее о тематическом году",
    be: "Падрабязней пра тэматычны год",
    en: "Learn more about the thematic year",
  } as Record<Locale, string>,
  fallbackCta: {
    ru: "Открыть страницу",
    be: "Адкрыць старонку",
    en: "Open page",
  } as Record<Locale, string>,
  mainPageBlockTitle: {
    ru: "Тематический год",
    be: "Тэматычны год",
    en: "Thematic year",
  } as Record<Locale, string>,
} as const;

export function normalizeYearThemePath(path?: string | null): string {
  if (!path || !path.trim()) return yearTheme.path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // Маршрут тематического года пока фиксированный (есть отдельная страница /year-theme).
  return normalized === yearTheme.path ? normalized : yearTheme.path;
}
