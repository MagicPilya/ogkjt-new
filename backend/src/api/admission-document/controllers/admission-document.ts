/**
 * admission-document controller
 * Single type с i18n: find и update передают locale в Document Service.
 * Список документов для страницы «Документы приёмной комиссии» с файлами.
 */

import { factories } from '@strapi/strapi';
import { createLocalizedSingleTypeController } from '../../../utils/createLocalizedSingleTypeController';

const uid = 'api::admission-document.admission-document' as any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi populate types
const populate = { fullTimeItems: true, partTimeItems: true } as any;

export default factories.createCoreController(uid, ({ strapi }) => ({
  ...createLocalizedSingleTypeController(strapi, uid, {
    populate,
    replicateToOtherLocales: true,
    replicateMode: 'missingOnly',
    replicateArrayMergeKeys: ['name', 'title', 'label', 'url', 'slug', 'id'],
  }),
}));
