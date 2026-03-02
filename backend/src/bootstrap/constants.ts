export const DEFAULT_MENU_LOCALE = 'ru';

export const PUBLIC_PERMISSION_ACTIONS = [
  'api::article.article.find',
  'api::article.article.findOne',
  'api::event.event.find',
  'api::event.event.findOne',
  'api::page.page.find',
  'api::page.page.findOne',
  'api::global.global.find',
  'api::menu.menu.find',
  'api::administration.administration.find',
  'api::specialty.specialty.find',
  'api::admission-document.admission-document.find',
  'api::annual-symbol.annual-symbol.find',
] as const;

export const ANNUAL_THEME_FALLBACK_PAGE = {
  pageUrl: '/year-theme',
  title: 'Тематический год',
} as const;

export const SECTION_URL_TO_STRAPI: Record<string, string> = {
  '/news': 'НОВОСТИ КОЛЛЕДЖА',
  '/students/dormitory': 'НОВОСТИ ОБЩЕЖИТИЯ',
  '/about': 'О колледже',
  '/applicants': 'Абитуриентам',
  '/students': 'Обучающимся',
  '/ideology': 'Воспитательная работа',
  '/one-window': 'Одно окно',
  '/appeals': 'Электронные обращения',
};
