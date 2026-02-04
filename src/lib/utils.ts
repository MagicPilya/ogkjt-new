import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { STRAPI_URL } from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStrapiURL() {
  return STRAPI_URL;
}

/**
 * Базовый URL Strapi для медиа в браузере — всегда HTTPS,
 * чтобы избежать блокировки mixed content на HTTPS-страницах.
 */
function getStrapiMediaBase(): string {
  const base = getStrapiURL();
  return base.replace(/^http:\/\//i, "https://");
}

export function getStrapiMedia(url: string | null) {
  if (url == null) {
    return null;
  }

  // Полный URL от Strapi — принудительно HTTPS для отображения в браузере
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url.startsWith("http://") ? url.replace(/^http:\/\//i, "https://") : url;
  }
  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  // Относительный путь — подставляем базовый URL по HTTPS
  return `${getStrapiMediaBase()}${url}`;
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
