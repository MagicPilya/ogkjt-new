// Публичный URL, когда Strapi за прокси (nginx) по домену. Нужен для админки и API.
// Пример: https://api.example.com
//
// Production (важно для кук и CSRF-поверхности same-site):
// - STRAPI_PUBLIC_URL — абсолютный HTTPS-URL без хвостового слэша (обязателен для ссылок в письмах, OAuth, админки).
// - KOA_TRUST_PROXY=true — если TLS терминирует nginx/балансировщик: доверять X-Forwarded-Proto/Host
//   (иначе secure-куки и определение схемы могут быть неверными).
export default ({ env }: { env: any }) => {
  const publicUrl = env('STRAPI_PUBLIC_URL', '');
  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    ...(publicUrl ? { url: publicUrl.replace(/\/+$/, '') } : {}),
    app: {
      keys: env.array('APP_KEYS'),
    },
    proxy: {
      koa: env.bool('KOA_TRUST_PROXY', false),
    },
  };
};
