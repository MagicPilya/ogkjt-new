/**
 * Глобальные middleware Strapi: CORS, сессионные куки (koa-session), безопасность.
 *
 * Prod (обязательно к проверке перед выкладкой):
 * - CORS_ORIGINS — явный whitelist через запятую (без "*"). Иначе сервер не стартует.
 * - CORS_CREDENTIALS — явно true/false (по умолчанию true), должно согласовываться с фронтом.
 * - CORS_ALLOW_HEADERS — опционально, через запятую, если нужны дополнительные разрешённые заголовки.
 * - SESSION_COOKIE_SAMESITE — strict | lax | none (для none нужен HTTPS и Secure).
 * - SESSION_COOKIE_SECURE — в prod по умолчанию true; false только для особых лабораторных сценариев.
 * - За reverse proxy с TLS: в server.ts включите KOA_TRUST_PROXY=true, иначе secure-куки и редиректы могут вести себя неверно.
 *
 * CSRF: публичный REST с JWT в заголовке Authorization не опирается на куки браузера.
 * Для сценариев с cookie-сессией риск CSRF снижается SameSite + узкий CORS + отключение credentials там, где куки не нужны.
 */

const parseCommaSeparated = (raw: string | undefined): string[] => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
};

const normalizeCorsOrigin = (value: string): string => {
  const v = value.trim();
  if (!v) return v;
  if (v === '*') return v;
  // Если схема не задана (например, ogkjt.by), считаем это HTTPS-origin для production.
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
};

/** Локальная разработка: если CORS_ORIGINS не задан, разрешены только эти origin (не prod). */
const DEFAULT_DEV_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:1337',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:1337',
];

const isProduction = process.env.NODE_ENV === 'production';

const resolveCorsOrigins = (env: any): string[] => {
  const fromEnv = parseCommaSeparated(env('CORS_ORIGINS')).map(normalizeCorsOrigin);

  if (fromEnv.length > 0) {
    return fromEnv;
  }

  if (!isProduction) {
    return DEFAULT_DEV_CORS_ORIGINS;
  }

  throw new Error(
    '[config/middlewares] В production задайте CORS_ORIGINS (через запятую, только доверенные origin). Без этого CORS отключён намеренно.',
  );
};

const normalizeSameSite = (raw: string | undefined): 'strict' | 'lax' | 'none' => {
  const v = (raw || 'lax').toLowerCase();
  if (v === 'strict' || v === 'lax' || v === 'none') return v;
  return 'lax';
};

export default ({ env }: { env: any }) => {
  const corsOrigins = resolveCorsOrigins(env);

  if (isProduction && corsOrigins.some((o) => o === '*')) {
    throw new Error(
      '[config/middlewares] В production нельзя указывать "*" в CORS_ORIGINS (несовместимо с credentials и whitelist).',
    );
  }

  /**
   * Access-Control-Allow-Credentials.
   * true — браузер может отправлять куки/Authorization с credentials: 'include' на cross-origin.
   * false — жёстче, если фронт и API same-site или только Bearer без кук.
   * В prod зафиксируйте явно через CORS_CREDENTIALS=true|false.
   */
  const corsCredentials = env.bool('CORS_CREDENTIALS', true);

  const sessionSecure = isProduction
    ? env.bool('SESSION_COOKIE_SECURE', true)
    : env.bool('SESSION_COOKIE_SECURE', false);

  let sameSite = normalizeSameSite(env('SESSION_COOKIE_SAMESITE', 'lax'));
  if (sameSite === 'none' && !sessionSecure) {
    // SameSite=None требует флаг Secure по спецификации; иначе браузер отклонит куку — откатываем к lax.
    sameSite = 'lax';
  }

  return [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    {
      name: 'strapi::cors',
      config: {
        enabled: true,
        /**
         * Только whitelist. В dev без CORS_ORIGINS — см. DEFAULT_DEV_CORS_ORIGINS.
         * Нельзя смешивать "*" с credentials: true (браузер запретит).
         */
        origin: corsOrigins,
        /**
         * Явная политика credentials для Access-Control-Allow-Credentials.
         */
        credentials: corsCredentials,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
        /** Базовый набор + CORS_ALLOW_HEADERS (через запятую), если фронт шлёт кастомные заголовки. */
        headers: [
          'Content-Type',
          'Authorization',
          'Origin',
          'Accept',
          'Strapi-Response-Format',
          'Strapi-Encode-Parameters',
          ...parseCommaSeparated(env('CORS_ALLOW_HEADERS')),
        ],
        keepHeaderOnError: true,
      },
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    {
      name: 'strapi::session',
      config: {
        /** Имя куки сессии (можно переопределить в prod для обфускации). */
        key: env('SESSION_COOKIE_NAME', 'koa.sess'),
        maxAge: env.int('SESSION_MAX_AGE_MS', 86400000),
        httpOnly: true,
        signed: true,
        /** В prod по умолчанию true — кука только по HTTPS. */
        secure: sessionSecure,
        /**
         * lax — разумный дефолт (GET-навигация с внешних сайтов не шлёт куку).
         * strict — жёстче; none — только если реально нужен cross-site POST с кукой (редко, нужен Secure + корректный CORS).
         */
        sameSite,
        rolling: env.bool('SESSION_ROLLING', false),
        renew: env.bool('SESSION_RENEW', false),
      },
    },
    'strapi::favicon',
    'strapi::public',
  ];
};
