/**
 * specialty controller
 * Single type с i18n: find и update обязательно передают locale в Document Service.
 * Иначе при сохранении в одной локали меняются все.
 */

import { factories } from '@strapi/strapi';
import { createLocalizedSingleTypeController } from '../../../utils/createLocalizedSingleTypeController';

const uid = 'api::specialty.specialty';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi populate types are strict, structure is valid at runtime
const populate = { items: { populate: ['specializations', 'workerProfessions'] } } as any;

export default factories.createCoreController(uid, ({ strapi }) => ({
  ...createLocalizedSingleTypeController(strapi, uid, {
    populate,
    replicateToOtherLocales: true,
    replicateMode: 'missingOnly',
  }),
}));
