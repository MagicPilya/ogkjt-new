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
const MENU_SYNC_STORE_KEY = 'page-urls-by-locale';
const DEFAULT_PAGE_CONTENT = [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
const MENU_SYNC_DEDUP_WINDOW_MS = 5000;
const menuSyncLocksByLocale = new Map<string, Promise<void>>();
const lastMenuSyncFingerprintByLocale = new Map<string, string>();
const lastMenuSyncAtByLocale = new Map<string, number>();

function getContentTextScore(value: unknown): number {
  if (typeof value === 'string') {
    return value.trim().length;
  }
  if (Array.isArray(value)) {
    return value.reduce<number>((total, item) => total + getContentTextScore(item), 0);
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).reduce<number>(
      (total, item) => total + getContentTextScore(item),
      0
    );
  }
  return 0;
}

function pickBetterCandidate<T extends { content?: unknown; title?: string; updatedAt?: string }>(a: T, b: T): T {
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

function normalizeUrl(url: string): string {
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

function getMainMenu(menuDoc: unknown): MenuSection[] {
  return (menuDoc as MenuDocument)?.mainMenu ?? [];
}

function resolveLocale(locale: unknown): string {
  return typeof locale === 'string' && locale.trim() ? locale : DEFAULT_MENU_LOCALE;
}

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
    .catch(() => undefined)
    .then(async () => {
      await task();
    });
  menuSyncLocksByLocale.set(locale, current);
  try {
    await current;
  } finally {
    if (menuSyncLocksByLocale.get(locale) === current) {
      menuSyncLocksByLocale.delete(locale);
      strapi.log.debug(`Menu sync lock released [${locale}]`);
    }
  }
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

type PageLocaleRecord = {
  documentId: string;
  pageUrl: string;
  title?: string;
  locale?: string;
  content?: unknown;
  updatedAt?: string;
};

function pickBestRecord(records: PageLocaleRecord[]): PageLocaleRecord | undefined {
  if (!records.length) return undefined;
  return records.reduce((best, current) => pickBetterCandidate(best, current));
}

async function publishPageLocale(
  strapi: Core.Strapi,
  documentId: string,
  locale: string,
  data: { pageUrl: string; title: string; content?: unknown }
) {
  await strapi.documents('api::page.page').update({
    documentId,
    locale,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi update typings are narrower than runtime support.
    data: data as any,
  });
  await strapi.documents('api::page.page').update({
    documentId,
    locale,
    status: 'published',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi update typings are narrower than runtime support.
    data: data as any,
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
          strapi.log.info(`Page removed after menu delete [${locale}]: ${page.pageUrl}`);
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
      strapi.log.info(`Page created from mainMenu [${locale}]: ${normalizedUrl} (${title})`);
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
      strapi.log.info(`Page merged into canonical document [${locale}]: ${normalizedUrl}`);
    } else if (!bestLocaleRecord && !createdInCurrentSync) {
      await publishPageLocale(strapi, activeDocumentId, locale, {
        pageUrl: normalizedUrl,
        title,
        content: DEFAULT_PAGE_CONTENT,
      });
      strapi.log.info(`Page localization created from mainMenu [${locale}]: ${normalizedUrl}`);
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
      strapi.log.info(`Duplicate page removed during sync [${locale}]: ${normalizedUrl}`);
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
      strapi.log.info(`Menu sync skipped as duplicate [${locale}]`);
      return;
    }

    await syncPagesByItems(strapi, toCreate, locale);
    lastMenuSyncFingerprintByLocale.set(locale, fingerprint);
    lastMenuSyncAtByLocale.set(locale, now);
  });
}

type MenuMirrorSublink = { title?: string; url?: string | null };
type MenuMirrorLink = { title?: string; url?: string | null; sublinks?: MenuMirrorSublink[] };
type MenuMirrorSection = { title?: string; url?: string | null; links?: MenuMirrorLink[] };

function stripComponentIdsDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripComponentIdsDeep(item)) as T;
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (key === 'id' || key === '__component') continue;
      result[key] = stripComponentIdsDeep(nested);
    }
    return result as T;
  }
  return value;
}

