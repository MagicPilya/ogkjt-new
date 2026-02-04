/**
 * Единое место для базовых URL/настроек фронта.
 *
 * Переопределяется через NEXT_PUBLIC_STRAPI_URL.
 * Для сайта по HTTPS укажите URL Strapi тоже по HTTPS, иначе картинки будут блокироваться (mixed content).
 * Пример: NEXT_PUBLIC_STRAPI_URL=https://178.172.137.227:1337
 */
export const STRAPI_URL =
  (process.env.NEXT_PUBLIC_STRAPI_URL || "http://178.172.137.227:1337").replace(/\/+$/, "");

