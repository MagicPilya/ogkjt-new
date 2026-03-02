import type { Core } from '@strapi/strapi';

import { SECTION_URL_TO_STRAPI } from './constants';

export async function migrateArticleSectionUrls(strapi: Core.Strapi) {
  const oldValues = Object.keys(SECTION_URL_TO_STRAPI);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi filter typings are narrower than runtime support.
  const docs = await strapi.documents('api::article.article').findMany({ filters: { sectionUrl: { $in: oldValues } } } as any);

  for (const doc of docs) {
    const oldVal = doc.sectionUrl as string;
    const newVal = SECTION_URL_TO_STRAPI[oldVal];

    if (!newVal) continue;

    await strapi.documents('api::article.article').update({
      documentId: doc.documentId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi update typings are narrower than runtime support.
      data: { sectionUrl: newVal } as any,
    });

    strapi.log.info(`Article sectionUrl migrated: ${oldVal} → ${newVal}`);
  }
}
