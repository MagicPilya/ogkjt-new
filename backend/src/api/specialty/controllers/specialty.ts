/**
 * specialty controller
 * Single type: отдаём опубликованную запись со всеми вложенными компонентами.
 * locale из query (?locale=be) передаём в findFirst для корректной локализации.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::specialty.specialty', ({ strapi }) => ({
  async find(ctx) {
    const locale = typeof ctx.query?.locale === 'string' ? ctx.query.locale : undefined;
    const doc = await strapi.documents('api::specialty.specialty').findFirst({
      status: 'published',
      ...(locale && { locale }),
      populate: {
        items: {
          populate: ['specializations', 'workerProfessions'],
        },
      },
    });
    if (!doc) {
      return ctx.notFound();
    }
    return { data: doc };
  },
}));
