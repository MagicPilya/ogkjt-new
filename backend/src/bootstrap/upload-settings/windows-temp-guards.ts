import type { Core } from '@strapi/strapi';

import { RETRYABLE_REMOVE_CODES, WINDOWS_TEMP_UNLINK_GUARD_KEY } from './config';
import { isRetryableWindowsTempUnlinkError, isWindowsUploadTmpPath, sleep } from './helpers';

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

    if (lastError) return;
  };

  fsExtra.__ogkjtWindowsRemovePatchApplied = true;
}

export function patchWindowsTempUnlinkCrashGuard(strapi: Core.Strapi) {
  if (process.platform !== 'win32') return;

  const processWithGuardFlag = process as NodeJS.Process & {
    [WINDOWS_TEMP_UNLINK_GUARD_KEY]?: boolean;
  };
  if (processWithGuardFlag[WINDOWS_TEMP_UNLINK_GUARD_KEY]) return;

  process.on('uncaughtException', (error) => {
    if (isRetryableWindowsTempUnlinkError(error)) {
      return;
    }

    strapi.log.error(error);
    process.exit(1);
  });

  processWithGuardFlag[WINDOWS_TEMP_UNLINK_GUARD_KEY] = true;
}
