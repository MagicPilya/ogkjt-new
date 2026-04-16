import type { Core } from '@strapi/strapi';

import { DEFAULT_MENU_LOCALE } from './constants';
import { DEFAULT_PAGE_CONTENT, MENU_POPULATE, MENU_SYNC_DEDUP_WINDOW_MS, MENU_SYNC_STORE_KEY } from './menu-sync/config';
import { collectUrlTitleFromMenu, getMainMenu, getTitleForUrl, normalizeUrl, pickBetterCandidate, resolveLocale } from './menu-sync/helpers';
import { dedupePagesForAllLocales } from './menu-sync/page-dedupe';
import { mirrorMenuToOtherLocales } from './menu-sync/menu-mirror';
import { pickBestRecord, publishPageLocale, type PageLocaleRecord } from './menu-sync/page-sync';
import type { MenuDocument, MenuPageItem, MenuSection } from './types';
const menuSyncLocksByLocale = new Map<string, Promise<void>>();
const lastMenuSyncFingerprintByLocale = new Map<string, string>();
const lastMenuSyncAtByLocale = new Map<string, number>();

async function getPreviouslySyncedUrls(strapi: Core.Strapi, locale: string): Promise<string[]> {
  const store = strapi.store({ type: 'core', name: 'menu-sync' });
  const raw = (await store.get({ key: MENU_SYNC_STORE_KEY })) as Record<string, unknown> | null;
  const byLocale = raw ?? {};
  const value = byLocale[locale];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

async function setPreviouslySyncedUrls(strapi: Core.Strapi, locale: string, urls: string[]) {
  const store = strapi.store({ type: 'core', name: 'menu-sync' });
  const raw = (await store.get({ key: MENU_SYNC_STORE_KEY })) as Record<string, unknown> | null;
  const byLocale = raw ?? {};
  await store.set({
    key: MENU_SYNC_STORE_KEY,
    value: {
      ...byLocale,
      [locale]: urls,
    },
  });
}

async function withLocaleSyncLock(strapi: Core.Strapi, locale: string, task: () => Promise<void>) {
  const previous = menuSyncLocksByLocale.get(locale) ?? Promise.resolve();
  const current = previous
    .catch((): void => undefined)
    .then(async () => {
      await task();
    });
  menuSyncLocksByLocale.set(locale, current);
  try {
    await current;
  } finally {
    if (menuSyncLocksByLocale.get(locale) === current) {
      menuSyncLocksByLocale.delete(locale);
    }
  }
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

export async function syncPagesByItems(strapi: Core.Strapi, toCreate: MenuPageItem[], locale = DEFAULT_MENU_LOCALE) {
  const desiredItems = new Map<string, string>();
  for (const item of toCreate) {
    const normalizedUrl = normalizeUrl(item.pageUrl);
    if (!desiredItems.has(normalizedUrl)) {
      desiredItems.set(normalizedUrl, item.title);
    }
  }
  const desiredUrls = Array.from(desiredItems.keys());
  const desiredUrlSet = new Set(desiredUrls);
  const previouslySyncedUrls = await getPreviouslySyncedUrls(strapi, locale);
  const urlsToDelete = previouslySyncedUrls.filter((url) => !desiredUrlSet.has(url));

  if (urlsToDelete.length > 0) {
    const stalePages = (await strapi.documents('api::page.page').findMany({
      filters: { pageUrl: { $in: urlsToDelete } },
      fields: ['documentId', 'pageUrl'],
      locale,
    })) as Array<{ documentId?: string; pageUrl?: string }>;

    await Promise.all(
      stalePages
        .filter((page): page is { documentId: string; pageUrl: string } => Boolean(page.documentId && page.pageUrl))
        .map(async (page) => {
          await strapi.documents('api::page.page').delete({
            documentId: page.documentId,
            locale,
          });
        })
    );
  }

  if (!toCreate.length) {
    await setPreviouslySyncedUrls(strapi, locale, []);
    return;
  }

  const pageQuery = strapi.db.query('api::page.page') as {
    findMany: (params?: unknown) => Promise<
      Array<{
        documentId?: string;
        pageUrl?: string;
        title?: string;
        locale?: string;
        content?: unknown;
        updatedAt?: string;
        publishedAt?: string | null;
      }>
    >;
  };
  const allLocalePages = (await pageQuery.findMany({
    select: ['documentId', 'pageUrl', 'title', 'locale', 'content', 'updatedAt', 'publishedAt'],
    where: {
      pageUrl: { $in: desiredUrls },
      publishedAt: { $notNull: true },
    },
  })) as Array<PageLocaleRecord>;

  const allLocalesByUrl = new Map<string, PageLocaleRecord[]>();
  for (const page of allLocalePages) {
    if (!page?.documentId || !page?.pageUrl) continue;
    const normalizedUrl = normalizeUrl(page.pageUrl);
    const list = allLocalesByUrl.get(normalizedUrl) ?? [];
    list.push({ ...page, pageUrl: normalizedUrl });
    allLocalesByUrl.set(normalizedUrl, list);
  }

  for (const [normalizedUrl, title] of desiredItems.entries()) {
    const allForUrl = allLocalesByUrl.get(normalizedUrl) ?? [];
    const canonical =
      allForUrl.find((page) => page.locale === DEFAULT_MENU_LOCALE) ??
      pickBestRecord(allForUrl);
    const localeRecords = allForUrl.filter((page) => page.locale === locale);
    const bestLocaleRecord = pickBestRecord(localeRecords);

    let activeDocumentId = canonical?.documentId;
    let createdInCurrentSync = false;
    if (!activeDocumentId) {
      const created = await strapi.documents('api::page.page').create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi create typings are narrower than runtime support.
        data: { pageUrl: normalizedUrl, title, content: DEFAULT_PAGE_CONTENT } as any,
        status: 'published',
        locale,
      });
      activeDocumentId = (created as { documentId?: string } | null)?.documentId;
      createdInCurrentSync = Boolean(activeDocumentId);
    }
    if (!activeDocumentId) continue;

    const deletedDocumentIds = new Set<string>();
    if (bestLocaleRecord && bestLocaleRecord.documentId !== activeDocumentId) {
      const sourceLocalized = (await strapi.documents('api::page.page').findOne({
        documentId: bestLocaleRecord.documentId,
        locale,
      })) as { content?: unknown } | null;
      await publishPageLocale(strapi, activeDocumentId, locale, {
        pageUrl: normalizedUrl,
        title,
        content: sourceLocalized?.content ?? DEFAULT_PAGE_CONTENT,
      });
      await strapi.documents('api::page.page').delete({
        documentId: bestLocaleRecord.documentId,
        locale,
      });
      deletedDocumentIds.add(bestLocaleRecord.documentId);
    } else if (!bestLocaleRecord && !createdInCurrentSync) {
      await publishPageLocale(strapi, activeDocumentId, locale, {
        pageUrl: normalizedUrl,
        title,
        content: DEFAULT_PAGE_CONTENT,
      });
    } else {
      await publishPageLocale(strapi, activeDocumentId, locale, {
        pageUrl: normalizedUrl,
        title,
      });
    }

    const sameLocaleDuplicates = localeRecords.filter(
      (record) => record.documentId !== activeDocumentId && !deletedDocumentIds.has(record.documentId)
    );
    for (const duplicate of sameLocaleDuplicates) {
      await strapi.documents('api::page.page').delete({
        documentId: duplicate.documentId,
        locale,
      });
    }
  }

  await setPreviouslySyncedUrls(strapi, locale, desiredUrls);
}

