import type { Core } from '@strapi/strapi';

import { MENU_POPULATE } from './config';
import { normalizeUrl } from './helpers';

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

export async function mirrorMenuToOtherLocales(strapi: Core.Strapi, sourceLocale: string) {
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

  for (const targetLocale of localeCodes) {
    if (targetLocale === sourceLocale) continue;
    const targetDoc = (await strapi.documents('api::menu.menu').findFirst({
      status: 'published',
      locale: targetLocale,
      populate: MENU_POPULATE as never,
    })) as { documentId?: string; mainMenu?: MenuMirrorSection[] } | null;
    const targetDocumentId = targetDoc?.documentId ?? sourceDoc.documentId;

    const { merged, changed } = mergeMenuMissingOnly(sourceDoc.mainMenu, targetDoc?.mainMenu);
    if (!changed) continue;

    const sanitizedMainMenu = stripComponentIdsDeep(merged);
    await strapi.documents('api::menu.menu').update({
      documentId: targetDocumentId,
      locale: targetLocale,
      status: 'published',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi update typings are narrower than runtime support.
      data: { mainMenu: sanitizedMainMenu } as any,
    });
  }
}
