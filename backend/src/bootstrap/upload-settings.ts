import type { Core } from '@strapi/strapi';

import { REQUIRED_UPLOAD_SETTINGS, type UploadSettings } from './upload-settings/config';
export { patchUploadFolderStructure } from './upload-settings/folder-structure';
export { optimizeExistingUploadImages, registerManualImageOptimizerEndpoint } from './upload-settings/existing-image-optimizer';
export { patchUploadImageOptimizer } from './upload-settings/runtime-image-optimizer';
export { patchWindowsTempUnlinkCrashGuard, patchWindowsUploadTempCleanup } from './upload-settings/windows-temp-guards';

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
