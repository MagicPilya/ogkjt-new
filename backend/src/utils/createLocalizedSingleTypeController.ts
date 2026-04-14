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
    replicateToOtherLocales = false,
    replicateMode = 'overwrite',
    replicateArrayMergeKeys = ['url', 'slug', 'documentId', 'id'],
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

  const isMergeKeyValue = (value: unknown): value is string | number => typeof value === 'string' || typeof value === 'number';
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

  const mergeArrayMissingOnly = (source: unknown[], target: unknown[]): unknown[] | undefined => {
    if (!source.length) return undefined;
    if (!source.every(isPlainObject) || !target.every(isPlainObject)) return undefined;

    const sourceObjects = source as Array<Record<string, unknown>>;
    const targetObjects = target as Array<Record<string, unknown>>;
    const mergeKey = replicateArrayMergeKeys.find((key) =>
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

      const nestedPatch = pickMissingOnlyPatch(sourceItem, merged[targetIndex]);
      if (isPlainObject(nestedPatch) && Object.keys(nestedPatch).length > 0) {
        merged[targetIndex] = applyObjectPatch(merged[targetIndex], nestedPatch);
        changed = true;
      }
    }

    return changed ? merged : undefined;
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
