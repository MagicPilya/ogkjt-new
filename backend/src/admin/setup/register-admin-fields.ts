import type { StrapiApp } from '@strapi/strapi/admin';
import type { ComponentType } from 'react';

export function registerAdminFields(app: StrapiApp): void {
  app.customFields.register({
    name: 'menu-link-select',
    type: 'string',
    intlLabel: {
      id: 'menu-link-select.label',
      defaultMessage: 'Страница',
    },
    intlDescription: {
      id: 'menu-link-select.description',
      defaultMessage: 'Выберите пункт из главного меню (раздел или подраздел). От этого зависят адрес и заголовок страницы.',
    },
    components: {
      Input: async () =>
        import('../components/MenuLinkSelectInput').then((mod) => ({ default: mod.default as unknown as ComponentType })),
    },
  });
}
