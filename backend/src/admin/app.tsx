import './custom.css';
import { bootstrapAdmin } from './bootstrap-admin';
import { registerAdminFields } from './register-admin-fields';
import { ruTranslations } from './translations';

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