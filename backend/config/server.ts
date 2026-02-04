// Публичный URL, когда Strapi за прокси (nginx) по домену. Нужен для админки и API.
// Пример: https://api.devsu.site
export default ({ env }: { env: any }) => {
  const publicUrl = env('STRAPI_PUBLIC_URL', '');
  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    ...(publicUrl ? { url: publicUrl.replace(/\/+$/, '') } : {}),
    app: {
      keys: env.array('APP_KEYS'),
    },
  };
};
