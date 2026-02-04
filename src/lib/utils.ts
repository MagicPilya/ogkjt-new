import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { STRAPI_URL } from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStrapiURL() {
  return STRAPI_URL;
}

export function getStrapiMedia(url: string | null) {
  if (url == null) {
    return null;
  }

  // Return the full URL if the media is hosted on an external provider
  if (url.startsWith("http") || url.startsWith("//")) {
    return url;
  }

  // Otherwise prepend the Strapi URL
  return `${getStrapiURL()}${url}`;
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
