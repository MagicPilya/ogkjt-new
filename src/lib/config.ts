/**
 * Адрес Strapi API. По умолчанию — ваш инстанс Strapi (меню, контакты и всё,
 * что создано вручную в админке, подтягиваются оттуда).
 * Переопределяется через NEXT_PUBLIC_STRAPI_URL в .env.
 *
 * Примеры .env:
 *   NEXT_PUBLIC_STRAPI_URL=http://127.0.0.1:1337
 *   NEXT_PUBLIC_STRAPI_URL=https://cms.example.com
 */
function normalizeStrapiUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `http://${trimmed}`;
}

const rawUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://178.172.137.227:1337";
export const STRAPI_URL = normalizeStrapiUrl(rawUrl);

