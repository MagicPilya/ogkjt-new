export const DEFAULT_MENU_LOCALE = 'ru';

export const PUBLIC_PERMISSION_ACTIONS = [
  'api::article.article.find',
  'api::article.article.findOne',
  'api::dormitory-news.dormitory-news.find',
  'api::dormitory-news.dormitory-news.findOne',
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

export const EDITOR_PERMISSION_ACTIONS = [
  'api::dormitory-news.dormitory-news.find',
  'api::dormitory-news.dormitory-news.findOne',
  'api::dormitory-news.dormitory-news.create',
  'api::dormitory-news.dormitory-news.update',
  'api::dormitory-news.dormitory-news.delete',
] as const;

export const ANNUAL_THEME_FALLBACK_PAGE = {
  pageUrl: '/year-theme',
  title: 'Тематический год',
} as const;

