import './custom.css';
import { ruTranslations } from './i18n/translations';
import { bootstrapAdmin } from './setup/bootstrap-admin';
import { registerAdminFields } from './setup/register-admin-fields';

export default {
  config: {
    locales: ['ru'],
    translations: {
      ru: ruTranslations,
    },
  },
  register: registerAdminFields,
  bootstrap: bootstrapAdmin,
};