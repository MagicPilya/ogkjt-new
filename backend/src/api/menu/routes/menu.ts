/**
 * menu router
 * find без auth — чтобы селект «Страница» в админке мог загрузить пункты меню (запрос идёт без токена content-api).
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::menu.menu', {
  config: {
    find: { auth: false },
  },
});
