/**
 * administration controller
 * Кастомный find: подтягиваем фото в компоненте members через Document Service (REST populate даёт 500).
 * locale из query (?locale=be) передаём в findFirst, иначе отдаётся только дефолтная локаль.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::administration.administration', ({ strapi }) => ({
  async find(ctx) {
    const locale = typeof ctx.query?.locale === 'string' ? ctx.query.locale : undefined;
    const doc = await strapi.documents('api::administration.administration').findFirst({
      status: 'published',
      ...(locale && { locale }),
      populate: {
        members: {
          populate: ['photo'],
        },
      },
    });
    if (!doc) {
      return ctx.notFound();
    }
    return { data: doc };
  },
}));
