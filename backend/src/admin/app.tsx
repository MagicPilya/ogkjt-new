import type { StrapiApp } from '@strapi/strapi/admin';

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
      },
    },
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};

