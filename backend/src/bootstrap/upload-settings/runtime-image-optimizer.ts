import type { Core } from '@strapi/strapi';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

import {
  type UploadableImage,
  getRuntimeOptimizationConfig,
  replaceExtension,
} from './config';
import { removeFileBestEffort } from './helpers';

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
