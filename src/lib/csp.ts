/**
 * Значение Content-Security-Policy для HTML-страниц.
 * Должно совпадать с логикой proxy (nonce, dev/prod).
 */

/** Доп. источники изображений (см. next.config.ts — images.remotePatterns). */
const EXTRA_MEDIA_ORIGINS = [
  "https://images.unsplash.com",
  "https://www.devsu.site",
  "https://devsu.site",
  "https://api.devsu.site",
  "http://127.0.0.1:1337",
  "http://localhost:1337",
  "https://178.172.137.227",
  "http://178.172.137.227",
] as const;

/** Доп. источники для iframe (Google Sheets и связанные домены). */
const EXTRA_FRAME_ORIGINS = [
  "https://docs.google.com",
  "https://drive.google.com",
  "https://*.googleusercontent.com",
] as const;

function getStrapiOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_STRAPI_URL || "https://api.ogkjt.by";
  const trimmed = raw.replace(/\/+$/, "");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return "https://api.ogkjt.by";
  }
}

export function buildContentSecurityPolicy(nonce: string, isDev: boolean): string {
  const strapiOrigin = getStrapiOrigin();
  const mediaOrigins = [...new Set([strapiOrigin, ...EXTRA_MEDIA_ORIGINS])].join(" ");
  const frameOrigins = [...new Set(["'self'", "blob:", strapiOrigin, ...EXTRA_MEDIA_ORIGINS, ...EXTRA_FRAME_ORIGINS])].join(
    " "
  );

  const scriptSrc = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(isDev ? ["'unsafe-eval'"] : [])].join(
    " "
  );

  const styleSrc = ["'self'", isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`].join(" ");

  const connectSrc = isDev
    ? `'self' ${strapiOrigin} ws://127.0.0.1:* ws://localhost:* http://127.0.0.1:* http://localhost:*`
    : `'self' ${strapiOrigin}`;

  const parts = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src 'self' data: blob: ${mediaOrigins}`,
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    `frame-src ${frameOrigins}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ];

  return parts.join("; ").replace(/\s{2,}/g, " ").trim();
}
