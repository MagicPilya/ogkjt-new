/**
 * annual-symbol controller
 * Single type с i18n: find и update передают locale в Document Service.
 */

import { factories } from '@strapi/strapi';
import { createLocalizedSingleTypeController } from '../../../utils/createLocalizedSingleTypeController';

// Новый content type может отсутствовать в сгенерированных TS-типах до их регенерации.
// Каст оставляет сборку рабочей, даже если types/generated/contentTypes.d.ts ещё не обновлён.
const uid = 'api::annual-symbol.annual-symbol' as any;
const populate = ['logo'];

export default factories.createCoreController(uid, ({ strapi }) => ({
  ...createLocalizedSingleTypeController(strapi, uid, { populate }),
}));
