import type { Core } from '@strapi/strapi';

const DEFAULT_LOCALE = 'ru';
const SINGLE_TYPE_PREFIX = '/content-manager/single-types/';

const MIRRORED_SINGLE_TYPE_UIDS = new Set([
  'api::administration.administration',
  'api::admission-document.admission-document',
  'api::specialty.specialty',
  'api::global.global',
]);
const DEFAULT_ARRAY_MERGE_KEYS = [
  'url',
  'pageUrl',
  'slug',
  'link',
  'code',
  'title',
  'name',
  'label',
  'fullName',
  'documentId',
  'id',
];
const ARRAY_MERGE_KEYS_BY_UID: Record<string, string[]> = {
  'api::global.global': ['url', 'title', 'label', 'name'],
  'api::administration.administration': ['photo.documentId', 'photo.id', 'contacts', 'url', 'fullName', 'name', 'title'],
  'api::admission-document.admission-document': ['url', 'title', 'label', 'name'],
  'api::specialty.specialty': ['code', 'slug', 'url', 'title', 'name'],
};
const POPULATE_BY_UID: Record<string, unknown> = {
  'api::administration.administration': {
    members: { populate: ['photo'] },
  },
  'api::global.global': {
    resources: true,
  },
  'api::specialty.specialty': {
    items: { populate: ['specializations', 'workerProfessions'] },
  },
};
const SYSTEM_FIELDS = new Set([
  'id',
  'documentId',
  'locale',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'createdBy',
  'updatedBy',
  'localizations',
]);

const mirrorLocks = new Map<string, Promise<void>>();
const suppressedMirrorKeys = new Set<string>();

