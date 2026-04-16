import type { Core } from '@strapi/strapi';
import { ARRAY_MERGE_KEYS_BY_UID, DEFAULT_ARRAY_MERGE_KEYS, MIRRORED_SINGLE_TYPE_UIDS } from './single-type-locale-mirror/config';
import {
  buildMergedMirrorPatch,
  getMirrorKey,
  loadSingleTypeDoc,
  resolveLocaleFromRequest,
  resolveMirrorUid,
  stripSystemFields,
} from './single-type-locale-mirror/helpers';

const mirrorLocks = new Map<string, Promise<void>>();
const suppressedMirrorKeys = new Set<string>();

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
        const sourceDoc = await loadSingleTypeDoc(strapi, uid, locale, true);
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
          const targetDoc = await loadSingleTypeDoc(strapi, uid, targetLocale);
          const targetPayload = targetDoc ? stripSystemFields(targetDoc) : undefined;
          if (uid === 'api::administration.administration' && targetPayload) {
            allDocsForPhotoPool.push(targetPayload);
          }
          const targetDocumentId =
            (typeof targetDoc?.documentId === 'string' ? targetDoc.documentId : sourceDocumentId) as string;

          const sanitizedPatch = buildMergedMirrorPatch(uid, sourcePayload, targetPayload, mergeKeys, allDocsForPhotoPool);
          if (!sanitizedPatch) continue;

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
