import type { Core } from '@strapi/strapi';
import slugify from '@sindresorhus/slugify';

const SLUG_COLLECTION_UIDS = [
  'api::article.article',
  'api::dormitory-news.dormitory-news',
  'api::spps-psy.spps-psy',
  'api::spps-social.spps-social',
  'api::event.event',
] as const;

type SlugCollectionUid = (typeof SLUG_COLLECTION_UIDS)[number];

function slugifyTitle(title: string): string {
  return slugify(title, { lowercase: true, separator: '-' });
}

function ensureSlugOnData(data: Record<string, unknown>) {
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const slug = typeof data.slug === 'string' ? data.slug.trim() : '';
  if (!slug && title) {
    data.slug = slugifyTitle(title);
  }
}

async function ensureSlugBeforePublish(strapi: Core.Strapi, uid: SlugCollectionUid, documentId: string) {
  const documents = strapi.documents(uid);
  const draftDoc = (await documents.findOne({
    documentId,
    status: 'draft',
  })) as { title?: string | null; slug?: string | null } | null;

  const doc =
    draftDoc ??
    ((await documents.findOne({
      documentId,
    })) as { title?: string | null; slug?: string | null } | null);

  const title = doc?.title?.trim() ?? '';
  const slug = doc?.slug?.trim() ?? '';
  if (slug || !title) return;

  await documents.update({
    documentId,
    data: { slug: slugifyTitle(title) } as Record<string, string>,
  });
}

export function registerCollectionSlugAutofill(strapi: Core.Strapi) {
  const uids = new Set<string>(SLUG_COLLECTION_UIDS);

  strapi.documents.use(async (context, next) => {
    if (!uids.has(context.uid)) {
      return next();
    }

    if (context.action === 'create' || context.action === 'update') {
      const data = context.params?.data as Record<string, unknown> | undefined;
      if (data) ensureSlugOnData(data);
      return next();
    }

    if (context.action === 'publish') {
      const documentId = (context.params as { documentId?: string } | undefined)?.documentId;
      if (documentId) {
        try {
          await ensureSlugBeforePublish(strapi, context.uid as SlugCollectionUid, documentId);
        } catch (error) {
          strapi.log.warn(`[${context.uid}] Failed to autofill slug before publish.`, error);
        }
      }
    }

    return next();
  });
}
