import type { Core } from '@strapi/strapi';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import sharp from 'sharp';

type UploadSettings = {
  sizeOptimization: boolean;
  responsiveDimensions: boolean;
  autoOrientation: boolean;
  aiMetadata: boolean;
};

type FolderTreeNode = {
  id: number;
  name: string;
  parent?: number | null;
  children: FolderTreeNode[];
};

const REQUIRED_UPLOAD_SETTINGS: UploadSettings = {
  sizeOptimization: true,
  responsiveDimensions: true,
  autoOrientation: true,
  aiMetadata: true,
};

type UploadableImage = {
  filepath: string;
  tmpWorkingDirectory?: string;
  name?: string;
  url?: string;
  mime?: string;
  ext?: string;
  hash?: string;
  width?: number | null;
  height?: number | null;
  size?: number;
  sizeInBytes?: number;
  getStream?: () => NodeJS.ReadableStream;
};

type ModernImageFormat = 'webp' | 'avif';

type RuntimeOptimizationConfig = {
  format: ModernImageFormat;
  maxWidth: number;
  webpQuality: number;
  avifQuality: number;
  minSourceBytes: number;
  minSavingsPercent: number;
};

type ExistingUploadFile = {
  id: number;
  url?: string | null;
  mime?: string | null;
  provider?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
};

type ExistingImageOptimizationResult = {
  scanned: number;
  optimized: number;
  skipped: number;
  failed: number;
  totalSavedBytes: number;
  errors: Array<{ id: number; message: string }>;
};

const DEFAULT_OPTIMIZATION_CONFIG: RuntimeOptimizationConfig = {
  format: 'webp',
  maxWidth: 2560,
  webpQuality: 78,
  avifQuality: 52,
  minSourceBytes: 120_000,
  minSavingsPercent: 12,
};

const WINDOWS_UPLOAD_TMP_PREFIX = path
  .normalize(path.join(os.tmpdir(), 'strapi-upload-'))
  .toLowerCase();
const WINDOWS_TEMP_PREFIX = path.normalize(os.tmpdir()).toLowerCase();
const RETRYABLE_REMOVE_CODES = new Set(['EPERM', 'EBUSY', 'ENOTEMPTY']);
const WINDOWS_TEMP_UNLINK_GUARD_KEY = '__ogkjtWindowsTempUnlinkGuardInstalled';
const MANUAL_IMAGE_OPTIMIZER_ENDPOINT_KEY = '__ogkjtManualImageOptimizerEndpointInstalled';
const UPLOAD_FOLDER_UID = 'plugin::upload.folder';
const UPLOAD_FILE_UID = 'plugin::upload.file';

function toIntOrDefault(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
}

function getFormatFromEnv(value: string | undefined): ModernImageFormat {
  return value?.toLowerCase() === 'avif' ? 'avif' : 'webp';
}

function getRuntimeOptimizationConfig(): RuntimeOptimizationConfig {
  return {
    format: getFormatFromEnv(process.env.IMAGE_OPTIMIZER_FORMAT),
    maxWidth: toIntOrDefault(process.env.IMAGE_OPTIMIZER_MAX_WIDTH, DEFAULT_OPTIMIZATION_CONFIG.maxWidth),
    webpQuality: toIntOrDefault(process.env.IMAGE_OPTIMIZER_WEBP_QUALITY, DEFAULT_OPTIMIZATION_CONFIG.webpQuality),
    avifQuality: toIntOrDefault(process.env.IMAGE_OPTIMIZER_AVIF_QUALITY, DEFAULT_OPTIMIZATION_CONFIG.avifQuality),
    minSourceBytes: toIntOrDefault(
      process.env.IMAGE_OPTIMIZER_MIN_SOURCE_BYTES,
      DEFAULT_OPTIMIZATION_CONFIG.minSourceBytes
    ),
    minSavingsPercent: toIntOrDefault(
      process.env.IMAGE_OPTIMIZER_MIN_SAVINGS_PERCENT,
      DEFAULT_OPTIMIZATION_CONFIG.minSavingsPercent
    ),
  };
}

function replaceExtension(value: string, nextExt: string) {
  return value.replace(/\.[^.]+$/, nextExt);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isWindowsUploadTmpPath(targetPath: unknown): targetPath is string {
  if (process.platform !== 'win32') return false;
  if (typeof targetPath !== 'string') return false;
  return path.normalize(targetPath).toLowerCase().startsWith(WINDOWS_UPLOAD_TMP_PREFIX);
}

function isWindowsTempPath(targetPath: unknown): targetPath is string {
  if (process.platform !== 'win32') return false;
  if (typeof targetPath !== 'string') return false;
  return path.normalize(targetPath).toLowerCase().startsWith(WINDOWS_TEMP_PREFIX);
}

function isRetryableWindowsTempUnlinkError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? String((error as { code?: unknown }).code) : '';
  const syscall = 'syscall' in error ? String((error as { syscall?: unknown }).syscall) : '';
  const errorPath = 'path' in error ? (error as { path?: unknown }).path : undefined;
  return code === 'EPERM' && syscall === 'unlink' && isWindowsTempPath(errorPath);
}

