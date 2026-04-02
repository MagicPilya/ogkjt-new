/**
 * global controller
 * Single type с i18n: find и update обязательно передают locale в Document Service.
 * Иначе при сохранении в админке в одной локали меняются все (дефолтный контроллер не пробрасывает locale при update).
 */

import { factories } from '@strapi/strapi';
import { createLocalizedSingleTypeController } from '../../../utils/createLocalizedSingleTypeController';

const uid = 'api::global.global';
const populate = {
  resources: true,
};

export default factories.createCoreController(uid, ({ strapi }) => ({
  ...createLocalizedSingleTypeController(strapi, uid, { populate }),
}));
