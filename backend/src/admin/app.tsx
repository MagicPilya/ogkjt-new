import type { StrapiApp } from '@strapi/strapi/admin';
import type { ComponentType } from 'react';

export default {
  config: {
    locales: ['ru'],
    translations: {
      ru: {
        // Общие элементы интерфейса
        Event: 'Событие',
        News: 'Новости',
        Page: 'Страница',
        User: 'Пользователь',
        'Global Settings': 'Глобальные настройки',
        'Menu': 'Меню',
        'search.placeholder': 'Поиск',

        // Таблицы списка контента
        'content-manager.containers.list.table-headers.status': 'Статус',

        // Контент-тип Event
        'content-manager.content-types.api::event.event.id': 'ID',
        'content-manager.content-types.api::event.event.title': 'Заголовок',
        'content-manager.content-types.api::event.event.date': 'Дата',
        'content-manager.content-types.api::event.event.location': 'Место проведения',

        // Контент-тип Article (News)
        'content-manager.content-types.api::article.article.id': 'ID',
        'content-manager.content-types.api::article.article.title': 'Заголовок',
        'content-manager.content-types.api::article.article.date': 'Дата',
        'content-manager.content-types.api::article.article.location': 'Место',
        'content-manager.content-types.api::article.article.slug': 'Ссылка (slug)',
        'content-manager.content-types.api::article.article.announcement': 'Анонс',

        'content-manager.content-types.api::page.page.pageUrl': 'Страница',
        'content-manager.content-types.api::page.page.title': 'Заголовок',
        'content-manager.content-types.api::page.page.metaDescription': 'Описание для поисковиков',
        'content-manager.content-types.api::page.page.content': 'Контент',
        'content-manager.content-types.api::page.page.articleFeedSection': 'Блок «Новости» под контентом',
      },
    },
  },
  register(app: StrapiApp) {
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
          import('./components/MenuLinkSelectInput').then((mod) => ({ default: mod.default as ComponentType })),
      },
    });
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};

