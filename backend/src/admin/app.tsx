import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [
      'ru',
    ],
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};

