import type { Core } from '@strapi/strapi';

type QueryLocale = {
  locale?: unknown;
};

type ControllerRequestBody = {
  data?: Record<string, unknown>;
};

type ControllerContext = {
  query?: QueryLocale;
  request: {
    body?: ControllerRequestBody;
  };
  badRequest: (message: string) => unknown;
  notFound: () => unknown;
};

type ControllerInstance = {
  sanitizeOutput?: (data: unknown, ctx: ControllerContext) => Promise<unknown>;
  transformResponse?: (data: unknown) => unknown;
};

type SingleTypeControllerOptions = {
  populate?: unknown;
  replicateToOtherLocales?: boolean;
  replicateMode?: 'overwrite' | 'missingOnly';
  replicateArrayMergeKeys?: string[];
  replicateRemoveMissingItems?: boolean;
  replicateArrayIndexFallback?: boolean;
};

type DocumentUid = Parameters<Core.Strapi['documents']>[0];

function resolveLocale(ctx: ControllerContext): string | undefined {
  const queryLocale = typeof ctx.query?.locale === 'string' ? ctx.query.locale : undefined;
  const bodyDataLocale = typeof ctx.request.body?.data?.locale === 'string' ? ctx.request.body.data.locale : undefined;
  return queryLocale ?? bodyDataLocale;
}

async function transformEntityResponse(
  controller: ControllerInstance,
  entity: unknown,
  ctx: ControllerContext
) {
  const out = await controller.sanitizeOutput?.(entity, ctx);
  return controller.transformResponse?.(out ?? entity) ?? { data: entity };
}