async function removeFileBestEffort(targetPath: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await fs.rm(targetPath, { force: true });
      return;
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: unknown }).code)
          : '';
      if (!isWindowsUploadTmpPath(targetPath) || !RETRYABLE_REMOVE_CODES.has(code)) {
        throw error;
      }
      lastError = error;
      await sleep(80 * (attempt + 1));
    }
  }

  if (lastError) {
    // We don't fail upload because a temporary optimized file could not be removed.
    return;
  }
}

export async function patchWindowsUploadTempCleanup(strapi: Core.Strapi) {
  if (process.platform !== 'win32') return;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fsExtra = require('fs-extra') as {
    remove: (...args: unknown[]) => Promise<void>;
    __ogkjtWindowsRemovePatchApplied?: boolean;
  };

  if (fsExtra.__ogkjtWindowsRemovePatchApplied) return;

  const originalRemove = fsExtra.remove.bind(fsExtra);

  fsExtra.remove = async (...args: unknown[]) => {
    const [targetPath] = args;
    let lastError: unknown;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await originalRemove(...args);
        return;
      } catch (error) {
        const code =
          error && typeof error === 'object' && 'code' in error
            ? String((error as { code?: unknown }).code)
            : '';
        if (!isWindowsUploadTmpPath(targetPath) || !RETRYABLE_REMOVE_CODES.has(code)) {
          throw error;
        }
        lastError = error;
        await sleep(80 * (attempt + 1));
      }
    }

    strapi.log.warn(
      `Skip temp cleanup after retries: ${typeof targetPath === 'string' ? targetPath : 'unknown path'}`
    );
    if (lastError) return;
  };

  fsExtra.__ogkjtWindowsRemovePatchApplied = true;
  strapi.log.info('Enabled retry for Windows upload temp cleanup.');
}

export function patchWindowsTempUnlinkCrashGuard(strapi: Core.Strapi) {
  if (process.platform !== 'win32') return;

  const processWithGuardFlag = process as NodeJS.Process & {
    [WINDOWS_TEMP_UNLINK_GUARD_KEY]?: boolean;
  };
  if (processWithGuardFlag[WINDOWS_TEMP_UNLINK_GUARD_KEY]) return;

  process.on('uncaughtException', (error) => {
    if (isRetryableWindowsTempUnlinkError(error)) {
      const errorPath = 'path' in (error as { path?: unknown }) ? (error as { path?: unknown }).path : '';
      strapi.log.warn(`Ignored Windows temp unlink EPERM: ${String(errorPath)}`);
      return;
    }

    strapi.log.error(error);
    process.exit(1);
  });

  processWithGuardFlag[WINDOWS_TEMP_UNLINK_GUARD_KEY] = true;
  strapi.log.info('Enabled Windows temp unlink crash guard.');
}

export async function ensureUploadOptimizationSettings(strapi: Core.Strapi) {
  const uploadSettingsStore = strapi.store({
    type: 'plugin',
    name: 'upload',
    key: 'settings',
  });

  const currentSettings = (await uploadSettingsStore.get({})) as Partial<UploadSettings> | null;
  const nextSettings: UploadSettings = {
    ...(currentSettings ?? {}),
    ...REQUIRED_UPLOAD_SETTINGS,
  };

  const hasChanges =
    currentSettings?.sizeOptimization !== nextSettings.sizeOptimization ||
    currentSettings?.responsiveDimensions !== nextSettings.responsiveDimensions ||
    currentSettings?.autoOrientation !== nextSettings.autoOrientation ||
    currentSettings?.aiMetadata !== nextSettings.aiMetadata;

  if (!hasChanges) return;

  await uploadSettingsStore.set({ value: nextSettings });
}