function mergeMenuMissingOnly(
  sourceMenu: MenuMirrorSection[] | undefined,
  targetMenu: MenuMirrorSection[] | undefined
): { merged: MenuMirrorSection[]; changed: boolean } {
  const source = sourceMenu ?? [];
  const target = [...(targetMenu ?? [])];
  let changed = false;

  const getItemKey = (item: Record<string, unknown>) => {
    const urlCandidate = (item.url ?? item.pageUrl ?? item.slug ?? item.link) as string | null | undefined;
    const titleCandidate = (item.title ?? item.name ?? item.label) as string | undefined;
    const normalizedUrl = normalizeUrl(urlCandidate ?? '');
    if (normalizedUrl && normalizedUrl !== '/') return `url:${normalizedUrl}`;
    const normalizedTitle = (titleCandidate ?? '').trim().toLowerCase();
    if (normalizedTitle) return `title:${normalizedTitle}`;
    return '';
  };

  const reorderBySourceOrder = <T extends Record<string, unknown>>(sourceItems: T[], targetItems: T[]): T[] => {
    const orderByKey = new Map<string, number>();
    sourceItems.forEach((item, index) => {
      const key = getItemKey(item);
      if (key && !orderByKey.has(key)) {
        orderByKey.set(key, index);
      }
    });

    const indexed = targetItems.map((item, index) => ({ item, index }));
    const reordered = [...indexed].sort((left, right) => {
      const leftKey = getItemKey(left.item);
      const rightKey = getItemKey(right.item);
      const leftOrder = leftKey ? orderByKey.get(leftKey) : undefined;
      const rightOrder = rightKey ? orderByKey.get(rightKey) : undefined;

      if (leftOrder !== undefined && rightOrder !== undefined) return leftOrder - rightOrder;
      if (leftOrder !== undefined) return -1;
      if (rightOrder !== undefined) return 1;
      return left.index - right.index;
    });

    if (reordered.some((entry, index) => entry.index !== index)) {
      changed = true;
    }

    return reordered.map((entry) => entry.item);
  };

  const mergeSublinks = (sourceSublinks: MenuMirrorSublink[] | undefined, targetSublinks: MenuMirrorSublink[] | undefined) => {
    const src = sourceSublinks ?? [];
    const tgt = [...(targetSublinks ?? [])];
    const sourceKeys = new Set(src.map((item) => getItemKey(item as unknown as Record<string, unknown>)).filter(Boolean));

    for (let i = tgt.length - 1; i >= 0; i -= 1) {
      const key = getItemKey(tgt[i] as unknown as Record<string, unknown>);
      if (!key || sourceKeys.has(key)) continue;
      tgt.splice(i, 1);
      changed = true;
    }

    for (const srcItem of src) {
      const srcKey = getItemKey(srcItem as unknown as Record<string, unknown>);
      if (!srcKey) continue;
      const idx = tgt.findIndex((item) => getItemKey(item as unknown as Record<string, unknown>) === srcKey);
      if (idx === -1) {
        tgt.push({ title: srcItem.title ?? '', url: srcItem.url ?? null });
        changed = true;
        continue;
      }
      if ((!tgt[idx].title || !String(tgt[idx].title).trim()) && srcItem.title) {
        tgt[idx] = { ...tgt[idx], title: srcItem.title };
        changed = true;
      }
    }
    return reorderBySourceOrder(src as Array<Record<string, unknown>>, tgt as Array<Record<string, unknown>>) as MenuMirrorSublink[];
  };

  const mergeLinks = (sourceLinks: MenuMirrorLink[] | undefined, targetLinks: MenuMirrorLink[] | undefined) => {
    const src = sourceLinks ?? [];
    const tgt = [...(targetLinks ?? [])];
    const sourceKeys = new Set(src.map((item) => getItemKey(item as unknown as Record<string, unknown>)).filter(Boolean));

    for (let i = tgt.length - 1; i >= 0; i -= 1) {
      const key = getItemKey(tgt[i] as unknown as Record<string, unknown>);
      if (!key || sourceKeys.has(key)) continue;
      tgt.splice(i, 1);
      changed = true;
    }

    for (const srcItem of src) {
      const srcKey = getItemKey(srcItem as unknown as Record<string, unknown>);
      if (!srcKey) continue;
      const idx = tgt.findIndex((item) => getItemKey(item as unknown as Record<string, unknown>) === srcKey);
      if (idx === -1) {
        tgt.push({
          title: srcItem.title ?? '',
          url: srcItem.url ?? null,
          sublinks: mergeSublinks(srcItem.sublinks, []),
        });
        changed = true;
        continue;
      }
      const current = tgt[idx];
      const nextTitle = (!current.title || !String(current.title).trim()) && srcItem.title ? srcItem.title : current.title;
      const nextSublinks = mergeSublinks(srcItem.sublinks, current.sublinks);
      if (nextTitle !== current.title || nextSublinks !== current.sublinks) {
        tgt[idx] = { ...current, title: nextTitle, sublinks: nextSublinks };
        changed = true;
      }
    }
    return reorderBySourceOrder(src as Array<Record<string, unknown>>, tgt as Array<Record<string, unknown>>) as MenuMirrorLink[];
  };

  for (const srcSection of source) {
    const srcKey = getItemKey(srcSection as unknown as Record<string, unknown>);
    if (!srcKey) continue;
    const idx = target.findIndex((item) => getItemKey(item as unknown as Record<string, unknown>) === srcKey);
    if (idx === -1) {
      target.push({
        title: srcSection.title ?? '',
        url: srcSection.url ?? null,
        links: mergeLinks(srcSection.links, []),
      });
      changed = true;
      continue;
    }
    const current = target[idx];
    const nextTitle = (!current.title || !String(current.title).trim()) && srcSection.title ? srcSection.title : current.title;
    const nextLinks = mergeLinks(srcSection.links, current.links);
    if (nextTitle !== current.title || nextLinks !== current.links) {
      target[idx] = { ...current, title: nextTitle, links: nextLinks };
      changed = true;
    }
  }

  const sourceSectionKeys = new Set(source.map((item) => getItemKey(item as unknown as Record<string, unknown>)).filter(Boolean));
  for (let i = target.length - 1; i >= 0; i -= 1) {
    const key = getItemKey(target[i] as unknown as Record<string, unknown>);
    if (!key || sourceSectionKeys.has(key)) continue;
    target.splice(i, 1);
    changed = true;
  }

  const reorderedSections = reorderBySourceOrder(
    source as Array<Record<string, unknown>>,
    target as Array<Record<string, unknown>>
  ) as MenuMirrorSection[];

  return { merged: reorderedSections, changed };
}

