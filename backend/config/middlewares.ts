export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((s: string) => s.trim())
        : ['http://localhost:3000', 'https://www.devsu.site', 'https://devsu.site'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
