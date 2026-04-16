import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { RETRYABLE_REMOVE_CODES } from './config';

const WINDOWS_UPLOAD_TMP_PREFIX = path
  .normalize(path.join(os.tmpdir(), 'strapi-upload-'))
  .toLowerCase();
const WINDOWS_TEMP_PREFIX = path.normalize(os.tmpdir()).toLowerCase();

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isWindowsUploadTmpPath(targetPath: unknown): targetPath is string {
  if (process.platform !== 'win32') return false;
  if (typeof targetPath !== 'string') return false;
  return path.normalize(targetPath).toLowerCase().startsWith(WINDOWS_UPLOAD_TMP_PREFIX);
}

export function isWindowsTempPath(targetPath: unknown): targetPath is string {
  if (process.platform !== 'win32') return false;
  if (typeof targetPath !== 'string') return false;
  return path.normalize(targetPath).toLowerCase().startsWith(WINDOWS_TEMP_PREFIX);
}

export function isRetryableWindowsTempUnlinkError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? String((error as { code?: unknown }).code) : '';
  const syscall = 'syscall' in error ? String((error as { syscall?: unknown }).syscall) : '';
  const errorPath = 'path' in error ? (error as { path?: unknown }).path : undefined;
  return code === 'EPERM' && syscall === 'unlink' && isWindowsTempPath(errorPath);
}

export async function removeFileBestEffort(targetPath: string) {
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
