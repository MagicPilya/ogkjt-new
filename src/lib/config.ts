/**
 * Единое место для базовых URL/настроек фронта.
 *
 * Можно переопределить через переменные окружения:
 * - NEXT_PUBLIC_STRAPI_URL
 */
export const STRAPI_URL =
  (process.env.NEXT_PUBLIC_STRAPI_URL || "http://178.172.137.227:1337").replace(/\/+$/, "");

