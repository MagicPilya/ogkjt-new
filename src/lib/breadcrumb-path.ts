import { isValidLocale } from "./i18n";

/** Путь без префикса локали, например `/ideology/sections`. */
export function pathWithoutLocale(fullPathname: string): string {
  const segments = fullPathname.split("/").filter(Boolean);
  if (segments.length > 0 && isValidLocale(segments[0])) {
    return "/" + segments.slice(1).join("/") || "/";
  }
  return fullPathname || "/";
}