async function mirrorMenuToOtherLocales(strapi: Core.Strapi, sourceLocale: string) {
  const sourceDoc = (await strapi.documents('api::menu.menu').findFirst({
    status: 'published',
    locale: sourceLocale,
    populate: MENU_POPULATE as never,
  })) as { documentId?: string; mainMenu?: MenuMirrorSection[] } | null;
  if (!sourceDoc?.documentId) return;

  const localeQuery = strapi.db.query('plugin::i18n.locale') as {
    findMany: (params?: unknown) => Promise<Array<{ code?: string }>>;
  };
  const localeRows = await localeQuery.findMany({ select: ['code'] });
  const localeCodes = localeRows.map((row) => (typeof row?.code === 'string' ? row.code.trim() : '')).filter(Boolean);
  strapi.log.info(`[api::menu.menu] Mirror run source=${sourceLocale} locales=${localeCodes.join(',')}`);

  for (const targetLocale of localeCodes) {
    if (targetLocale === sourceLocale) continue;
    const targetDoc = (await strapi.documents('api::menu.menu').findFirst({
      status: 'published',
      locale: targetLocale,
      populate: MENU_POPULATE as never,
    })) as { documentId?: string; mainMenu?: MenuMirrorSection[] } | null;
    const targetDocumentId = targetDoc?.documentId ?? sourceDoc.documentId;

    const { merged, changed } = mergeMenuMissingOnly(sourceDoc.mainMenu, targetDoc?.mainMenu);
    strapi.log.info(
      `[api::menu.menu] Mirror evaluate ${sourceLocale} -> ${targetLocale} changed=${changed} sourceItems=${
        sourceDoc.mainMenu?.length ?? 0
      } targetItems=${targetDoc?.mainMenu?.length ?? 0}`
    );
    if (!changed) continue;

    const sanitizedMainMenu = stripComponentIdsDeep(merged);
    await strapi.documents('api::menu.menu').update({
      documentId: targetDocumentId,
      locale: targetLocale,
      status: 'published',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi update typings are narrower than runtime support.
      data: { mainMenu: sanitizedMainMenu } as any,
    });
    strapi.log.info(`[api::menu.menu] Mirrored menu missing items ${sourceLocale} -> ${targetLocale}`);
  }
}

