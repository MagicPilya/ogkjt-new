const fs = require('node:fs/promises');
const path = require('node:path');

const { createStrapi } = require('@strapi/core');
const sharp = require('sharp');
sharp.cache(false);

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    i += 1;
  }
  return parsed;
}

function toIntOrDefault(value, fallback) {
  if (!value) return fallback;
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
}

function getFormatFromEnv(value) {
  return String(value || '').toLowerCase() === 'avif' ? 'avif' : 'webp';
}

function getRuntimeConfig() {
  const format = getFormatFromEnv(process.env.IMAGE_OPTIMIZER_FORMAT);
  return {
    format,
    nextExt: format === 'avif' ? '.avif' : '.webp',
    nextMime: format === 'avif' ? 'image/avif' : 'image/webp',
    maxWidth: toIntOrDefault(process.env.IMAGE_OPTIMIZER_MAX_WIDTH, 2560),
    webpQuality: toIntOrDefault(process.env.IMAGE_OPTIMIZER_WEBP_QUALITY, 78),
    avifQuality: toIntOrDefault(process.env.IMAGE_OPTIMIZER_AVIF_QUALITY, 52),
    minSourceBytes: toIntOrDefault(process.env.IMAGE_OPTIMIZER_MIN_SOURCE_BYTES, 120000),
    minSavingsPercent: toIntOrDefault(process.env.IMAGE_OPTIMIZER_MIN_SAVINGS_PERCENT, 12),
  };
}

function replaceExtension(value, nextExt) {
  const queryIndex = value.indexOf('?');
  const base = queryIndex === -1 ? value : value.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : value.slice(queryIndex);
  const nextBase = /\.[^.\/]+$/.test(base) ? base.replace(/\.[^.\/]+$/, nextExt) : `${base}${nextExt}`;
  return `${nextBase}${query}`;
}

function replaceNameExtension(name, nextExt) {
  const parsed = path.parse(name);
  return `${parsed.name}${nextExt}`;
}

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatPercent(savedBytes, sourceBytes) {
  if (!sourceBytes) return '0.00%';
  return `${((savedBytes / sourceBytes) * 100).toFixed(2)}%`;
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function rmWithRetry(targetPath, retries = 12, ignoreBusy = false) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      await fs.rm(targetPath, { force: true });
      return;
    } catch (error) {
      if (error && error.code === 'EBUSY' && attempt < retries) {
        await sleep(150 * (attempt + 1));
        continue;
      }
      if (error && error.code === 'EBUSY' && ignoreBusy) {
        console.error(`Пропущено удаление временного файла (занят): ${targetPath}`);
        return;
      }
      throw error;
    }
  }
}

