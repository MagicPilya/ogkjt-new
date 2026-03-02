import type { Core } from '@strapi/strapi';

import { ANNUAL_THEME_FALLBACK_PAGE, DEFAULT_MENU_LOCALE } from './constants';
import type { MenuDocument, MenuPageItem, MenuSection } from './types';

function normalizeUrl(url: string): string {
  return url.startsWith('/') ? url : `/${url}`;
}

function getMainMenu(menuDoc: unknown): MenuSection[] {
  return (menuDoc as MenuDocument)?.mainMenu ?? [];
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

export function registerPageTitleAutofill(strapi: Core.Strapi) {
  strapi.documents.use(async (context, next) => {
    if (context.uid !== 'api::page.page' || (context.action !== 'create' && context.action !== 'update')) {
      return next();
    }

    const data = context.params?.data as { pageUrl?: string | null; title?: string | null } | undefined;
    if (!data?.pageUrl) return next();

    const menuDoc = await strapi.documents('api::menu.menu').findFirst({
      status: 'published',
      locale: DEFAULT_MENU_LOCALE,
    });

    const title = getTitleForUrl(getMainMenu(menuDoc), data.pageUrl);
    if (title) {
      (data as { title: string }).title = title;
    }

    return next();
  });
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

export async function syncPagesFromMainMenu(strapi: Core.Strapi) {
  const menuDoc = await strapi.documents('api::menu.menu').findFirst({
    status: 'published',
    locale: DEFAULT_MENU_LOCALE,
  });

  const toCreate = collectUrlTitleFromMenu(getMainMenu(menuDoc));
  if (!toCreate.length) return;

  const pageUrls = toCreate.map((item) => item.pageUrl);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi filter typings are narrower than runtime support.
  const existingPages = (await strapi.documents('api::page.page').findMany({
    filters: { pageUrl: { $in: pageUrls } },
    fields: ['pageUrl'],
  } as any)) as Array<{ pageUrl?: string }>;

  const existingPageUrls = new Set(existingPages.map((page) => page.pageUrl).filter(Boolean));
  const missingPages = toCreate.filter((item) => !existingPageUrls.has(item.pageUrl));

  await Promise.all(
    missingPages.map(async ({ pageUrl, title }) => {
      await strapi.documents('api::page.page').create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi create typings are narrower than runtime support.
        data: { pageUrl, title, content: [] } as any,
        status: 'published',
      });

      strapi.log.info(`Page created from mainMenu: ${pageUrl} (${title})`);
    })
  );
}
