/**
 * Единое место для адреса подключения к Strapi API.
 * Меняйте только здесь или через переменную NEXT_PUBLIC_STRAPI_URL в .env.
 *
 * Переопределяется через NEXT_PUBLIC_STRAPI_URL.
 * Для сайта по HTTPS укажите URL Strapi тоже по HTTPS, иначе картинки будут блокироваться (mixed content).
 * Примеры:
 *   NEXT_PUBLIC_STRAPI_URL=http://127.0.0.1:1337
 *   NEXT_PUBLIC_STRAPI_URL=https://178.172.137.227:1337
 *
 * Если указать только хост (без протокола), автоматически добавится http://
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

