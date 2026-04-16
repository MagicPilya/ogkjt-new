const ARTICLE_ROUTE_TOKEN = '/content-manager/collection-types/api::article.article';
const EVENT_ROUTE_TOKEN = '/content-manager/collection-types/api::event.event';
const PAGE_ROUTE_TOKEN = '/content-manager/collection-types/api::page.page';

export function tryParseSafeHttpUrl(rawValue: string, baseUrl: string = window.location.origin): string | null {
  const normalized = rawValue.trim();
  if (!normalized) return null;

  try {
    const parsed = new URL(normalized, baseUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function promptForSafeHttpUrl(message: string): string | null {
  const rawValue = window.prompt(message, 'https://');
  if (!rawValue) return null;

  const safeUrl = tryParseSafeHttpUrl(rawValue);
  if (!safeUrl) {
    window.alert('Некорректный URL. Разрешены только http/https ссылки.');
    return null;
  }

  return safeUrl;
}

export function isPageScreen(pathname: string): boolean {
  return pathname.includes(PAGE_ROUTE_TOKEN);
}

export function isArticleScreen(pathname: string): boolean {
  return pathname.includes(ARTICLE_ROUTE_TOKEN);
}

export function isEventScreen(pathname: string): boolean {
  return pathname.includes(EVENT_ROUTE_TOKEN);
}

export function isArticleOrEventScreen(pathname: string): boolean {
  return isArticleScreen(pathname) || isEventScreen(pathname);
}
