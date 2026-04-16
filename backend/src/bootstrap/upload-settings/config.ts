import path from 'node:path';

export type UploadSettings = {
  sizeOptimization: boolean;
  responsiveDimensions: boolean;
  autoOrientation: boolean;
  aiMetadata: boolean;
};

export type UploadableImage = {
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

export type ModernImageFormat = 'webp' | 'avif';

export type RuntimeOptimizationConfig = {
  format: ModernImageFormat;
  maxWidth: number;
  webpQuality: number;
  avifQuality: number;
  minSourceBytes: number;
  minSavingsPercent: number;
};

export type ExistingUploadFile = {
  id: number;
  url?: string | null;
  mime?: string | null;
  provider?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
};

export type ExistingImageOptimizationResult = {
  scanned: number;
  optimized: number;
  skipped: number;
  failed: number;
  totalSavedBytes: number;
  errors: Array<{ id: number; message: string }>;
};

export type FolderTreeNode = {
  id: number;
  name: string;
  parent?: number | null;
  children: FolderTreeNode[];
};

export const REQUIRED_UPLOAD_SETTINGS: UploadSettings = {
  sizeOptimization: true,
  responsiveDimensions: true,
  autoOrientation: true,
  aiMetadata: true,
};

export const DEFAULT_OPTIMIZATION_CONFIG: RuntimeOptimizationConfig = {
  format: 'webp',
  maxWidth: 2560,
  webpQuality: 78,
  avifQuality: 52,
  minSourceBytes: 120_000,
  minSavingsPercent: 12,
};

export const RETRYABLE_REMOVE_CODES = new Set(['EPERM', 'EBUSY', 'ENOTEMPTY']);
export const WINDOWS_TEMP_UNLINK_GUARD_KEY = '__ogkjtWindowsTempUnlinkGuardInstalled';
export const MANUAL_IMAGE_OPTIMIZER_ENDPOINT_KEY = '__ogkjtManualImageOptimizerEndpointInstalled';
export const UPLOAD_FOLDER_UID = 'plugin::upload.folder';
export const UPLOAD_FILE_UID = 'plugin::upload.file';

function toIntOrDefault(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
}

function getFormatFromEnv(value: string | undefined): ModernImageFormat {
  return value?.toLowerCase() === 'avif' ? 'avif' : 'webp';
}

export function getRuntimeOptimizationConfig(): RuntimeOptimizationConfig {
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

export function replaceExtension(value: string, nextExt: string) {
  return value.replace(/\.[^.]+$/, nextExt);
}

export function isOptimizableMimeType(mime: string | null | undefined) {
  if (!mime) return false;
  if (!mime.startsWith('image/')) return false;
  if (mime === 'image/svg+xml' || mime === 'image/gif') return false;
  return mime === 'image/jpeg' || mime === 'image/jpg' || mime === 'image/png' || mime === 'image/webp' || mime === 'image/avif';
}

export function resolveUploadFilePath(url: string | null | undefined) {
  if (!url || typeof url !== 'string') return null;
  if (!url.startsWith('/uploads/')) return null;
  const normalizedRelativePath = url.replace(/^\/+/, '').split('/').join(path.sep);
  return path.join(process.cwd(), 'public', normalizedRelativePath);
}
