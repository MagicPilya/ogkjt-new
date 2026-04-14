/**
 * administration controller
 * Single type с i18n: find и update обязательно передают locale в Document Service.
 * Кастомный find: подтягиваем фото в members (REST populate даёт 500).
 */

import { factories } from '@strapi/strapi';
import { createLocalizedSingleTypeController } from '../../../utils/createLocalizedSingleTypeController';

const uid = 'api::administration.administration';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi populate types are strict, structure is valid at runtime
const populate = { members: { populate: ['photo'] } } as any;

export default factories.createCoreController(uid, ({ strapi }) => ({
  ...createLocalizedSingleTypeController(strapi, uid, {
    populate,
    replicateToOtherLocales: true,
    replicateMode: 'missingOnly',
  }),
}));
