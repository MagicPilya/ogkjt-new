import { normalizeStrapiUrl } from "@/lib/normalize-strapi-url";

/**
 * Адрес Strapi API. По умолчанию — ваш инстанс Strapi (меню, контакты и всё,
 * что создано вручную в админке, подтягиваются оттуда).
 * Переопределяется через NEXT_PUBLIC_STRAPI_URL в .env.
 *
 * Примеры .env:
 *   NEXT_PUBLIC_STRAPI_URL=http://127.0.0.1:1337
 *   NEXT_PUBLIC_STRAPI_URL=https://cms.example.com
 */

const rawUrl =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:1337" : "https://api.ogkjt.by");
export const STRAPI_URL = normalizeStrapiUrl(rawUrl);

