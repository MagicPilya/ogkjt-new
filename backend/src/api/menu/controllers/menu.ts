/**
 * menu controller
 * Single type с i18n: find и update обязательно передают locale в Document Service.
 * Иначе при сохранении в одной локали меняются все.
 */

import { factories } from '@strapi/strapi';
import { createLocalizedSingleTypeController } from '../../../utils/createLocalizedSingleTypeController';

const uid = 'api::menu.menu';

const populate = {
  mainMenu: {
    populate: {
      links: { populate: ['sublinks'] },
    },
  },
  footerResources: true,
};

export default factories.createCoreController(uid, ({ strapi }) => ({
  ...createLocalizedSingleTypeController(strapi, uid, {
    populate,
    replicateToOtherLocales: true,
    replicateMode: 'missingOnly',
    replicateArrayMergeKeys: ['url'],
  }),
}));
