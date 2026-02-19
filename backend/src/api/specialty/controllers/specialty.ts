/**
 * specialty controller
 * Single type с i18n: find и update обязательно передают locale в Document Service.
 * Иначе при сохранении в одной локали меняются все.
 */

import { factories } from '@strapi/strapi';

const uid = 'api::specialty.specialty';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi populate types are strict, structure is valid at runtime
const populate = { items: { populate: ['specializations', 'workerProfessions'] } } as any;

export default factories.createCoreController(uid, ({ strapi }) => ({
  async find(ctx) {
    const locale = typeof ctx.query?.locale === 'string' ? ctx.query.locale : undefined;
    const doc = await strapi.documents(uid).findFirst({
      status: 'published',
      ...(locale && { locale }),
      populate,
    });
    if (!doc) return ctx.notFound();
    return { data: doc };
  },

  async update(ctx) {
    const locale = typeof ctx.query?.locale === 'string' ? ctx.query.locale : undefined;
    const body = ctx.request.body as { data?: Record<string, unknown> } | undefined;
    const data = body?.data;
    if (!data || typeof data !== 'object') {
      return ctx.badRequest('Missing data');
    }
    let documentId: string | undefined;
    try {
      const existing = await strapi.documents(uid).findFirst({ ...(locale && { locale }) });
      documentId = existing?.documentId;
    } catch {
      documentId = undefined;
    }
    if (!documentId) {
      try {
        const anyDoc = await strapi.documents(uid).findFirst({});
        documentId = anyDoc?.documentId;
      } catch {
        // no document at all
      }
    }
    if (!documentId) {
      const created = await strapi.documents(uid).create({
        data,
        ...(locale && { locale }),
      });
      const out = await (this as { sanitizeOutput?: (d: unknown, c: typeof ctx) => Promise<unknown> }).sanitizeOutput?.(created, ctx);
      return (this as { transformResponse?: (d: unknown) => unknown }).transformResponse?.(out ?? created) ?? { data: created };
    }
    const updated = await strapi.documents(uid).update({
      documentId,
      ...(locale && { locale }),
      data,
    });
    const out = await (this as { sanitizeOutput?: (d: unknown, c: typeof ctx) => Promise<unknown> }).sanitizeOutput?.(updated, ctx);
    return (this as { transformResponse?: (d: unknown) => unknown }).transformResponse?.(out ?? updated) ?? { data: updated };
  },
}));
