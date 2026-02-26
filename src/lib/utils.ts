import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { STRAPI_URL } from "./config";
import type { StrapiImage } from "./strapi";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStrapiURL() {
  return STRAPI_URL;
}

/** Локальный ли хост (dev без SSL) — для таких не принуждаем HTTPS. */
function isLocalStrapiHost(url: string): boolean {
  try {
    const u = new URL(url.startsWith("http") ? url : `http://${url}`);
    const host = u.hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

/**
 * Базовый URL Strapi для медиа в браузере.
 * Для локального Strapi (localhost/127.0.0.1) оставляем HTTP, иначе браузер даёт ERR_SSL_PROTOCOL_ERROR.
 * Для удалённого — HTTPS, чтобы не было mixed content на HTTPS-страницах.
 */
function getStrapiMediaBase(): string {
  const base = getStrapiURL();
  if (isLocalStrapiHost(base)) {
    return base;
  }
  return base.replace(/^http:\/\//i, "https://");
}

/**
 * Извлекает URL из медиа-значения Strapi (строка или объект v4/v5).
 */
function extractMediaUrl(
  value: string | null | undefined | { url?: string; data?: { attributes?: { url?: string } } }
): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value || null;
  const url = value.url ?? value.data?.attributes?.url;
  return (url && typeof url === "string") ? url : null;
}

export function getStrapiMedia(
  urlOrMedia: string | null | undefined | { url?: string; data?: { attributes?: { url?: string } } }
) {
  const url = typeof urlOrMedia === "string" || urlOrMedia == null
    ? urlOrMedia ?? null
    : extractMediaUrl(urlOrMedia);
  if (url == null) {
    return null;
  }
  if (!getStrapiURL() && !url.startsWith("http://") && !url.startsWith("https://")) {
    return null;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    const isLocal = isLocalStrapiHost(url);
    if (isLocal) return url;
    return url.startsWith("http://") ? url.replace(/^http:\/\//i, "https://") : url;
  }
  if (url.startsWith("//")) {
    const base = getStrapiMediaBase();
    return base.startsWith("https") ? `https:${url}` : `http:${url}`;
  }

  return `${getStrapiMediaBase()}${url}`;
}

/**
 * Возвращает URL изображения Strapi в предпочтительном размере.
 * Это помогает не тянуть оригиналы там, где достаточно уменьшенной версии.
 */
export function getStrapiMediaWithFormats(
  image: StrapiImage | null | undefined,
  preferredFormats: Array<"thumbnail" | "small" | "medium" | "large"> = ["small", "thumbnail"]
) {
  if (!image) return null;

  for (const formatName of preferredFormats) {
    const formatUrl = image.formats?.[formatName]?.url;
    const mediaUrl = getStrapiMedia(formatUrl ?? null);
    if (mediaUrl) return mediaUrl;
  }

  return getStrapiMedia(image.url ?? null);
}

/** Коды локалей для Intl (ru, be, en). */
const INTL_LOCALE_MAP: Record<string, string> = {
  ru: "ru-RU",
  be: "be-BY",
  en: "en-US",
};

export function formatDate(dateString: string, locale?: string) {
  const date = new Date(dateString);
  const intlLocale = locale ? INTL_LOCALE_MAP[locale] ?? "ru-RU" : "ru-RU";
  return new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
