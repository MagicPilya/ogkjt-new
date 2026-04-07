import type { Core } from '@strapi/strapi';

import { migrateArticleSectionUrls } from './bootstrap/migrations';
import {
  registerManualPageDedupeEndpoint,
  registerPageSyncOnMenuChange,
  registerPageTitleAutofill,
} from './bootstrap/menu';
import { setPublicPermissions } from './bootstrap/permissions';
import { seedGlobalIfEmpty, seedMenuIfEmpty, syncI18nLocaleDisplayNames } from './bootstrap/seed';
import {
  ensureUploadOptimizationSettings,
  patchUploadFolderStructure,
  patchUploadImageOptimizer,
  registerManualImageOptimizerEndpoint,
  patchWindowsTempUnlinkCrashGuard,
  patchWindowsUploadTempCleanup,
} from './bootstrap/upload-settings';
import { registerNewsImportEndpoint } from './bootstrap/news-import';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.customFields.register({
      name: 'menu-link-select',
      type: 'string',
      inputSize: { default: 6, isResizable: true },
    });

    registerPageTitleAutofill(strapi);
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      patchWindowsTempUnlinkCrashGuard(strapi);
      await patchWindowsUploadTempCleanup(strapi);
      patchUploadFolderStructure(strapi);
      patchUploadImageOptimizer(strapi);
      registerManualImageOptimizerEndpoint(strapi);
      registerNewsImportEndpoint(strapi);
      registerManualPageDedupeEndpoint(strapi);
      await setPublicPermissions(strapi);
      await syncI18nLocaleDisplayNames(strapi);
      await seedGlobalIfEmpty(strapi);
      await seedMenuIfEmpty(strapi);
      registerPageSyncOnMenuChange(strapi);
      await migrateArticleSectionUrls(strapi);
      await ensureUploadOptimizationSettings(strapi);
    } catch (error) {
      strapi.log.warn('Bootstrap default settings failed (при первом запуске можно перезапустить Strapi).', error);
    }
  },
};
