import type { Core } from '@strapi/strapi';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

type UploadSettings = {
  sizeOptimization: boolean;
  responsiveDimensions: boolean;
  autoOrientation: boolean;
  aiMetadata: boolean;
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
      await fs.rm(targetPath, { force: true });
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
