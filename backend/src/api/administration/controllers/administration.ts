/**
 * administration controller
 * Кастомный find: подтягиваем фото в компоненте members через Document Service (REST populate даёт 500).
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::administration.administration', ({ strapi }) => ({
  async find(ctx) {
    const doc = await strapi.documents('api::administration.administration').findFirst({
      status: 'published',
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