export async function syncPagesFromMainMenu(strapi: Core.Strapi, locale = DEFAULT_MENU_LOCALE) {
  await withLocaleSyncLock(strapi, locale, async () => {
    const menuDoc = await strapi.documents('api::menu.menu').findFirst({
      status: 'published',
      locale,
      populate: MENU_POPULATE as never,
    });

    const toCreate = collectUrlTitleFromMenu(getMainMenu(menuDoc));
    const fingerprint = JSON.stringify(
      toCreate.map((item) => ({ pageUrl: normalizeUrl(item.pageUrl), title: item.title.trim() }))
    );
    const now = Date.now();
    const lastFingerprint = lastMenuSyncFingerprintByLocale.get(locale);
    const lastSyncAt = lastMenuSyncAtByLocale.get(locale) ?? 0;
    const isDuplicateRun = lastFingerprint === fingerprint && now - lastSyncAt < MENU_SYNC_DEDUP_WINDOW_MS;
    if (isDuplicateRun) {
      return;
    }

    await syncPagesByItems(strapi, toCreate, locale);
    lastMenuSyncFingerprintByLocale.set(locale, fingerprint);
    lastMenuSyncAtByLocale.set(locale, now);
  });
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
    const denyRequest = (message: string) => {
      ctx.status = 403;
      ctx.body = {
        data: null,
        error: {
          status: 403,
          name: 'ForbiddenError',
          message,
          details: {},
        },
      };
    };

    const queryLocale = typeof ctx.query?.locale === 'string' ? ctx.query.locale : undefined;
    const body = (ctx.request.body ?? {}) as { locale?: unknown; data?: { locale?: unknown } };
    const bodyLocale = typeof body.locale === 'string' ? body.locale : undefined;
    const bodyDataLocale = typeof body.data?.locale === 'string' ? body.data.locale : undefined;
    const locale = resolveLocale(queryLocale ?? bodyLocale ?? bodyDataLocale);

    const isPageCreateRoute = ctx.method === 'POST' && ctx.path === '/content-manager/collection-types/api::page.page';
    const isPageDeleteRoute = ctx.method === 'DELETE' && ctx.path.startsWith('/content-manager/collection-types/api::page.page/');
    const isPageBulkDeleteRoute =
      ctx.method === 'POST' && ctx.path === '/content-manager/collection-types/api::page.page/actions/bulkDelete';
    const isPageDeleteAllLocalesRoute =
      ctx.method === 'POST' && ctx.path === '/content-manager/collection-types/api::page.page/actions/delete';
    if (isPageCreateRoute) {
      const bodyDocumentId = (ctx.request.body as { documentId?: unknown; data?: { documentId?: unknown } } | undefined)
        ?.documentId;
      const bodyDataDocumentId = (ctx.request.body as { documentId?: unknown; data?: { documentId?: unknown } } | undefined)
        ?.data?.documentId;
      const isLocalizationCreate = typeof bodyDocumentId === 'string' || typeof bodyDataDocumentId === 'string';
      if (!isLocalizationCreate) {
        denyRequest('Создание страниц вручную запрещено. Страницы создаются из меню.');
        return;
      }
    }
    if (isPageDeleteRoute || isPageBulkDeleteRoute || isPageDeleteAllLocalesRoute) {
      denyRequest('Удаление страниц вручную запрещено. Удаляйте пункт в меню.');
      return;
    }

    await next();
    if (ctx.status >= 400) return;

    const isMenuPublishRoute = ctx.method === 'POST' && ctx.path === '/content-manager/single-types/api::menu.menu/actions/publish';
    const isMenuSaveRoute = (ctx.method === 'PUT' || ctx.method === 'POST') && ctx.path === '/content-manager/single-types/api::menu.menu';
    if (isMenuPublishRoute || isMenuSaveRoute) {
      try {
        await mirrorMenuToOtherLocales(strapi, locale);
      } catch (error) {
        const err = error as { message?: string; details?: unknown };
        strapi.log.error(
          `[api::menu.menu] Mirror failed after ${ctx.method} ${ctx.path}: ${err?.message ?? 'unknown'} ${
            err?.details ? JSON.stringify(err.details) : ''
          }`
        );
      }
    }
  });
}