export function patchUploadFolderStructure(strapi: Core.Strapi) {
  const folderService = strapi.plugin('upload').service('folder') as {
    getStructure?: () => Promise<unknown>;
    __ogkjtFolderStructurePatchApplied?: boolean;
  };

  if (!folderService?.getStructure || folderService.__ogkjtFolderStructurePatchApplied) return;

  folderService.getStructure = async () => {
    const metadata = strapi.db.metadata.get(UPLOAD_FOLDER_UID) as {
      attributes?: {
        parent?: {
          joinTable?: {
            name: string;
            joinColumn: { name: string };
            inverseJoinColumn: { name: string };
          };
        };
      };
    };
    const joinTable = metadata.attributes?.parent?.joinTable;

    const folders = (await strapi.db.query(UPLOAD_FOLDER_UID).findMany({
      select: ['id', 'name'],
    })) as Array<{ id: number; name: string }>;
    if (!folders.length) return [];

    const parentByFolderId = new Map<number, number>();
    if (joinTable) {
      const rows = (await strapi.db
        .connection(joinTable.name)
        .select(
          `${joinTable.joinColumn.name} as folderId`,
          `${joinTable.inverseJoinColumn.name} as parentId`
        )) as Array<{ folderId?: number; parentId?: number }>;
      for (const row of rows) {
        if (!row?.folderId || !row?.parentId) continue;
        parentByFolderId.set(Number(row.folderId), Number(row.parentId));
      }
    }

    const nodesById = new Map<number, FolderTreeNode>();
    for (const folder of folders) {
      nodesById.set(folder.id, {
        id: folder.id,
        name: folder.name,
        parent: parentByFolderId.get(folder.id) ?? null,
        children: [],
      });
    }

    const roots: FolderTreeNode[] = [];
    for (const node of nodesById.values()) {
      if (node.parent && nodesById.has(node.parent)) {
        nodesById.get(node.parent)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    const sortTree = (nodes: FolderTreeNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      for (const node of nodes) {
        if (node.children.length) sortTree(node.children);
      }
    };

    sortTree(roots);
    strapi.log.info(`Upload folder structure roots: ${roots.map((node) => `${node.id}:${node.name}`).join(', ')}`);
    return roots;
  };

  folderService.__ogkjtFolderStructurePatchApplied = true;
  strapi.log.info('Patched upload folder structure for root folders.');
}

export function patchUploadImageOptimizer(strapi: Core.Strapi) {
  const runtimeConfig = getRuntimeOptimizationConfig();
  const imageManipulationService = strapi.plugin('upload').service('image-manipulation') as {
    optimize?: (file: UploadableImage) => Promise<UploadableImage>;
    isImage?: (file: UploadableImage) => Promise<boolean | undefined>;
  };

  if (!imageManipulationService?.optimize || !imageManipulationService?.isImage) return;

  const originalOptimize = imageManipulationService.optimize.bind(imageManipulationService);

  imageManipulationService.optimize = async (file: UploadableImage) => {
    const optimizedFile = await originalOptimize(file);
    const isImage = await imageManipulationService.isImage?.(optimizedFile);

    if (!isImage) return optimizedFile;
    if (optimizedFile.mime === 'image/svg+xml' || optimizedFile.mime === 'image/gif') return optimizedFile;
    const sourceStats = await fs.stat(optimizedFile.filepath);
    if (sourceStats.size < runtimeConfig.minSourceBytes) return optimizedFile;

    const nextExt = runtimeConfig.format === 'avif' ? '.avif' : '.webp';
    const targetPath = optimizedFile.tmpWorkingDirectory
      ? path.join(optimizedFile.tmpWorkingDirectory, `modern-${optimizedFile.hash ?? Date.now()}${nextExt}`)
      : `${optimizedFile.filepath}${nextExt}`;

    const transformer = sharp(optimizedFile.filepath).rotate().resize({
      width: runtimeConfig.maxWidth,
      withoutEnlargement: true,
    });
    const outputPipeline =
      runtimeConfig.format === 'avif'
        ? transformer.avif({ quality: runtimeConfig.avifQuality, effort: 5 })
        : transformer.webp({ quality: runtimeConfig.webpQuality, effort: 4 });

    await outputPipeline.toFile(targetPath);

    const [targetStats, outputMeta] = await Promise.all([fs.stat(targetPath), sharp(targetPath).metadata()]);
    const nextSizeInBytes = targetStats.size;
    const savingsPercent = ((sourceStats.size - nextSizeInBytes) / sourceStats.size) * 100;
    if (nextSizeInBytes >= sourceStats.size || savingsPercent < runtimeConfig.minSavingsPercent) {
      await removeFileBestEffort(targetPath);
      return optimizedFile;
    }

    optimizedFile.filepath = targetPath;
    optimizedFile.mime = runtimeConfig.format === 'avif' ? 'image/avif' : 'image/webp';
    optimizedFile.ext = nextExt;
    if (optimizedFile.name) {
      const parsedName = path.parse(optimizedFile.name);
      optimizedFile.name = `${parsedName.name}${nextExt}`;
    }
    if (optimizedFile.url) {
      optimizedFile.url = replaceExtension(optimizedFile.url, nextExt);
    }
    optimizedFile.sizeInBytes = nextSizeInBytes;
    optimizedFile.size = Number((nextSizeInBytes / 1000).toFixed(2));
    optimizedFile.width = outputMeta.width ?? optimizedFile.width;
    optimizedFile.height = outputMeta.height ?? optimizedFile.height;
    optimizedFile.getStream = () => createReadStream(targetPath);

    return optimizedFile;
  };
}

function isOptimizableMimeType(mime: string | null | undefined) {
  if (!mime) return false;
  if (!mime.startsWith('image/')) return false;
  if (mime === 'image/svg+xml' || mime === 'image/gif') return false;
  return mime === 'image/jpeg' || mime === 'image/jpg' || mime === 'image/png' || mime === 'image/webp' || mime === 'image/avif';
}

function resolveUploadFilePath(url: string | null | undefined) {
  if (!url || typeof url !== 'string') return null;
  if (!url.startsWith('/uploads/')) return null;
  const normalizedRelativePath = url.replace(/^\/+/, '').split('/').join(path.sep);
  return path.join(process.cwd(), 'public', normalizedRelativePath);
}

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
  strapi.log.info('Registered manual image optimizer admin endpoint.');
}