export async function dedupePagesForAllLocales(strapi: Core.Strapi) {
  const localeQuery = strapi.db.query('plugin::i18n.locale') as {
    findMany: (params?: unknown) => Promise<Array<{ code?: string }>>;
  };
  const localeRows = await localeQuery.findMany({ select: ['code'] });
  const localeCodes = Array.from(
    new Set(
      localeRows
        .map((locale) => (typeof locale?.code === 'string' ? locale.code.trim() : ''))
        .filter(Boolean)
    )
  );
  if (!localeCodes.includes(DEFAULT_MENU_LOCALE)) localeCodes.unshift(DEFAULT_MENU_LOCALE);

  const pageQuery = strapi.db.query('api::page.page') as {
    findMany: (params?: unknown) => Promise<
      Array<{
        documentId?: string;
        pageUrl?: string;
        locale?: string;
        title?: string;
        content?: unknown;
        updatedAt?: string;
        publishedAt?: string | null;
      }>
    >;
  };
  const pages = await pageQuery.findMany({
    select: ['documentId', 'pageUrl', 'locale', 'title', 'content', 'updatedAt', 'publishedAt'],
    where: {
      publishedAt: { $notNull: true },
    },
  });

  const duplicatesByLocaleUrl = new Map<
    string,
    Array<{ documentId: string; pageUrl: string; locale: string; title?: string; content?: unknown; updatedAt?: string }>
  >();
  for (const page of pages) {
    if (!page?.documentId || !page?.pageUrl || !page?.locale) continue;
    const key = `${page.locale}::${normalizeUrl(page.pageUrl).toLowerCase()}`;
    const list = duplicatesByLocaleUrl.get(key) ?? [];
    list.push({
      documentId: page.documentId,
      pageUrl: normalizeUrl(page.pageUrl),
      locale: page.locale,
      title: page.title,
      content: page.content,
      updatedAt: page.updatedAt,
    });
    duplicatesByLocaleUrl.set(key, list);
  }

  let removedDuplicates = 0;
  const removeDuplicate = async (dup: { documentId: string; locale: string; pageUrl: string }, reason: string) => {
    await strapi.documents('api::page.page').delete({
      documentId: dup.documentId,
      locale: dup.locale,
    });
    removedDuplicates += 1;
    strapi.log.info(`Duplicate page removed manually (${reason}) [${dup.locale}]: ${dup.pageUrl}`);
  };

  for (const [, list] of duplicatesByLocaleUrl) {
    if (list.length <= 1) continue;
    const keep = list.reduce((best, current) => pickBetterCandidate(best, current));
    const toDelete = list.filter((item) => item.documentId !== keep.documentId);
    await Promise.all(
      toDelete.map(async (dup) => {
        await removeDuplicate(dup, 'locale+url');
      })
    );
    strapi.log.info(`Manual dedupe kept canonical [${keep.locale}]: ${keep.pageUrl}`);
  }

  // Fallback pass: handle rare "ghost" duplicates where URL differs only by hidden chars/case but same title.
  const byLocaleTitle = new Map<
    string,
    Array<{ documentId: string; locale: string; pageUrl: string; title?: string; content?: unknown; updatedAt?: string }>
  >();
  for (const page of pages) {
    if (!page?.documentId || !page?.locale) continue;
    const rawTitle = typeof (page as { title?: unknown }).title === 'string' ? ((page as { title: string }).title || '').trim() : '';
    if (!rawTitle) continue;
    const key = `${page.locale}::${rawTitle.toLowerCase()}`;
    const list = byLocaleTitle.get(key) ?? [];
    list.push({
      documentId: page.documentId,
      locale: page.locale,
      pageUrl: normalizeUrl(page.pageUrl ?? ''),
      title: rawTitle,
      content: page.content,
      updatedAt: page.updatedAt,
    });
    byLocaleTitle.set(key, list);
  }
  for (const [, list] of byLocaleTitle) {
    if (list.length <= 1) continue;
    const byUrl = new Map<
      string,
      Array<{ documentId: string; locale: string; pageUrl: string; title?: string; content?: unknown; updatedAt?: string }>
    >();
    for (const item of list) {
      const key = item.pageUrl.toLowerCase();
      const arr = byUrl.get(key) ?? [];
      arr.push(item);
      byUrl.set(key, arr);
    }
    for (const [, sameUrl] of byUrl) {
      if (sameUrl.length <= 1) continue;
      const keep = sameUrl.reduce((best, current) => pickBetterCandidate(best, current));
      await Promise.all(
        sameUrl.filter((item) => item.documentId !== keep.documentId).map(async (dup) => {
          await removeDuplicate(dup, 'locale+title+url');
        })
      );
    }
  }

  const pagesAfterDedupe = await pageQuery.findMany({
    select: ['documentId', 'pageUrl', 'locale', 'title', 'content', 'updatedAt', 'publishedAt'],
    where: {
      publishedAt: { $notNull: true },
    },
  });
  const byUrlAcrossLocales = new Map<
    string,
    Array<{ documentId: string; pageUrl: string; locale: string; title?: string; content?: unknown; updatedAt?: string }>
  >();
  for (const page of pagesAfterDedupe) {
    if (!page?.documentId || !page?.pageUrl || !page?.locale) continue;
    const key = normalizeUrl(page.pageUrl).toLowerCase();
    const list = byUrlAcrossLocales.get(key) ?? [];
    list.push({
      documentId: page.documentId,
      pageUrl: normalizeUrl(page.pageUrl),
      locale: page.locale,
      title: page.title,
      content: page.content,
      updatedAt: page.updatedAt,
    });
    byUrlAcrossLocales.set(key, list);
  }

  let relinkedLocales = 0;
  for (const [normalizedUrl, list] of byUrlAcrossLocales) {
    if (list.length <= 1) continue;
    const defaultLocaleDoc = list.find((item) => item.locale === DEFAULT_MENU_LOCALE);
    const canonical = defaultLocaleDoc ?? list.reduce((best, current) => pickBetterCandidate(best, current));
    if (!canonical) continue;

    const latestByLocale = new Map<
      string,
      { documentId: string; pageUrl: string; locale: string; title?: string; content?: unknown; updatedAt?: string }
    >();
    for (const item of list) {
      const prev = latestByLocale.get(item.locale);
      if (!prev) {
        latestByLocale.set(item.locale, item);
        continue;
      }
      const better = pickBetterCandidate(prev, item);
      if (better.documentId !== prev.documentId) {
        latestByLocale.set(item.locale, item);
      }
    }

    for (const [locale, source] of latestByLocale.entries()) {
      if (source.documentId === canonical.documentId) continue;

      const sourceLocalized = (await strapi.documents('api::page.page').findOne({
        documentId: source.documentId,
        locale,
      })) as { title?: string; content?: unknown } | null;

      await strapi.documents('api::page.page').update({
        documentId: canonical.documentId,
        locale,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi typings are narrower than runtime document payload.
        data: {
          pageUrl: normalizedUrl,
          ...(typeof sourceLocalized?.title === 'string' ? { title: sourceLocalized.title } : {}),
          ...(sourceLocalized?.content ? { content: sourceLocalized.content } : {}),
        } as any,
      });
      await strapi.documents('api::page.page').update({
        documentId: canonical.documentId,
        locale,
        status: 'published',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi typings are narrower than runtime document payload.
        data: {
          pageUrl: normalizedUrl,
          ...(typeof sourceLocalized?.title === 'string' ? { title: sourceLocalized.title } : {}),
          ...(sourceLocalized?.content ? { content: sourceLocalized.content } : {}),
        } as any,
      });

      await strapi.documents('api::page.page').delete({
        documentId: source.documentId,
        locale,
      });
      relinkedLocales += 1;
      strapi.log.info(`Locale re-linked to canonical document [${locale}]: ${normalizedUrl}`);
    }
  }

  return {
    scannedLocales: localeCodes.length,
    succeededLocales: localeCodes.length,
    failedLocales: 0,
    removedDuplicates,
    relinkedLocales,
    failed: [] as Array<{ locale: string; error: string }>,
  };
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
        strapi.log.warn(
          `[api::menu.menu] Mirror failed after ${ctx.method} ${ctx.path}: ${err?.message ?? 'unknown'} ${
            err?.details ? JSON.stringify(err.details) : ''
          }`
        );
      }
    }
  });
}
