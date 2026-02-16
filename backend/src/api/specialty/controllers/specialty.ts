/**
 * specialty controller
 * Single type: отдаём опубликованную запись со всеми вложенными компонентами.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::specialty.specialty', ({ strapi }) => ({
  async find(ctx) {
    const doc = await strapi.documents('api::specialty.specialty').findFirst({
      status: 'published',
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
