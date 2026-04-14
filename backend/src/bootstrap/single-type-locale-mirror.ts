import type { Core } from '@strapi/strapi';

type MirrorEvent = {
  model?: { uid?: string };
  result?: { documentId?: unknown; locale?: unknown };
  params?: {
    documentId?: unknown;
    locale?: unknown;
    data?: { locale?: unknown };
    where?: { documentId?: unknown };
  };
};

const MIRRORED_SINGLE_TYPE_UIDS = new Set([
  'api::administration.administration',
  'api::specialty.specialty',
  'api::global.global',
]);
const DEFAULT_ARRAY_MERGE_KEYS = ['url', 'slug', 'documentId', 'id'];
const ARRAY_MERGE_KEYS_BY_UID: Record<string, string[]> = {
  'api::menu.menu': ['url'],
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
const suppressedLifecycleKeys = new Set<string>();

function getLifecycleKey(uid: string, documentId: string, locale: string): string {
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
  return typeof value === 'string' || typeof value === 'number';
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
  if (!source.every(isPlainObject) || !target.every(isPlainObject)) return undefined;

  const sourceObjects = source as Array<Record<string, unknown>>;
  const targetObjects = target as Array<Record<string, unknown>>;
  const mergeKey = mergeKeys.find((key) =>
    sourceObjects.some((item) => isMergeKeyValue(item[key])) && targetObjects.some((item) => isMergeKeyValue(item[key]))
  );
  if (!mergeKey) return undefined;

  const merged = [...targetObjects];
  let changed = false;

  for (const sourceItem of sourceObjects) {
    const sourceKeyValue = sourceItem[mergeKey];
    if (!isMergeKeyValue(sourceKeyValue)) continue;
    const targetIndex = merged.findIndex((targetItem) => targetItem[mergeKey] === sourceKeyValue);

    if (targetIndex === -1) {
      merged.push(sanitizeMirrorValue(sourceItem) as Record<string, unknown>);
      changed = true;
      continue;
    }

    const nestedPatch = pickMissingOnlyPatch(sourceItem, merged[targetIndex], mergeKeys);
    if (isPlainObject(nestedPatch) && Object.keys(nestedPatch).length > 0) {
      merged[targetIndex] = applyObjectPatch(merged[targetIndex], nestedPatch);
      changed = true;
    }
  }

  return changed ? merged : undefined;
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
  const current = previous.catch(() => undefined).then(task);
  mirrorLocks.set(lockKey, current);
  try {
    await current;
  } finally {
    if (mirrorLocks.get(lockKey) === current) {
      mirrorLocks.delete(lockKey);
    }
  }
}

function resolveLocale(event: MirrorEvent): string | undefined {
  const value = event.result?.locale ?? event.params?.locale ?? event.params?.data?.locale;
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function resolveDocumentId(event: MirrorEvent): string | undefined {
  const value = event.result?.documentId ?? event.params?.documentId ?? event.params?.where?.documentId;
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function registerSingleTypeLocaleMirror(strapi: Core.Strapi) {
  const localeQuery = strapi.db.query('plugin::i18n.locale') as {
    findMany: (params?: unknown) => Promise<Array<{ code?: string }>>;
  };

  const mirrorByUidLocale = async (uid: string, locale: string, maybeDocumentId?: string) => {
    if (!MIRRORED_SINGLE_TYPE_UIDS.has(uid)) return;
    let documentId = maybeDocumentId;
    if (!documentId) {
      try {
        const fallbackDoc = (await strapi.documents(uid as Parameters<Core.Strapi['documents']>[0]).findFirst({
          locale,
        })) as { documentId?: unknown } | null;
        documentId = typeof fallbackDoc?.documentId === 'string' ? fallbackDoc.documentId : undefined;
      } catch (error) {
        strapi.log.warn(`[${uid}] Failed to resolve documentId for locale "${locale}" in mirror.`, error);
      }
    }
    if (!documentId) return;

    const lifecycleKey = getLifecycleKey(uid, documentId, locale);
    if (suppressedLifecycleKeys.has(lifecycleKey)) {
      suppressedLifecycleKeys.delete(lifecycleKey);
      return;
    }

    strapi.log.info(`[${uid}] Mirror trigger locale=${locale}`);

    await withMirrorLock(`${uid}::${documentId}`, async () => {
      let localeCodes: string[] = [];
      try {
        const rows = await localeQuery.findMany({ select: ['code'] });
        localeCodes = rows
          .map((row) => (typeof row?.code === 'string' ? row.code.trim() : ''))
          .filter((code): code is string => Boolean(code));
      } catch (error) {
        strapi.log.warn(`[${uid}] Failed to load locales for lifecycle mirror.`, error);
        return;
      }

      const targets = localeCodes.filter((code) => code !== locale);
      const mergeKeys = ARRAY_MERGE_KEYS_BY_UID[uid] ?? DEFAULT_ARRAY_MERGE_KEYS;
      let sourcePayload: Record<string, unknown> = {};
      try {
        const sourceDoc = (await strapi.documents(uid as Parameters<Core.Strapi['documents']>[0]).findOne({
          documentId,
          locale,
        })) as Record<string, unknown> | null;
        if (sourceDoc) {
          sourcePayload = stripSystemFields(sourceDoc);
        }
      } catch (error) {
        strapi.log.warn(`[${uid}] Failed to load source locale document for lifecycle mirror.`, error);
        return;
      }
      if (Object.keys(sourcePayload).length === 0) return;

      for (const targetLocale of targets) {
        try {
          const targetDoc = (await strapi.documents(uid as Parameters<Core.Strapi['documents']>[0]).findOne({
            documentId,
            locale: targetLocale,
          })) as Record<string, unknown> | null;

          const patch = pickMissingOnlyPatch(sourcePayload, targetDoc ?? undefined, mergeKeys);
          if (!isPlainObject(patch) || Object.keys(patch).length === 0) continue;
          const sanitizedPatch = sanitizeMirrorValue(patch);
          if (!isPlainObject(sanitizedPatch) || Object.keys(sanitizedPatch).length === 0) continue;

          const targetKey = getLifecycleKey(uid, documentId, targetLocale);
          suppressedLifecycleKeys.add(targetKey);
          try {
            await strapi.documents(uid as Parameters<Core.Strapi['documents']>[0]).update({
              documentId,
              locale: targetLocale,
              status: 'published',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi update typings are narrower than runtime support.
              data: sanitizedPatch as any,
            });
            strapi.log.info(`[${uid}] Mirrored missing fields ${locale} -> ${targetLocale}`);
          } finally {
            suppressedLifecycleKeys.delete(targetKey);
          }
        } catch (error) {
          const errorObject = error as {
            message?: string;
            details?: unknown;
            cause?: unknown;
            stack?: string;
          };
          strapi.log.warn(
            `[${uid}] Failed lifecycle mirror to locale "${targetLocale}". ` +
              `${errorObject?.message ?? 'unknown error'} ` +
              `${errorObject?.details ? JSON.stringify(errorObject.details) : ''}`
          );
        }
      }
    });
  };

  const mirrorFromEvent = async (event: MirrorEvent) => {
    const uid = event.model?.uid;
    if (!uid || !MIRRORED_SINGLE_TYPE_UIDS.has(uid)) return;

    const locale = resolveLocale(event);
    const documentId = resolveDocumentId(event);
    if (!locale) return;
    await mirrorByUidLocale(uid, locale, documentId);
  };

  strapi.server.use(async (ctx, next) => {
    await next();
    if (ctx.status >= 400) return;
    if (!(ctx.method === 'PUT' || ctx.method === 'POST')) return;
    const singleTypePrefix = '/content-manager/single-types/';
    if (!ctx.path.startsWith(singleTypePrefix)) return;

    const pathTail = ctx.path.slice(singleTypePrefix.length);
    const uid = pathTail.endsWith('/actions/publish')
      ? pathTail.slice(0, -'/actions/publish'.length)
      : pathTail;
    if (!MIRRORED_SINGLE_TYPE_UIDS.has(uid)) return;

    const body = (ctx.request.body ?? {}) as { locale?: unknown; data?: { locale?: unknown } };
    const queryLocale = typeof ctx.query?.locale === 'string' ? ctx.query.locale : undefined;
    const bodyLocale = typeof body.locale === 'string' ? body.locale : undefined;
    const bodyDataLocale = typeof body.data?.locale === 'string' ? body.data.locale : undefined;
    const locale = queryLocale ?? bodyLocale ?? bodyDataLocale;
    if (!locale) return;

    await mirrorByUidLocale(uid, locale);
  });

  strapi.db.lifecycles.subscribe({
    models: Array.from(MIRRORED_SINGLE_TYPE_UIDS),
    async afterCreate(event) {
      await mirrorFromEvent(event as MirrorEvent);
    },
    async afterUpdate(event) {
      await mirrorFromEvent(event as MirrorEvent);
    },
  });
}