async function renameWithRetry(fromPath, toPath, retries = 5) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      await fs.rename(fromPath, toPath);
      return;
    } catch (error) {
      if (error && error.code === 'EBUSY' && attempt < retries) {
        await sleep(100 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }
}

function resolveUploadPathFromUrl(backendDir, url) {
  if (!url || typeof url !== 'string') return null;
  let normalizedUrl = url;
  if (/^https?:\/\//i.test(url)) {
    try {
      normalizedUrl = new URL(url).pathname;
    } catch {
      return null;
    }
  }

  if (!normalizedUrl.startsWith('/uploads/')) return null;
  return path.join(backendDir, 'public', normalizedUrl.replace(/^\//, ''));
}

async function optimizeFileOnDisk(sourcePath, config) {
  const sourceStats = await fs.stat(sourcePath);
  if (sourceStats.size < config.minSourceBytes) {
    return { changed: false, reason: 'tiny', sourceBytes: sourceStats.size };
  }

  const tempPath = `${sourcePath}.tmp-modern-${Date.now()}${config.nextExt}`;
  const transformer = sharp(sourcePath).rotate().resize({
    width: config.maxWidth,
    withoutEnlargement: true,
  });
  const outputPipeline =
    config.format === 'avif'
      ? transformer.avif({ quality: config.avifQuality, effort: 5 })
      : transformer.webp({ quality: config.webpQuality, effort: 4 });

  await outputPipeline.toFile(tempPath);
  const [targetStats, outputMeta] = await Promise.all([fs.stat(tempPath), sharp(tempPath).metadata()]);
  const savingsPercent = ((sourceStats.size - targetStats.size) / sourceStats.size) * 100;

  if (targetStats.size >= sourceStats.size || savingsPercent < config.minSavingsPercent) {
    await rmWithRetry(tempPath, 12, true);
    return { changed: false, reason: 'no_gain', sourceBytes: sourceStats.size, targetBytes: targetStats.size };
  }

  const finalPath = sourcePath.endsWith(config.nextExt) ? sourcePath : replaceExtension(sourcePath, config.nextExt);
  return {
    changed: true,
    sourceBytes: sourceStats.size,
    targetBytes: targetStats.size,
    savingsPercent,
    tempPath,
    finalPath,
    width: outputMeta.width ?? null,
    height: outputMeta.height ?? null,
  };
}

async function optimizeMediaEntry(entry, backendDir, config, dryRun) {
  const sourcePath = resolveUploadPathFromUrl(backendDir, entry.url);
  if (!sourcePath) return { changed: false, reason: 'unsupported_url' };
  if (!(await exists(sourcePath))) return { changed: false, reason: 'file_not_found' };

  const result = await optimizeFileOnDisk(sourcePath, config);
  if (!result.changed) return result;

  if (!dryRun) {
    if (result.finalPath !== sourcePath && (await exists(result.finalPath))) {
      await rmWithRetry(result.finalPath);
    }
    await rmWithRetry(sourcePath);
    await renameWithRetry(result.tempPath, result.finalPath);
  } else {
    await rmWithRetry(result.tempPath, 12, true);
  }

  const next = {
    ...entry,
    mime: config.nextMime,
    ext: config.nextExt,
    url: replaceExtension(entry.url, config.nextExt),
    sizeInBytes: result.targetBytes,
    size: Number((result.targetBytes / 1000).toFixed(2)),
    width: result.width ?? entry.width ?? null,
    height: result.height ?? entry.height ?? null,
  };

  if (typeof entry.name === 'string' && entry.name.length > 0) {
    next.name = replaceNameExtension(entry.name, config.nextExt);
  }

  return { changed: true, result, next };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = Boolean(args['dry-run']);
  const processLimit = args.limit ? Number.parseInt(String(args.limit), 10) : null;
  const config = getRuntimeConfig();
  const backendDir = path.resolve(__dirname, '..');

  const strapi = createStrapi({
    appDir: backendDir,
    distDir: path.join(backendDir, 'dist'),
  });

  await strapi.load();

  const stats = {
    scanned: 0,
    optimized: 0,
    optimizedFormats: 0,
    sourceBytesMain: 0,
    targetBytesMain: 0,
    sourceBytesFormats: 0,
    targetBytesFormats: 0,
    skippedTiny: 0,
    skippedNoGain: 0,
    skippedMissing: 0,
    skippedUnsupported: 0,
  };

  try {
    const pageSize = 100;
    let offset = 0;
    let processed = 0;

    while (true) {
      const files = await strapi.db.query('plugin::upload.file').findMany({
        orderBy: { id: 'asc' },
        limit: pageSize,
        offset,
      });

      if (!Array.isArray(files) || files.length === 0) break;
      offset += files.length;

      for (const file of files) {
        if (processLimit && processed >= processLimit) break;
        processed += 1;
        stats.scanned += 1;

        if (!String(file.mime || '').startsWith('image/')) continue;
        if (file.mime === 'image/svg+xml' || file.mime === 'image/gif') continue;

        const mainEntry = {
          name: file.name,
          url: file.url,
          mime: file.mime,
          ext: file.ext,
          size: file.size,
          sizeInBytes: file.sizeInBytes,
          width: file.width,
          height: file.height,
        };

        const mainResult = await optimizeMediaEntry(mainEntry, backendDir, config, dryRun);
        const nextFormats = { ...(file.formats || {}) };
        let formatsChanged = false;

        for (const [key, value] of Object.entries(nextFormats)) {
          if (!value || typeof value !== 'object') continue;
          if (!('url' in value)) continue;
          const formatResult = await optimizeMediaEntry(value, backendDir, config, dryRun);
          if (formatResult.changed && formatResult.next) {
            nextFormats[key] = formatResult.next;
            formatsChanged = true;
            stats.optimizedFormats += 1;
            stats.sourceBytesFormats += formatResult.result.sourceBytes;
            stats.targetBytesFormats += formatResult.result.targetBytes;
          } else if (formatResult.reason === 'tiny') {
            stats.skippedTiny += 1;
          } else if (formatResult.reason === 'no_gain') {
            stats.skippedNoGain += 1;
          } else if (formatResult.reason === 'file_not_found') {
            stats.skippedMissing += 1;
          } else if (formatResult.reason === 'unsupported_url') {
            stats.skippedUnsupported += 1;
          }
        }

        if (mainResult.changed && mainResult.next) {
          stats.optimized += 1;
          stats.sourceBytesMain += mainResult.result.sourceBytes;
          stats.targetBytesMain += mainResult.result.targetBytes;
          if (!dryRun) {
            await strapi.db.query('plugin::upload.file').update({
              where: { id: file.id },
              data: {
                name: mainResult.next.name,
                url: mainResult.next.url,
                mime: mainResult.next.mime,
                ext: mainResult.next.ext,
                size: mainResult.next.size,
                sizeInBytes: mainResult.next.sizeInBytes,
                width: mainResult.next.width,
                height: mainResult.next.height,
                formats: nextFormats,
              },
            });
          }
          continue;
        }

        if (formatsChanged && !dryRun) {
          await strapi.db.query('plugin::upload.file').update({
            where: { id: file.id },
            data: { formats: nextFormats },
          });
        }

        if (mainResult.reason === 'tiny') {
          stats.skippedTiny += 1;
        } else if (mainResult.reason === 'no_gain') {
          stats.skippedNoGain += 1;
        } else if (mainResult.reason === 'file_not_found') {
          stats.skippedMissing += 1;
        } else if (mainResult.reason === 'unsupported_url') {
          stats.skippedUnsupported += 1;
        }
      }

      if (processLimit && processed >= processLimit) break;
    }
  } finally {
    await strapi.destroy();
  }

  console.log(`Режим: ${dryRun ? 'dry-run' : 'apply'}`);
  console.log(`Формат: ${config.format}`);
  console.log(`Проверено файлов: ${stats.scanned}`);
  console.log(`Оптимизировано оригиналов: ${stats.optimized}`);
  console.log(`Оптимизировано форматов: ${stats.optimizedFormats}`);
  const savedMainBytes = Math.max(0, stats.sourceBytesMain - stats.targetBytesMain);
  const savedFormatsBytes = Math.max(0, stats.sourceBytesFormats - stats.targetBytesFormats);
  const savedTotalBytes = Math.max(0, savedMainBytes + savedFormatsBytes);
  const sourceTotalBytes = stats.sourceBytesMain + stats.sourceBytesFormats;
  console.log(
    `Экономия по оригиналам: ${formatMb(savedMainBytes)} (${formatPercent(savedMainBytes, stats.sourceBytesMain)}) (${formatMb(
      stats.sourceBytesMain
    )} -> ${formatMb(stats.targetBytesMain)})`
  );
  console.log(
    `Экономия по форматам: ${formatMb(savedFormatsBytes)} (${formatPercent(savedFormatsBytes, stats.sourceBytesFormats)}) (${formatMb(
      stats.sourceBytesFormats
    )} -> ${formatMb(stats.targetBytesFormats)})`
  );
  console.log(`Суммарная экономия: ${formatMb(savedTotalBytes)} (${formatPercent(savedTotalBytes, sourceTotalBytes)})`);
  console.log(`Пропущено tiny: ${stats.skippedTiny}`);
  console.log(`Пропущено без выигрыша: ${stats.skippedNoGain}`);
  console.log(`Пропущено (файл не найден): ${stats.skippedMissing}`);
  console.log(`Пропущено (unsupported url): ${stats.skippedUnsupported}`);
}

main().catch((error) => {
  console.error('Ошибка media-reoptimize:', error);
  process.exit(1);
});
