import type { Core } from '@strapi/strapi';
import fs from 'node:fs/promises';

import sharp from 'sharp';

import {
  MANUAL_IMAGE_OPTIMIZER_ENDPOINT_KEY,
  RETRYABLE_REMOVE_CODES,
  UPLOAD_FILE_UID,
  type ExistingImageOptimizationResult,
  type ExistingUploadFile,
  type RuntimeOptimizationConfig,
  getRuntimeOptimizationConfig,
  isOptimizableMimeType,
  resolveUploadFilePath,
} from './config';
import { sleep } from './helpers';

async function optimizeExistingImageFileInPlace(
  filePath: string,
  mime: string,
  runtimeConfig: RuntimeOptimizationConfig
): Promise<{ optimized: boolean; savedBytes: number; width: number | null; height: number | null; nextSizeKb: number }> {
  const cleanupTempFile = async (tempPath: string) => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await fs.rm(tempPath, { force: true });
        return;
      } catch (error) {
        const code =
          error && typeof error === 'object' && 'code' in error
            ? String((error as { code?: unknown }).code)
            : '';
        if (process.platform !== 'win32' || !RETRYABLE_REMOVE_CODES.has(code)) {
          return;
        }
        await sleep(80 * (attempt + 1));
      }
    }
  };

  const sourceStats = await fs.stat(filePath);
  if (sourceStats.size < runtimeConfig.minSourceBytes) {
    const sourceMeta = await sharp(filePath).metadata();
    return {
      optimized: false,
      savedBytes: 0,
      width: sourceMeta.width ?? null,
      height: sourceMeta.height ?? null,
      nextSizeKb: Number((sourceStats.size / 1000).toFixed(2)),
    };
  }

  const tempOutputPath = `${filePath}.optimized-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const pipeline = sharp(filePath).rotate().resize({
    width: runtimeConfig.maxWidth,
    withoutEnlargement: true,
  });

  if (mime === 'image/jpeg' || mime === 'image/jpg') {
    pipeline.jpeg({ quality: runtimeConfig.webpQuality, mozjpeg: true });
  } else if (mime === 'image/png') {
    pipeline.png({ quality: runtimeConfig.webpQuality, compressionLevel: 9, adaptiveFiltering: true });
  } else if (mime === 'image/webp') {
    pipeline.webp({ quality: runtimeConfig.webpQuality, effort: 4 });
  } else if (mime === 'image/avif') {
    pipeline.avif({ quality: runtimeConfig.avifQuality, effort: 5 });
  } else {
    const sourceMeta = await sharp(filePath).metadata();
    return {
      optimized: false,
      savedBytes: 0,
      width: sourceMeta.width ?? null,
      height: sourceMeta.height ?? null,
      nextSizeKb: Number((sourceStats.size / 1000).toFixed(2)),
    };
  }

  await pipeline.toFile(tempOutputPath);

  const [targetStats, targetMeta] = await Promise.all([fs.stat(tempOutputPath), sharp(tempOutputPath).metadata()]);
  const savedBytes = sourceStats.size - targetStats.size;
  const savingsPercent = (savedBytes / sourceStats.size) * 100;

  if (savedBytes <= 0 || savingsPercent < runtimeConfig.minSavingsPercent) {
    await cleanupTempFile(tempOutputPath);
    return {
      optimized: false,
      savedBytes: 0,
      width: targetMeta.width ?? null,
      height: targetMeta.height ?? null,
      nextSizeKb: Number((sourceStats.size / 1000).toFixed(2)),
    };
  }

  await fs.rename(tempOutputPath, filePath);
  return {
    optimized: true,
    savedBytes,
    width: targetMeta.width ?? null,
    height: targetMeta.height ?? null,
    nextSizeKb: Number((targetStats.size / 1000).toFixed(2)),
  };
}

export async function optimizeExistingUploadImages(
  strapi: Core.Strapi,
  options?: { limit?: number }
): Promise<ExistingImageOptimizationResult> {
  const runtimeConfig = getRuntimeOptimizationConfig();
  const requestedLimit = options?.limit ?? Number.MAX_SAFE_INTEGER;
  const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.trunc(requestedLimit)) : Number.MAX_SAFE_INTEGER;

  const files = (await strapi.db.query(UPLOAD_FILE_UID).findMany({
    select: ['id', 'url', 'mime', 'provider', 'size', 'width', 'height'],
    orderBy: [{ id: 'asc' }],
  })) as ExistingUploadFile[];

  const result: ExistingImageOptimizationResult = {
    scanned: 0,
    optimized: 0,
    skipped: 0,
    failed: 0,
    totalSavedBytes: 0,
    errors: [],
  };

  for (const file of files) {
    if (result.scanned >= limit) break;
    result.scanned += 1;

    try {
      if (file.provider && file.provider !== 'local') {
        result.skipped += 1;
        continue;
      }
      if (!isOptimizableMimeType(file.mime)) {
        result.skipped += 1;
        continue;
      }

      const filePath = resolveUploadFilePath(file.url);
      if (!filePath) {
        result.skipped += 1;
        continue;
      }

      const optimized = await optimizeExistingImageFileInPlace(filePath, file.mime as string, runtimeConfig);
      if (!optimized.optimized) {
        result.skipped += 1;
        continue;
      }

      await strapi.db.query(UPLOAD_FILE_UID).update({
        where: { id: file.id },
        data: {
          size: optimized.nextSizeKb,
          width: optimized.width,
          height: optimized.height,
        },
      });

      result.optimized += 1;
      result.totalSavedBytes += optimized.savedBytes;
    } catch (error) {
      result.failed += 1;
      result.errors.push({
        id: file.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return result;
}

export function registerManualImageOptimizerEndpoint(strapi: Core.Strapi) {
  const strapiServer = strapi.server as Core.Strapi['server'] & {
    [MANUAL_IMAGE_OPTIMIZER_ENDPOINT_KEY]?: boolean;
  };
  if (strapiServer[MANUAL_IMAGE_OPTIMIZER_ENDPOINT_KEY]) return;

  strapi.server.use(async (ctx, next) => {
    if (!(ctx.method === 'POST' && ctx.path === '/content-manager/image-optimizer/run')) {
      await next();
      return;
    }

    const requestBody = (ctx.request.body ?? {}) as { limit?: unknown };
    const limit = typeof requestBody.limit === 'number' ? requestBody.limit : undefined;

    try {
      const optimizationResult = await optimizeExistingUploadImages(strapi, { limit });
      ctx.status = 200;
      ctx.body = { data: optimizationResult };
    } catch (error) {
      strapi.log.error('Manual image optimizer failed.', error);
      ctx.status = 500;
      ctx.body = {
        data: null,
        error: {
          status: 500,
          name: 'ApplicationError',
          message: 'Ошибка при оптимизации изображений.',
          details: {},
        },
      };
    }
  });

  strapiServer[MANUAL_IMAGE_OPTIMIZER_ENDPOINT_KEY] = true;
}
