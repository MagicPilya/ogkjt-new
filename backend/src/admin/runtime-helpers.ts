export function getAdminJwtToken(): string | null {
  const localStorageCandidates = ['jwtToken', 'strapi-admin-jwt', 'token'];
  for (const key of localStorageCandidates) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    const trimmed = raw.trim();

    if (!trimmed) continue;
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed) as { jwt?: string; token?: string };
        if (typeof parsed.jwt === 'string' && parsed.jwt) return parsed.jwt;
        if (typeof parsed.token === 'string' && parsed.token) return parsed.token;
      } catch {
        // ignore invalid JSON and keep fallback checks.
      }
    }

    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'string' && parsed) return parsed;
      } catch {
        // ignore parse error and fallback to raw value.
      }
    }

    return trimmed;
  }

  return null;
}

export function isDraftShortcutScreen(pathname: string): boolean {
  return (
    pathname.includes('/content-manager/collection-types/api::article.article') ||
    pathname.includes('/content-manager/collection-types/api::event.event') ||
    pathname.includes('/content-manager/collection-types/api::page.page')
  );
}
