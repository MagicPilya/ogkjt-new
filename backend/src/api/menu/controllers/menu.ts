/**
 * menu controller
 * Single type с i18n: find и update обязательно передают locale в Document Service.
 * Иначе при сохранении в одной локали меняются все.
 */

import { factories } from '@strapi/strapi';
import { DEFAULT_MENU_LOCALE } from '../../../bootstrap/constants';
import { collectUrlTitleFromMenu, syncPagesByItems } from '../../../bootstrap/menu';
import type { MenuSection } from '../../../bootstrap/types';
import { createLocalizedSingleTypeController } from '../../../utils/createLocalizedSingleTypeController';

const uid = 'api::menu.menu';

const populate = {
  mainMenu: {
    populate: {
      links: { populate: ['sublinks'] },
    },
  },
};

export default factories.createCoreController(uid, ({ strapi }) => ({
  ...createLocalizedSingleTypeController(strapi, uid, { populate }),

  async find(ctx) {
    const locale = typeof ctx.query?.locale === 'string' && ctx.query.locale.trim() ? ctx.query.locale : DEFAULT_MENU_LOCALE;
    const localizedController = createLocalizedSingleTypeController(strapi, uid, { populate });
    const response = (await localizedController.find(ctx)) as { data?: { mainMenu?: unknown } } | undefined;
    const mainMenu = (Array.isArray(response?.data?.mainMenu) ? response.data.mainMenu : []) as MenuSection[];
    await syncPagesByItems(strapi, collectUrlTitleFromMenu(mainMenu), locale);
    return response;
  },
}));
