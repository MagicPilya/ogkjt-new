import { ANNUAL_THEME_FALLBACK_PAGE, DEFAULT_MENU_LOCALE } from '../constants';
import type { MenuDocument, MenuPageItem, MenuSection } from '../types';

export function getContentTextScore(value: unknown): number {
  if (typeof value === 'string') {
    return value.trim().length;
  }
  if (Array.isArray(value)) {
    return value.reduce<number>((total, item) => total + getContentTextScore(item), 0);
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).reduce<number>((total, item) => total + getContentTextScore(item), 0);
  }
  return 0;
}

export function pickBetterCandidate<T extends { content?: unknown; title?: string; updatedAt?: string }>(a: T, b: T): T {
  const aContentScore = getContentTextScore(a.content);
  const bContentScore = getContentTextScore(b.content);
  if (aContentScore !== bContentScore) return aContentScore > bContentScore ? a : b;

  const aTitleScore = typeof a.title === 'string' ? a.title.trim().length : 0;
  const bTitleScore = typeof b.title === 'string' ? b.title.trim().length : 0;
  if (aTitleScore !== bTitleScore) return aTitleScore > bTitleScore ? a : b;

  if (a.updatedAt && b.updatedAt) {
    return a.updatedAt.localeCompare(b.updatedAt) >= 0 ? a : b;
  }
  if (a.updatedAt) return a;
  if (b.updatedAt) return b;
  return a;
}

export function normalizeUrl(url: string): string {
  const cleaned = (url || '').replace(/[\u0000-\u001F\u007F\u00A0\u200B-\u200D\u2060\uFEFF]/g, '');
  const trimmed = cleaned.trim();
  if (!trimmed) return '/';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const collapsedSlashes = withLeadingSlash.replace(/\/{2,}/g, '/');
  if (collapsedSlashes.length > 1 && collapsedSlashes.endsWith('/')) {
    return collapsedSlashes.slice(0, -1);
  }
  return collapsedSlashes;
}

export function getMainMenu(menuDoc: unknown): MenuSection[] {
  return (menuDoc as MenuDocument)?.mainMenu ?? [];
}

export function resolveLocale(locale: unknown): string {
  return typeof locale === 'string' && locale.trim() ? locale : DEFAULT_MENU_LOCALE;
}

export function getTitleForUrl(mainMenu: MenuSection[], pageUrl: string): string | null {
  const trimmedUrl = (pageUrl || '').trim();
  const withSlash = normalizeUrl(trimmedUrl);

  for (const section of mainMenu) {
    const sectionUrl = (section.url ?? '').trim();
    if (sectionUrl && (sectionUrl === withSlash || sectionUrl === trimmedUrl)) {
      return section.title ?? null;
    }

    for (const link of section.links ?? []) {
      const linkUrl = (link.url ?? '').trim();
      if (linkUrl && (linkUrl === withSlash || linkUrl === trimmedUrl)) {
        return link.title ?? null;
      }

      for (const sublink of link.sublinks ?? []) {
        const subUrl = (sublink.url ?? '').trim();
        if (subUrl && (subUrl === withSlash || subUrl === trimmedUrl)) {
          return sublink.title ?? null;
        }
      }
    }
  }

  if (withSlash === ANNUAL_THEME_FALLBACK_PAGE.pageUrl) {
    return ANNUAL_THEME_FALLBACK_PAGE.title;
  }

  return null;
}

export function collectUrlTitleFromMenu(mainMenu: MenuSection[]): MenuPageItem[] {
  const items = new Map<string, string>();

  const addItem = (url: string, title: string) => {
    const normalizedUrl = normalizeUrl(url);
    if (!items.has(normalizedUrl)) {
      items.set(normalizedUrl, title);
    }
  };

  for (const section of mainMenu) {
    const sectionUrl = (section.url ?? '').trim();
    if (sectionUrl) {
      addItem(sectionUrl, section.title || sectionUrl);
    }

    for (const link of section.links ?? []) {
      const linkUrl = (link.url ?? '').trim();
      if (linkUrl) {
        addItem(linkUrl, link.title || linkUrl);
      }

      for (const sublink of link.sublinks ?? []) {
        const subUrl = (sublink.url ?? '').trim();
        if (subUrl) {
          addItem(subUrl, sublink.title || subUrl);
        }
      }
    }
  }

  if (!items.has(ANNUAL_THEME_FALLBACK_PAGE.pageUrl)) {
    items.set(ANNUAL_THEME_FALLBACK_PAGE.pageUrl, ANNUAL_THEME_FALLBACK_PAGE.title);
  }

  return Array.from(items.entries()).map(([pageUrl, title]) => ({ pageUrl, title }));
}