export function createLocalizedSingleTypeController(
  strapi: Core.Strapi,
  uid: string,
  options: SingleTypeControllerOptions = {}
) {
  const {
    populate,
    replicateToOtherLocales = true,
    replicateMode = 'missingOnly',
    replicateArrayMergeKeys = [
      'photo.documentId',
      'photo.id',
      'contacts',
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
    ],
    replicateRemoveMissingItems = true,
    replicateArrayIndexFallback = true,
  } = options;
  const documentUid = uid as DocumentUid;

  const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    Boolean(value) && typeof value === 'object' && !Array.isArray(value);

  const isMissingValue = (value: unknown) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };

  const isMergeKeyValue = (value: unknown): value is string | number =>
    (typeof value === 'string' && value.trim().length > 0) || typeof value === 'number';
  const ignoredMirrorKeys = new Set([
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

  const sanitizeMirrorValue = (value: unknown): unknown => {
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
        if (ignoredMirrorKeys.has(key)) continue;
        cleaned[key] = sanitizeMirrorValue(fieldValue);
      }
      return cleaned;
    }
    return value;
  };

  const applyObjectPatch = (target: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> => {
    const next: Record<string, unknown> = { ...target };
    for (const [key, patchValue] of Object.entries(patch)) {
      if (isPlainObject(patchValue) && isPlainObject(next[key])) {
        next[key] = applyObjectPatch(next[key] as Record<string, unknown>, patchValue);
      } else {
        next[key] = patchValue;
      }
    }
    return next;
  };

  const getMergeValue = (item: Record<string, unknown>, key: string): string | number | undefined => {
    const value = key.includes('.')
      ? key.split('.').reduce<unknown>((current, part) => (isPlainObject(current) ? current[part] : undefined), item)
      : item[key];
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

  const extractMediaIdentity = (value: unknown): unknown => {
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
  };

  const mergeArrayByIndexMissingOnly = (source: unknown[], target: unknown[]): unknown[] | undefined => {
    const merged = [...target];
    let changed = false;
    const maxLength = Math.max(source.length, target.length);

    for (let index = 0; index < maxLength; index += 1) {
      const sourceItem = source[index];
      const targetItem = merged[index];

      if (sourceItem === undefined) {
        if (replicateRemoveMissingItems && index < merged.length) {
          merged.splice(index, 1);
          changed = true;
          index -= 1;
        }
        continue;
      }

      if (targetItem === undefined) {
        merged[index] = sanitizeMirrorValue(sourceItem);
        changed = true;
        continue;
      }

      const nestedPatch = pickMissingOnlyPatch(sourceItem, targetItem);
      if (isPlainObject(nestedPatch) && isPlainObject(targetItem) && Object.keys(nestedPatch).length > 0) {
        merged[index] = applyObjectPatch(targetItem, nestedPatch);
        changed = true;
      } else if (Array.isArray(nestedPatch)) {
        merged[index] = nestedPatch;
        changed = true;
      }
    }

    return changed ? merged : undefined;
  };

  const mergeArrayMissingOnly = (source: unknown[], target: unknown[]): unknown[] | undefined => {
    if (!source.length) return undefined;
    if (!source.every(isPlainObject) || !target.every(isPlainObject)) return undefined;

    const sourceObjects = source as Array<Record<string, unknown>>;
    const targetObjects = target as Array<Record<string, unknown>>;
    const mergeKey = replicateArrayMergeKeys.find((key) => sourceObjects.some((item) => getMergeValue(item, key) !== undefined));
    if (!mergeKey) {
      return replicateArrayIndexFallback ? mergeArrayByIndexMissingOnly(source, target) : undefined;
    }

    const merged = [...targetObjects];
    let changed = false;

    if (replicateRemoveMissingItems) {
      const sourceKeySet = new Set(
        sourceObjects.map((item) => getMergeValue(item, mergeKey)).filter((value): value is string | number => value !== undefined)
      );
      const targetKeySet = new Set(
        targetObjects.map((item) => getMergeValue(item, mergeKey)).filter((value): value is string | number => value !== undefined)
      );
      const overlap = Array.from(sourceKeySet).filter((value) => targetKeySet.has(value)).length;
      if (replicateArrayIndexFallback && sourceKeySet.size > 0 && targetKeySet.size > 0 && overlap === 0) {
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

      const nestedPatch = pickMissingOnlyPatch(sourceItem, merged[targetIndex]);
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
  };

  const pickMissingOnlyPatch = (source: unknown, target: unknown): unknown => {
    if (isMissingValue(source)) return undefined;
    if (isMissingValue(target)) return sanitizeMirrorValue(source);

    if (Array.isArray(source) && Array.isArray(target)) {
      return mergeArrayMissingOnly(source, target);
    }

    if (isPlainObject(source) && isPlainObject(target)) {
      const patch: Record<string, unknown> = {};
      for (const [key, sourceValue] of Object.entries(source)) {
        if (ignoredMirrorKeys.has(key)) continue;
        const next = pickMissingOnlyPatch(sourceValue, target[key]);
        if (next !== undefined) {
          patch[key] = next;
        }
      }
      return Object.keys(patch).length > 0 ? patch : undefined;
    }

    return undefined;
  };

  const getAllLocaleCodes = async (): Promise<string[]> => {
    const localeQuery = strapi.db.query('plugin::i18n.locale') as {
      findMany: (params?: unknown) => Promise<Array<{ code?: string }>>;
    };
    const rows = await localeQuery.findMany({ select: ['code'] });
    return rows
      .map((row) => (typeof row?.code === 'string' ? row.code.trim() : ''))
      .filter((code): code is string => Boolean(code));
  };

  const replicateDataToOtherLocales = async (
    documentId: string,
    sourceLocale: string | undefined,
    data: Record<string, unknown>
  ) => {
    if (!replicateToOtherLocales) return;

    let localeCodes: string[];
    try {
      localeCodes = await getAllLocaleCodes();
    } catch (error) {
      strapi.log.warn(`[${uid}] Failed to load locales for replication.`, error);
      return;
    }

    const targets = localeCodes.filter((code) => code !== sourceLocale);
    for (const targetLocale of targets) {
      try {
        let payload: Record<string, unknown> | undefined = data;
        if (replicateMode === 'missingOnly') {
          const targetDoc = (await strapi.documents(documentUid).findOne({
            documentId,
            locale: targetLocale,
          })) as Record<string, unknown> | null;
          const patch = pickMissingOnlyPatch(data, targetDoc ?? undefined);
          payload = isPlainObject(patch) && Object.keys(patch).length > 0 ? patch : undefined;
        }
        if (payload) {
          const sanitized = sanitizeMirrorValue(payload);
          payload = isPlainObject(sanitized) ? sanitized : undefined;
        }

        if (!payload || Object.keys(payload).length === 0) {
          continue;
        }

        await strapi.documents(documentUid).update({
          documentId,
          locale: targetLocale,
          status: 'published',
          data: payload,
        });
      } catch (error) {
        strapi.log.warn(`[${uid}] Failed to replicate data to locale "${targetLocale}".`, error);
      }
    }
  };

  return {
    async find(ctx: ControllerContext) {
      const locale = resolveLocale(ctx);
      const doc = await strapi.documents(documentUid).findFirst({
        status: 'published',
        ...(locale && { locale }),
        ...(populate !== undefined && { populate }),
      });

      if (!doc) return ctx.notFound();
      return { data: doc };
    },

    async update(this: ControllerInstance, ctx: ControllerContext) {
      const locale = resolveLocale(ctx);
      const data = ctx.request.body?.data;

      if (!data || typeof data !== 'object') {
        return ctx.badRequest('Missing data');
      }

      let documentId: string | undefined;

      try {
        const existing = await strapi.documents(documentUid).findFirst({ ...(locale && { locale }) });
        documentId = existing?.documentId;
      } catch (error) {
        strapi.log.warn(`[${uid}] Failed to resolve localized document for update.`, error);
      }

      if (!documentId) {
        try {
          const anyLocaleDocument = await strapi.documents(documentUid).findFirst({});
          documentId = anyLocaleDocument?.documentId;
        } catch (error) {
          strapi.log.warn(`[${uid}] Failed to resolve fallback document for update.`, error);
        }
      }

      if (!documentId) {
        const created = await strapi.documents(documentUid).create({
          data,
          ...(locale && { locale }),
        });
        const createdDocumentId = created?.documentId;
        if (typeof createdDocumentId === 'string' && createdDocumentId) {
          await replicateDataToOtherLocales(createdDocumentId, locale, data);
        }
        return transformEntityResponse(this, created, ctx);
      }

      const updated = await strapi.documents(documentUid).update({
        documentId,
        ...(locale && { locale }),
        data,
      });
      await replicateDataToOtherLocales(documentId, locale, data);

      return transformEntityResponse(this, updated, ctx);
    },
  };
}
