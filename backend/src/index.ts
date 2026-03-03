import type { Core } from '@strapi/strapi';

import { migrateArticleSectionUrls } from './bootstrap/migrations';
import { registerPageTitleAutofill, syncPagesFromMainMenu } from './bootstrap/menu';
import { setPublicPermissions } from './bootstrap/permissions';
import { seedGlobalIfEmpty, seedMenuIfEmpty } from './bootstrap/seed';
import { ensureUploadOptimizationSettings, patchUploadImageOptimizer } from './bootstrap/upload-settings';

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
      patchUploadImageOptimizer(strapi);
      await setPublicPermissions(strapi);
      await seedGlobalIfEmpty(strapi);
      await seedMenuIfEmpty(strapi);
      await syncPagesFromMainMenu(strapi);
      await migrateArticleSectionUrls(strapi);
      await ensureUploadOptimizationSettings(strapi);
    } catch (error) {
      strapi.log.warn('Bootstrap default settings failed (при первом запуске можно перезапустить Strapi).', error);
    }
  },
};
