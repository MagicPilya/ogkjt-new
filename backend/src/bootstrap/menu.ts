import type { Core } from '@strapi/strapi';

import { ANNUAL_THEME_FALLBACK_PAGE, DEFAULT_MENU_LOCALE } from './constants';
import type { MenuDocument, MenuPageItem, MenuSection } from './types';

const MENU_POPULATE = {
  mainMenu: {
    populate: {
      links: { populate: ['sublinks'] },
    },
  },
};

function normalizeUrl(url: string): string {
  return url.startsWith('/') ? url : `/${url}`;
}

function getMainMenu(menuDoc: unknown): MenuSection[] {
  return (menuDoc as MenuDocument)?.mainMenu ?? [];
}

function resolveLocale(locale: unknown): string {
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

export function registerPageTitleAutofill(strapi: Core.Strapi) {
  strapi.documents.use(async (context, next) => {
    if (context.uid !== 'api::page.page' || (context.action !== 'create' && context.action !== 'update')) {
      return next();
    }

    const data = context.params?.data as { pageUrl?: string | null; title?: string | null } | undefined;
    if (!data) return next();
    let pageUrl = typeof data.pageUrl === 'string' ? data.pageUrl.trim() : '';
    const locale = resolveLocale(context.params?.locale);

    if (!pageUrl && context.action === 'update') {
      const documentId = (context.params as { documentId?: string } | undefined)?.documentId;
      if (documentId) {
        const existingPage = (await strapi.documents('api::page.page').findOne({
          documentId,
          locale,
        })) as { pageUrl?: string | null } | null;
        pageUrl = existingPage?.pageUrl?.trim() ?? '';
      }
    }

    if (!pageUrl) return next();

    let menuDoc = await strapi.documents('api::menu.menu').findFirst({
      status: 'published',
      locale,
      populate: MENU_POPULATE as never,
    });
    if (!menuDoc && locale !== DEFAULT_MENU_LOCALE) {
      menuDoc = await strapi.documents('api::menu.menu').findFirst({
        status: 'published',
        locale: DEFAULT_MENU_LOCALE,
        populate: MENU_POPULATE as never,
      });
    }

    const title = getTitleForUrl(getMainMenu(menuDoc), pageUrl);
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

export async function syncPagesByItems(strapi: Core.Strapi, toCreate: MenuPageItem[], locale = DEFAULT_MENU_LOCALE) {
  if (!toCreate.length) return;

  const pageUrls = toCreate.map((item) => item.pageUrl);
  const existingPages = (await strapi.documents('api::page.page').findMany({
    filters: { pageUrl: { $in: pageUrls } },
    fields: ['documentId', 'pageUrl', 'title'],
    locale,
  })) as Array<{ documentId?: string; pageUrl?: string; title?: string }>;

  const existingByUrl = new Map(
    existingPages
      .filter((page): page is { documentId: string; pageUrl: string; title?: string } => Boolean(page?.documentId && page?.pageUrl))
      .map((page) => [normalizeUrl(page.pageUrl), page])
  );

  await Promise.all(
    toCreate.map(async ({ pageUrl, title }) => {
      const normalizedUrl = normalizeUrl(pageUrl);
      const existing = existingByUrl.get(normalizedUrl);

      if (!existing) {
        await strapi.documents('api::page.page').create({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi create typings are narrower than runtime support.
          data: { pageUrl: normalizedUrl, title, content: [] } as any,
          status: 'published',
          locale,
        });
        strapi.log.info(`Page created from mainMenu [${locale}]: ${normalizedUrl} (${title})`);
        return;
      }

      if (existing.title !== title) {
        await strapi.documents('api::page.page').update({
          documentId: existing.documentId,
          locale,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi update typings are narrower than runtime support.
          data: { title } as any,
        });
        await strapi.documents('api::page.page').update({
          documentId: existing.documentId,
          locale,
          status: 'published',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi update typings are narrower than runtime support.
          data: { title } as any,
        });
        strapi.log.info(`Page title synced from mainMenu [${locale}]: ${normalizedUrl} (${title})`);
      }
    })
  );
}

export async function syncPagesFromMainMenu(strapi: Core.Strapi, locale = DEFAULT_MENU_LOCALE) {
  const menuDoc = await strapi.documents('api::menu.menu').findFirst({
    status: 'published',
    locale,
    populate: MENU_POPULATE as never,
  });

  const toCreate = collectUrlTitleFromMenu(getMainMenu(menuDoc));
  await syncPagesByItems(strapi, toCreate, locale);
}

export function registerPageSyncOnMenuChange(strapi: Core.Strapi) {
  const syncFromLifecycleEvent = async (
    event: { result?: { locale?: unknown }; params?: { data?: { locale?: unknown } } } | undefined
  ) => {
    const locale = resolveLocale(event?.result?.locale ?? event?.params?.data?.locale);
    await syncPagesFromMainMenu(strapi, locale);
  };

  strapi.db.lifecycles.subscribe({
    models: ['api::menu.menu'],
    async afterCreate(event) {
      await syncFromLifecycleEvent(event);
    },
    async afterUpdate(event) {
      await syncFromLifecycleEvent(event);
    },
  });

  strapi.server.use(async (ctx, next) => {
    const queryLocale = typeof ctx.query?.locale === 'string' ? ctx.query.locale : undefined;
    const body = (ctx.request.body ?? {}) as { locale?: unknown; data?: { locale?: unknown } };
    const bodyLocale = typeof body.locale === 'string' ? body.locale : undefined;
    const bodyDataLocale = typeof body.data?.locale === 'string' ? body.data.locale : undefined;
    const locale = resolveLocale(queryLocale ?? bodyLocale ?? bodyDataLocale);

    const isPageCollectionReadRoute =
      ctx.method === 'GET' &&
      (ctx.path === '/content-manager/collection-types/api::page.page' ||
        ctx.path.startsWith('/content-manager/collection-types/api::page.page/'));
    if (isPageCollectionReadRoute) {
      await syncPagesFromMainMenu(strapi, locale);
      await next();
      return;
    }

    await next();
    if (ctx.status >= 400) return;

    const isMenuPublishRoute = ctx.method === 'POST' && ctx.path === '/content-manager/single-types/api::menu.menu/actions/publish';
    const isMenuSaveRoute = (ctx.method === 'PUT' || ctx.method === 'POST') && ctx.path === '/content-manager/single-types/api::menu.menu';
    if (isMenuPublishRoute || isMenuSaveRoute) {
      await syncPagesFromMainMenu(strapi, locale);
    }
  });
}
