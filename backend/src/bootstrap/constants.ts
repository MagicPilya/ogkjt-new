export const DEFAULT_MENU_LOCALE = 'ru';

export const PUBLIC_PERMISSION_ACTIONS = [
  'api::article.article.find',
  'api::article.article.findOne',
  'api::dormitory-news.dormitory-news.find',
  'api::dormitory-news.dormitory-news.findOne',
  'api::spps-psy.spps-psy.find',
  'api::spps-psy.spps-psy.findOne',
  'api::spps-social.spps-social.find',
  'api::spps-social.spps-social.findOne',
  'api::ideology-item.ideology-item.find',
  'api::ideology-item.ideology-item.findOne',
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
  'api::spps-psy.spps-psy.find',
  'api::spps-psy.spps-psy.findOne',
  'api::spps-psy.spps-psy.create',
  'api::spps-psy.spps-psy.update',
  'api::spps-psy.spps-psy.delete',
  'api::spps-social.spps-social.find',
  'api::spps-social.spps-social.findOne',
  'api::spps-social.spps-social.create',
  'api::spps-social.spps-social.update',
  'api::spps-social.spps-social.delete',
  'api::ideology-item.ideology-item.find',
  'api::ideology-item.ideology-item.findOne',
  'api::ideology-item.ideology-item.create',
  'api::ideology-item.ideology-item.update',
  'api::ideology-item.ideology-item.delete',
] as const;

export const ANNUAL_THEME_FALLBACK_PAGE = {
  pageUrl: '/year-theme',
  title: 'Тематический год',
} as const;

