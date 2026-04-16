import type { Core } from '@strapi/strapi';

import { DEFAULT_MENU_LOCALE } from '../constants';
import { normalizeUrl, pickBetterCandidate } from './helpers';

type DedupPageRecord = {
  documentId: string;
  pageUrl: string;
  locale: string;
  title?: string;
  content?: unknown;
  updatedAt?: string;
};

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

  const duplicatesByLocaleUrl = new Map<string, DedupPageRecord[]>();
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
  const removeDuplicate = async (dup: { documentId: string; locale: string }, _reason: string) => {
    await strapi.documents('api::page.page').delete({
      documentId: dup.documentId,
      locale: dup.locale,
    });
    removedDuplicates += 1;
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
  }

  const byLocaleTitle = new Map<string, DedupPageRecord[]>();
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
    const byUrl = new Map<string, DedupPageRecord[]>();
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

  const byUrlAcrossLocales = new Map<string, DedupPageRecord[]>();
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

    const latestByLocale = new Map<string, DedupPageRecord>();
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