function getMirrorKey(uid: string, documentId: string | undefined, locale: string): string {
  return `${uid}::${documentId}::${locale}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isMissingValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function isMergeKeyValue(value: unknown): value is string | number {
  return (typeof value === 'string' && value.trim().length > 0) || typeof value === 'number';
}

function getValueByPath(item: Record<string, unknown>, keyPath: string): unknown {
  if (!keyPath.includes('.')) return item[keyPath];
  const parts = keyPath.split('.');
  let current: unknown = item;
  for (const part of parts) {
    if (!isPlainObject(current)) return undefined;
    current = current[part];
  }
  return current;
}

function normalizeContactKey(value: unknown): string {
  if (typeof value !== 'string') return '';
  const digits = value.replace(/\D+/g, '');
  return digits.length >= 7 ? digits : '';
}

function extractMediaIdentity(value: unknown): unknown {
  if (value === null) return null;
  if (isPlainObject(value)) {
    if ('data' in value) {
      const data = value.data;
      if (data === null) return null;
      if (Array.isArray(data)) {
        return data
          .map((item) => extractMediaIdentity(item))
          .filter((item) => item !== undefined);
      }
      return extractMediaIdentity(data);
    }
    if (typeof value.id === 'number') return value.id;
    if (typeof value.documentId === 'string') return value.documentId;
  }
  return undefined;
}

function buildAdministrationPhotoPatch(source: unknown, target: unknown): Record<string, unknown> | undefined {
  if (!isPlainObject(source) || !isPlainObject(target)) return undefined;
  const sourceMembers = Array.isArray(source.members) ? source.members : [];
  const targetMembers = Array.isArray(target.members) ? target.members : [];
  if (!sourceMembers.length || !targetMembers.length) return undefined;

  const targetByContact = new Map<string, Record<string, unknown>>();
  for (const member of targetMembers) {
    if (!isPlainObject(member)) continue;
    const key = normalizeContactKey(member.contacts);
    if (key && !targetByContact.has(key)) {
      targetByContact.set(key, member);
    }
  }

  let changed = false;
  const patchedMembers = targetMembers.map((member) => (isPlainObject(member) ? { ...member } : member));
  for (let index = 0; index < sourceMembers.length; index += 1) {
    const sourceMember = sourceMembers[index];
    if (!isPlainObject(sourceMember)) continue;
    const sourcePhoto = extractMediaIdentity(sourceMember.photo);
    if (sourcePhoto === undefined) continue;

    const contactKey = normalizeContactKey(sourceMember.contacts);
    const matchedTarget =
      (contactKey ? targetByContact.get(contactKey) : undefined) ??
      (isPlainObject(patchedMembers[index]) ? (patchedMembers[index] as Record<string, unknown>) : undefined);
    if (!matchedTarget) continue;

    const currentPhoto = extractMediaIdentity(matchedTarget.photo);
    if (JSON.stringify(currentPhoto) === JSON.stringify(sourcePhoto)) continue;
    matchedTarget.photo = sourcePhoto;
    changed = true;
  }

  return changed ? { members: patchedMembers } : undefined;
}

function buildGlobalResourcesPatch(source: unknown, target: unknown): Record<string, unknown> | undefined {
  if (!isPlainObject(source) || !isPlainObject(target)) return undefined;
  const sourceResources = Array.isArray(source.resources) ? source.resources : [];
  const targetResources = Array.isArray(target.resources) ? target.resources : [];

  const normalizeResource = (item: unknown) => {
    if (!isPlainObject(item)) return null;
    const url = typeof item.url === 'string' ? item.url.trim() : '';
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!url) return null;
    return { url, title };
  };

  const normalizedSource = sourceResources
    .map(normalizeResource)
    .filter((item): item is { url: string; title: string } => item !== null);
  const normalizedTarget = targetResources
    .map(normalizeResource)
    .filter((item): item is { url: string; title: string } => item !== null);

  const sourceByUrl = new Map(normalizedSource.map((item) => [item.url, item]));
  const targetByUrl = new Map(normalizedTarget.map((item) => [item.url, item]));

  let changed = false;
  const merged: Array<{ url: string; title: string }> = [];

  for (const src of normalizedSource) {
    const targetItem = targetByUrl.get(src.url);
    if (!targetItem) {
      merged.push(src);
      changed = true;
      continue;
    }
    const keepLocalizedTitle = targetItem.title.trim().length > 0 ? targetItem.title : src.title;
    merged.push({ url: src.url, title: keepLocalizedTitle });
    if (keepLocalizedTitle !== targetItem.title) {
      changed = true;
    }
  }

  for (const targetItem of normalizedTarget) {
    if (!sourceByUrl.has(targetItem.url)) {
      changed = true;
    }
  }

  if (!changed && JSON.stringify(merged) === JSON.stringify(normalizedTarget)) {
    return undefined;
  }
  return { resources: merged };
}

function buildAdministrationPhotoPool(docs: unknown[]): Map<string, unknown> {
  const pool = new Map<string, unknown>();
  for (const doc of docs) {
    if (!isPlainObject(doc)) continue;
    const members = Array.isArray(doc.members) ? doc.members : [];
    for (const member of members) {
      if (!isPlainObject(member)) continue;
      const key = normalizeContactKey(member.contacts);
      if (!key || pool.has(key)) continue;
      const photo = extractMediaIdentity(member.photo);
      if (photo !== undefined && photo !== null) {
        pool.set(key, photo);
      }
    }
  }
  return pool;
}

function applyAdministrationPhotoPoolPatch(target: unknown, photoPool: Map<string, unknown>): Record<string, unknown> | undefined {
  if (!isPlainObject(target)) return undefined;
  const targetMembers = Array.isArray(target.members) ? target.members : [];
  if (!targetMembers.length || photoPool.size === 0) return undefined;

  let changed = false;
  const patchedMembers = targetMembers.map((member) => {
    if (!isPlainObject(member)) return member;
    const key = normalizeContactKey(member.contacts);
    if (!key) return { ...member };
    const pooledPhoto = photoPool.get(key);
    if (pooledPhoto === undefined) return { ...member };
    const currentPhoto = extractMediaIdentity(member.photo);
    if (JSON.stringify(currentPhoto) === JSON.stringify(pooledPhoto)) return { ...member };
    changed = true;
    return { ...member, photo: pooledPhoto };
  });

  return changed ? { members: patchedMembers } : undefined;
}

function applyObjectPatch(target: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...target };
  for (const [key, patchValue] of Object.entries(patch)) {
    if (isPlainObject(patchValue) && isPlainObject(next[key])) {
      next[key] = applyObjectPatch(next[key] as Record<string, unknown>, patchValue);
    } else {
      next[key] = patchValue;
    }
  }
  return next;
}

function sanitizeMirrorValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeMirrorValue(item));
  }
  if (isPlainObject(value)) {
    const looksLikeMediaEntity =
      ('id' in value || 'documentId' in value) &&
      (typeof value.mime === 'string' ||
        typeof value.ext === 'string' ||
        typeof value.hash === 'string' ||
        typeof value.provider === 'string');
    if (looksLikeMediaEntity) {
      if (typeof value.id === 'number') return value.id;
      if (typeof value.documentId === 'string') return value.documentId;
      return null;
    }
    const cleaned: Record<string, unknown> = {};
    for (const [key, fieldValue] of Object.entries(value)) {
      if (SYSTEM_FIELDS.has(key)) continue;
      cleaned[key] = sanitizeMirrorValue(fieldValue);
    }
    return cleaned;
  }
  return value;
}

function stripSystemFields(value: Record<string, unknown>): Record<string, unknown> {
  return sanitizeMirrorValue(value) as Record<string, unknown>;
}

function mergeArrayMissingOnly(
  source: unknown[],
  target: unknown[],
  mergeKeys: string[]
): unknown[] | undefined {
  if (!source.length) return undefined;
  const mergeArrayByIndexMissingOnly = (sourceItems: unknown[], targetItems: unknown[]): unknown[] | undefined => {
    const mergedByIndex = [...targetItems];
    let changedByIndex = false;
    const maxLength = Math.max(sourceItems.length, targetItems.length);

    for (let index = 0; index < maxLength; index += 1) {
      const sourceItem = sourceItems[index];
      const targetItem = mergedByIndex[index];

      if (sourceItem === undefined) {
        if (index < mergedByIndex.length) {
          mergedByIndex.splice(index, 1);
          changedByIndex = true;
          index -= 1;
        }
        continue;
      }

      if (targetItem === undefined) {
        mergedByIndex[index] = sanitizeMirrorValue(sourceItem);
        changedByIndex = true;
        continue;
      }

      const nestedPatch = pickMissingOnlyPatch(sourceItem, targetItem, mergeKeys);
      if (isPlainObject(nestedPatch) && isPlainObject(targetItem) && Object.keys(nestedPatch).length > 0) {
        mergedByIndex[index] = applyObjectPatch(targetItem, nestedPatch);
        changedByIndex = true;
      } else if (Array.isArray(nestedPatch)) {
        mergedByIndex[index] = nestedPatch;
        changedByIndex = true;
      }
    }

    return changedByIndex ? mergedByIndex : undefined;
  };

  if (!source.every(isPlainObject) || !target.every(isPlainObject)) return undefined;

  const sourceObjects = source as Array<Record<string, unknown>>;
  const targetObjects = target as Array<Record<string, unknown>>;
  const getMergeValue = (item: Record<string, unknown>, key: string): string | number | undefined => {
    const value = getValueByPath(item, key);
    if (!isMergeKeyValue(value)) return undefined;
    if (typeof value === 'string') {
      if (key === 'contacts' || key.endsWith('.contacts')) {
        const digits = value.replace(/\D+/g, '');
        if (digits.length >= 7) return digits;
      }
      return value.trim().toLowerCase();
    }
    return value;
  };

  const mergeKey = mergeKeys.find((key) => sourceObjects.some((item) => getMergeValue(item, key) !== undefined));
  if (!mergeKey) return mergeArrayByIndexMissingOnly(source, target);

  const merged = [...targetObjects];
  let changed = false;

  const sourceKeySet = new Set(
    sourceObjects.map((item) => getMergeValue(item, mergeKey)).filter((value): value is string | number => value !== undefined)
  );
  const targetKeySet = new Set(
    targetObjects.map((item) => getMergeValue(item, mergeKey)).filter((value): value is string | number => value !== undefined)
  );
  const overlap = Array.from(sourceKeySet).filter((value) => targetKeySet.has(value)).length;
  if (sourceKeySet.size > 0 && targetKeySet.size > 0 && overlap === 0) {
    return mergeArrayByIndexMissingOnly(source, target);
  }
  for (let index = merged.length - 1; index >= 0; index -= 1) {
    const targetKeyValue = getMergeValue(merged[index], mergeKey);
    if (targetKeyValue === undefined) continue;
    if (!sourceKeySet.has(targetKeyValue)) {
      merged.splice(index, 1);
      changed = true;
    }
  }

  for (const sourceItem of sourceObjects) {
    const sourceKeyValue = getMergeValue(sourceItem, mergeKey);
    if (sourceKeyValue === undefined) continue;
    const targetIndex = merged.findIndex((targetItem) => getMergeValue(targetItem, mergeKey) === sourceKeyValue);

    if (targetIndex === -1) {
      merged.push(sanitizeMirrorValue(sourceItem) as Record<string, unknown>);
      changed = true;
      continue;
    }

    const nestedPatch = pickMissingOnlyPatch(sourceItem, merged[targetIndex], mergeKeys);
    const sourcePhotoIdentity = extractMediaIdentity(sourceItem.photo);
    const targetPhotoIdentity = extractMediaIdentity(merged[targetIndex].photo);
    const shouldSyncPhoto =
      sourcePhotoIdentity !== undefined && JSON.stringify(sourcePhotoIdentity) !== JSON.stringify(targetPhotoIdentity);

    if (isPlainObject(nestedPatch) && (Object.keys(nestedPatch).length > 0 || shouldSyncPhoto)) {
      const patchToApply: Record<string, unknown> = { ...nestedPatch };
      if (shouldSyncPhoto) {
        patchToApply.photo = sourcePhotoIdentity;
      }
      merged[targetIndex] = applyObjectPatch(merged[targetIndex], patchToApply);
      changed = true;
      continue;
    }

    if (shouldSyncPhoto) {
      merged[targetIndex] = applyObjectPatch(merged[targetIndex], {
        photo: sourcePhotoIdentity,
      });
      changed = true;
    }
  }

  const sourceOrderByKey = new Map<string | number, number>();
  sourceObjects.forEach((item, index) => {
    const keyValue = getMergeValue(item, mergeKey);
    if (keyValue !== undefined && !sourceOrderByKey.has(keyValue)) {
      sourceOrderByKey.set(keyValue, index);
    }
  });

  const indexedMerged = merged.map((item, index) => ({ item, index }));
  const reordered = [...indexedMerged].sort((left, right) => {
    const leftKey = getMergeValue(left.item, mergeKey);
    const rightKey = getMergeValue(right.item, mergeKey);
    const leftOrder = leftKey !== undefined ? sourceOrderByKey.get(leftKey) : undefined;
    const rightOrder = rightKey !== undefined ? sourceOrderByKey.get(rightKey) : undefined;

    if (leftOrder !== undefined && rightOrder !== undefined) return leftOrder - rightOrder;
    if (leftOrder !== undefined) return -1;
    if (rightOrder !== undefined) return 1;
    return left.index - right.index;
  });

  if (reordered.some((entry, index) => entry.index !== index)) {
    changed = true;
  }

  return changed ? reordered.map((entry) => entry.item) : undefined;
}

function pickMissingOnlyPatch(source: unknown, target: unknown, mergeKeys: string[]): unknown {
  if (isMissingValue(source)) return undefined;
  if (isMissingValue(target)) return sanitizeMirrorValue(source);

  if (Array.isArray(source) && Array.isArray(target)) {
    return mergeArrayMissingOnly(source, target, mergeKeys);
  }

  if (isPlainObject(source) && isPlainObject(target)) {
    const patch: Record<string, unknown> = {};
    for (const [key, sourceValue] of Object.entries(source)) {
      if (SYSTEM_FIELDS.has(key)) continue;
      const next = pickMissingOnlyPatch(sourceValue, target[key], mergeKeys);
      if (next !== undefined) {
        patch[key] = next;
      }
    }
    return Object.keys(patch).length > 0 ? patch : undefined;
  }

  return undefined;
}

async function withMirrorLock(lockKey: string, task: () => Promise<void>) {
  const previous = mirrorLocks.get(lockKey) ?? Promise.resolve();
  const current: Promise<void> = previous.catch((): void => undefined).then(() => task());
  mirrorLocks.set(lockKey, current);
  try {
    await current;
  } finally {
    if (mirrorLocks.get(lockKey) === current) {
      mirrorLocks.delete(lockKey);
    }
  }
}

function resolveLocaleFromRequest(ctx: {
  query?: { locale?: unknown };
  request: { body?: unknown };
}): string {
  const body = (ctx.request.body ?? {}) as { locale?: unknown; data?: { locale?: unknown } };
  const queryLocale = typeof ctx.query?.locale === 'string' ? ctx.query.locale : undefined;
  const bodyLocale = typeof body.locale === 'string' ? body.locale : undefined;
  const bodyDataLocale = typeof body.data?.locale === 'string' ? body.data.locale : undefined;
  return (queryLocale ?? bodyLocale ?? bodyDataLocale ?? DEFAULT_LOCALE).trim();
}

function resolveMirrorUid(path: string): string | undefined {
  if (!path.startsWith(SINGLE_TYPE_PREFIX)) return undefined;
  const pathTail = path.slice(SINGLE_TYPE_PREFIX.length);
  const uid = pathTail.endsWith('/actions/publish')
    ? pathTail.slice(0, -'/actions/publish'.length)
    : pathTail;
  return MIRRORED_SINGLE_TYPE_UIDS.has(uid) ? uid : undefined;
}

export function registerSingleTypeLocaleMirror(strapi: Core.Strapi) {
  const localeQuery = strapi.db.query('plugin::i18n.locale') as {
    findMany: (params?: unknown) => Promise<Array<{ code?: string }>>;
  };

  const mirrorByUidLocale = async (uid: string, locale: string, maybeDocumentId?: string) => {
    if (!MIRRORED_SINGLE_TYPE_UIDS.has(uid)) return;
    let documentId = maybeDocumentId;

    const mirrorKey = getMirrorKey(uid, documentId, locale);
    if (suppressedMirrorKeys.has(mirrorKey)) {
      suppressedMirrorKeys.delete(mirrorKey);
      return;
    }

    const loadSingleTypeDoc = async (targetUid: string, targetLocale: string, preferDraftFirst = false) => {
      const documentsApi = strapi.documents(targetUid as Parameters<Core.Strapi['documents']>[0]);
      const populate = (POPULATE_BY_UID[targetUid] ?? '*') as never;
      if (preferDraftFirst) {
        const draftOrAnyFirst = (await documentsApi.findFirst({
          locale: targetLocale,
          populate,
        })) as (Record<string, unknown> & { documentId?: unknown }) | null;
        if (draftOrAnyFirst && Object.keys(stripSystemFields(draftOrAnyFirst)).length > 0) {
          return draftOrAnyFirst;
        }
      }
      const publishedDoc = (await documentsApi.findFirst({
        status: 'published',
        locale: targetLocale,
        populate,
      })) as (Record<string, unknown> & { documentId?: unknown }) | null;
      if (publishedDoc && Object.keys(stripSystemFields(publishedDoc)).length > 0) {
        return publishedDoc;
      }

      const draftOrAnyDoc = (await documentsApi.findFirst({
        locale: targetLocale,
        populate,
      })) as (Record<string, unknown> & { documentId?: unknown }) | null;
      return draftOrAnyDoc;
    };

    await withMirrorLock(`${uid}::${documentId}`, async () => {
      let localeCodes: string[] = [];
      try {
        const rows = await localeQuery.findMany({ select: ['code'] });
        localeCodes = rows
          .map((row) => (typeof row?.code === 'string' ? row.code.trim() : ''))
          .filter((code): code is string => Boolean(code));
      } catch (error) {
        strapi.log.error(`[${uid}] Failed to load locales for lifecycle mirror.`, error);
        return;
      }

      const targets = localeCodes.filter((code) => code !== locale);
      const mergeKeys = ARRAY_MERGE_KEYS_BY_UID[uid] ?? DEFAULT_ARRAY_MERGE_KEYS;
      let sourcePayload: Record<string, unknown> = {};
      let sourceDocumentId = documentId;
      const allDocsForPhotoPool: unknown[] = [];
      try {
        const sourceDoc = await loadSingleTypeDoc(uid, locale, true);
        if (sourceDoc) {
          sourcePayload = stripSystemFields(sourceDoc);
          if (uid === 'api::administration.administration') {
            allDocsForPhotoPool.push(sourcePayload);
          }
          if (!sourceDocumentId && typeof sourceDoc.documentId === 'string') {
            sourceDocumentId = sourceDoc.documentId;
          }
        }
      } catch (error) {
        strapi.log.error(`[${uid}] Failed to load source locale document for lifecycle mirror.`, error);
        return;
      }
      if (!sourceDocumentId) {
        return;
      }
      if (Object.keys(sourcePayload).length === 0) {
        return;
      }

      for (const targetLocale of targets) {
        try {
          const targetDoc = await loadSingleTypeDoc(uid, targetLocale);
          const targetPayload = targetDoc ? stripSystemFields(targetDoc) : undefined;
          if (uid === 'api::administration.administration' && targetPayload) {
            allDocsForPhotoPool.push(targetPayload);
          }
          const targetDocumentId =
            (typeof targetDoc?.documentId === 'string' ? targetDoc.documentId : sourceDocumentId) as string;

          const patch = pickMissingOnlyPatch(sourcePayload, targetPayload ?? undefined, mergeKeys);
          const adminPhotoPatch =
            uid === 'api::administration.administration'
              ? buildAdministrationPhotoPatch(sourcePayload, targetPayload ?? undefined)
              : undefined;
          const adminPhotoPoolPatch =
            uid === 'api::administration.administration'
              ? applyAdministrationPhotoPoolPatch(
                  targetPayload ?? undefined,
                  buildAdministrationPhotoPool(allDocsForPhotoPool)
                )
              : undefined;
          const globalResourcesPatch =
            uid === 'api::global.global' ? buildGlobalResourcesPatch(sourcePayload, targetPayload ?? undefined) : undefined;
          const mergedPatch =
            isPlainObject(patch) ||
            isPlainObject(adminPhotoPatch) ||
            isPlainObject(adminPhotoPoolPatch) ||
            isPlainObject(globalResourcesPatch)
              ? {
                  ...(isPlainObject(patch) ? patch : {}),
                  ...(isPlainObject(adminPhotoPatch) ? adminPhotoPatch : {}),
                  ...(isPlainObject(adminPhotoPoolPatch) ? adminPhotoPoolPatch : {}),
                  ...(isPlainObject(globalResourcesPatch) ? globalResourcesPatch : {}),
                }
              : undefined;
          if (!isPlainObject(mergedPatch) || Object.keys(mergedPatch).length === 0) continue;
          const sanitizedPatch = sanitizeMirrorValue(mergedPatch);
          if (!isPlainObject(sanitizedPatch) || Object.keys(sanitizedPatch).length === 0) continue;

          const targetKey = getMirrorKey(uid, targetDocumentId, targetLocale);
          suppressedMirrorKeys.add(targetKey);
          try {
            await strapi.documents(uid as Parameters<Core.Strapi['documents']>[0]).update({
              documentId: targetDocumentId,
              locale: targetLocale,
              status: 'published',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi update typings are narrower than runtime support.
              data: sanitizedPatch as any,
            });
          } finally {
            suppressedMirrorKeys.delete(targetKey);
          }
        } catch (error) {
          const errorObject = error as {
            message?: string;
            details?: unknown;
            cause?: unknown;
            stack?: string;
          };
          strapi.log.error(
            `[${uid}] Failed mirror to locale "${targetLocale}". ` +
              `${errorObject?.message ?? 'unknown error'} ` +
              `${errorObject?.details ? JSON.stringify(errorObject.details) : ''}`
          );
        }
      }
    });
  };

  strapi.server.use(async (ctx, next) => {
    if (!(ctx.method === 'PUT' || ctx.method === 'POST')) {
      await next();
      return;
    }

    const uid = resolveMirrorUid(ctx.path);
    if (!uid) {
      await next();
      return;
    }

    const locale = resolveLocaleFromRequest(ctx);

    await next();
    if (ctx.status >= 400) return;

    await mirrorByUidLocale(uid, locale);
  });
}
