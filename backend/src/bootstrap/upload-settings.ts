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
const UPLOAD_FOLDER_UID = 'plugin::upload.folder';

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
