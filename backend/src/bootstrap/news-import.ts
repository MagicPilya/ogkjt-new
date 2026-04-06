import type { Core } from '@strapi/strapi';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

const NEWS_IMPORT_ENDPOINT_KEY = Symbol('ogkjt.news-import.endpoint');

type ImportRequestBody = {
  dryRun?: unknown;
};

type UploadedLike = {
  filepath?: string;
  path?: string;
  tempFilePath?: string;
  originalFilename?: string;
  name?: string;
};

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function runImportProcess({
  cwd,
  sourceDir,
  strapiUrl,
  strapiToken,
  dryRun,
}: {
  cwd: string;
  sourceDir: string;
  strapiUrl: string;
  strapiToken: string;
  dryRun: boolean;
}) {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(cwd, 'scripts', 'import-news-from-dir.mjs'), sourceDir],
      {
        cwd,
        env: {
          ...process.env,
          STRAPI_URL: strapiUrl,
          STRAPI_TOKEN: strapiToken,
          DRY_RUN: dryRun ? '1' : '0',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });
    child.on('error', (error) => reject(error));
    child.on('close', (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

export function registerNewsImportEndpoint(strapi: Core.Strapi) {
  const strapiServer = strapi.server as Core.Strapi['server'] & {
    [NEWS_IMPORT_ENDPOINT_KEY]?: boolean;
  };
  if (strapiServer[NEWS_IMPORT_ENDPOINT_KEY]) return;

  strapi.server.use(async (ctx, next) => {
    if (!(ctx.method === 'POST' && ctx.path === '/content-manager/news-import/zip')) {
      await next();
      return;
    }

    const body = (ctx.request.body ?? {}) as ImportRequestBody;
    const dryRun = body.dryRun === true || String(body.dryRun ?? '').toLowerCase() === 'true';

    const tokenFromEnv = process.env.NEWS_IMPORT_TOKEN?.trim() || '';
    const providedToken = String(ctx.request.headers['x-news-import-token'] ?? '').trim();
    const adminAuthHeader = String(ctx.request.headers.authorization ?? '').trim();
    const hasAdminBearer = /^bearer\s+/i.test(adminAuthHeader);

    // Security model:
    // - If NEWS_IMPORT_TOKEN is configured -> require x-news-import-token match.
    // - If not configured -> allow requests from authenticated Strapi Admin (Bearer/cookie flow).
    if (tokenFromEnv) {
      if (!providedToken || providedToken !== tokenFromEnv) {
        ctx.status = 401;
        ctx.body = {
          data: null,
          error: {
            status: 401,
            name: 'UnauthorizedError',
            message: 'Неверный токен запуска импорта.',
            details: {},
          },
        };
        return;
      }
    } else if (!hasAdminBearer && !ctx.state?.user) {
      ctx.status = 401;
      ctx.body = {
        data: null,
        error: {
          status: 401,
          name: 'UnauthorizedError',
          message: 'Требуется авторизация администратора.',
          details: {},
        },
      };
      return;
    }

    const cwd = process.cwd();
    const strapiUrl = process.env.STRAPI_PUBLIC_URL || process.env.STRAPI_URL || 'http://127.0.0.1:1337';
    const bearerToken = hasAdminBearer ? adminAuthHeader.replace(/^bearer\s+/i, '').trim() : '';
    const strapiImportToken =
      process.env.STRAPI_TOKEN?.trim() ||
      process.env.NEWS_IMPORT_STRAPI_TOKEN?.trim() ||
      providedToken ||
      bearerToken ||
      '';
    if (!strapiImportToken) {
      ctx.status = 500;
      ctx.body = {
        data: null,
        error: {
          status: 500,
          name: 'ApplicationError',
          message:
            'Не найден токен для импорта: задайте STRAPI_TOKEN/NEWS_IMPORT_STRAPI_TOKEN в env или передайте токен в поле модалки.',
          details: {},
        },
      };
      return;
    }
    const filesContainer = (ctx.request.files ?? {}) as Record<string, UploadedLike | UploadedLike[]>;
    const firstFileValue = filesContainer.zip ?? Object.values(filesContainer)[0];
    const uploadFile = Array.isArray(firstFileValue) ? firstFileValue[0] : firstFileValue;
    const zipPath = uploadFile?.filepath ?? uploadFile?.path ?? uploadFile?.tempFilePath ?? '';
    const zipName = uploadFile?.originalFilename ?? uploadFile?.name ?? path.basename(zipPath || '');

    if (!zipPath || !(await exists(zipPath))) {
      ctx.status = 400;
      ctx.body = {
        data: null,
        error: {
          status: 400,
          name: 'ValidationError',
          message: 'ZIP-файл не получен (ожидается поле "zip").',
          details: {},
        },
      };
      return;
    }
    if (!String(zipName).toLowerCase().endsWith('.zip')) {
      ctx.status = 400;
      ctx.body = {
        data: null,
        error: {
          status: 400,
          name: 'ValidationError',
          message: 'Поддерживается только ZIP-архив.',
          details: {},
        },
      };
      return;
    }

    const pickImportRoot = async (extractedDir: string) => {
      const candidates = [extractedDir];
      const firstLevel = (await fs.readdir(extractedDir, { withFileTypes: true }))
        .filter((d) => d.isDirectory())
        .map((d) => path.join(extractedDir, d.name));
      candidates.push(...firstLevel);
      for (const level1 of firstLevel) {
        const level2 = (await fs.readdir(level1, { withFileTypes: true }))
          .filter((d) => d.isDirectory())
          .map((d) => path.join(level1, d.name));
        candidates.push(...level2);
      }

      let best = extractedDir;
      let bestScore = -1;
      for (const dir of candidates) {
        let score = 0;
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const e of entries) {
            if (!e.isDirectory()) continue;
            if (await exists(path.join(dir, e.name, 'meta.json'))) score += 1;
          }
        } catch {
          continue;
        }
        if (score > bestScore) {
          best = dir;
          bestScore = score;
        }
      }
      return best;
    };

    let workDir = '';
    try {
      workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'news-zip-import-'));
      const extractedDir = path.join(workDir, 'extracted');
      await fs.mkdir(extractedDir, { recursive: true });

      const { default: AdmZip } = await import('adm-zip');
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractedDir, true);
      await fs.unlink(zipPath).catch(() => undefined);

      const sourceDir = await pickImportRoot(extractedDir);
      const result = await runImportProcess({
        cwd,
        sourceDir,
        strapiUrl,
        strapiToken: strapiImportToken,
        dryRun,
      });

      const ok = result.code === 0;
      ctx.status = ok ? 200 : 500;
      ctx.body = {
        data: {
          ok,
          code: result.code,
          sourceDir,
          stdout: result.stdout.slice(-12000),
          stderr: result.stderr.slice(-12000),
        },
        ...(ok
          ? {}
          : {
              error: {
                status: 500,
                name: 'ApplicationError',
                message: 'Импорт завершился с ошибкой.',
                details: {},
              },
            }),
      };
    } catch (error) {
      strapi.log.error('News import endpoint failed.', error);
      ctx.status = 500;
      ctx.body = {
        data: null,
        error: {
          status: 500,
          name: 'ApplicationError',
          message: error instanceof Error ? error.message : 'Неизвестная ошибка импорта.',
          details: {},
        },
      };
    } finally {
      if (workDir) {
        await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
      }
    }
  });

  strapiServer[NEWS_IMPORT_ENDPOINT_KEY] = true;
  strapi.log.info('Registered news import endpoint (/content-manager/news-import/zip).');
}

