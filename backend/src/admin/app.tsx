import type { StrapiApp } from '@strapi/strapi/admin';
import type { ComponentType } from 'react';
import './custom.css';

export default {
  config: {
    locales: ['ru'],
    translations: {
      ru: {
        // Ключ для displayName контент-типа (виджеты на главной и др.)
        'Страница': 'Страница',
        'menu-link-select.label': 'Страница',
        'menu-link-select.description': 'Выберите пункт из главного меню (раздел или подраздел). От этого зависят адрес и заголовок страницы.',

        // Общие элементы интерфейса
        Event: 'Событие',
        News: 'Новости',
        Page: 'Страница',
        User: 'Пользователь',
        'Global Settings': 'Глобальные настройки',
        'Menu': 'Меню',
        'search.placeholder': 'Поиск',
        'content-type-builder.search.placeholder': 'Поиск',
        'global.more.actions': 'Дополнительные действия',
        'global.plugins.strapi-cloud': 'Strapi Cloud',
        'global.plugins.strapi-cloud.description': 'Инструкции по развертыванию локального проекта в Strapi Cloud',
        'components.placeholder.select': 'Выберите',
        'components.Select.placeholder': 'Выберите',
        app: 'Сохранено',
        'list.asset.at.finished': 'Загрузка ресурсов завершена',
        'app.utils.drag': 'Перетаскивание',

        // Strapi AI Chat (fallback-строки для ru)
        'chat.tooltips.open-chat': 'Открыть чат',
        'chat.tooltips.close-chat': 'Закрыть чат',
        'chat.tooltips.create-chat': 'Новый диалог',
        'chat.header.default-title': 'Новый диалог',
        'chat.input.strapi-ai-can-make-errors': 'Strapi AI может ошибаться.',

        // Настройки приложения и плагины
        'Settings.application.header': 'Приложение',
        'review-workflows.plugin.name': 'Рабочие процессы ревью',

        // Страница покупки Content Releases
        'pages.PurchaseRelease.description': 'Группируйте контент и публикуйте обновления вместе',
        'pages.PurchaseRelease.perks1': 'Добавляйте множество записей в релизы',
        'pages.PurchaseRelease.perks2': 'Быстро находите записи с ошибками',
        'pages.PurchaseRelease.perks3': 'Планируйте публикацию или публикуйте вручную',

        // i18n / локализации в списке
        'i18n.list-view.table.header.label': 'Доступно в',

        // Названия контент-типов (displayName) для меню и виджетов
        'api::page.page': 'Страница',
        'api::event.event': 'Событие',
        'api::article.article': 'Новости',
        'plugin::users-permissions.user': 'Пользователь',
        'api::administration.administration': 'Администрация',
        'api::admission-document.admission-document': 'Документы приёмной комиссии',
        'api::annual-symbol.annual-symbol': 'Ежегодные символы',
        'api::menu.menu': 'Меню',
        'api::specialty.specialty': 'Специальности',
        'api::global.global': 'Глобальные настройки',
        'Администрация': 'Администрация',
        'Документы приёмной комиссии': 'Документы приёмной комиссии',
        'Ежегодные символы': 'Ежегодные символы',
        'Меню': 'Меню',
        'Специальности': 'Специальности',
        'elements': 'Компоненты',
        'elements.document-item': 'Документ для приёмной комиссии',
        'elements.document-name-item': 'Название документа',
        'elements.worker-profession': 'Профессия рабочего',
        'elements.administration-member': 'Сотрудник администрации',
        'elements.specialization-item': 'Специализация',
        'elements.specialty-item': 'Специальность',
        'elements.footer-resource': 'Ресурс в подвале',
        'elements.menu-link': 'Ссылка меню',
        'elements.menu-section': 'Раздел меню',
        'elements.menu-sublink': 'Подссылка меню',

        // Таблицы списка контента
        'content-manager.containers.list.table-headers.status': 'Статус',

        // Контент-тип Event
        'content-manager.content-types.api::event.event.id': 'ID',
        'content-manager.content-types.api::event.event.title': 'Заголовок',
        'content-manager.content-types.api::event.event.date': 'Дата',
        'content-manager.content-types.api::event.event.location': 'Место проведения',
        'content-manager.content-types.api::event.event.slug': 'Ссылка (slug)',
        'content-manager.content-types.api::event.event.announcement': 'Анонс',
        'content-manager.content-types.api::event.event.username': 'Имя пользователя',
        'content-manager.content-types.api::event.event.email': 'Email',
        'content-manager.content-types.api::event.event.confirmed': 'Подтверждён',
        'content-manager.content-types.api::event.event.pageUrl': 'Страница',
        'content-manager.content-types.api::event.event.createdAt': 'Создано',
        'content-manager.content-types.api::event.event.files': 'Вложения',

        // Контент-тип Article (News)
        'content-manager.content-types.api::article.article.id': 'ID',
        'content-manager.content-types.api::article.article.title': 'Заголовок',
        'content-manager.content-types.api::article.article.date': 'Дата',
        'content-manager.content-types.api::article.article.location': 'Место',
        'content-manager.content-types.api::article.article.slug': 'Ссылка (slug)',
        'content-manager.content-types.api::article.article.announcement': 'Анонс',
        'content-manager.content-types.api::article.article.pageUrl': 'Страница',
        'content-manager.content-types.api::article.article.createdAt': 'Создано',
        'content-manager.content-types.api::article.article.files': 'Вложения',
        'content-manager.content-types.api::article.article.username': 'Имя пользователя',
        'content-manager.content-types.api::article.article.email': 'Email',
        'content-manager.content-types.api::article.article.confirmed': 'Подтверждён',

        'content-manager.content-types.api::page.page.id': 'ID',
        'content-manager.content-types.api::page.page.pageUrl': 'Страница',
        'content-manager.content-types.api::page.page.title': 'Заголовок',
        'content-manager.content-types.api::page.page.slug': 'Ссылка (slug)',
        'content-manager.content-types.api::page.page.metaDescription': 'Описание для поисковиков',
        'content-manager.content-types.api::page.page.content': 'Контент',
        'content-manager.content-types.api::page.page.announcement': 'Анонс',
        'content-manager.content-types.api::page.page.username': 'Имя пользователя',
        'content-manager.content-types.api::page.page.email': 'Email',
        'content-manager.content-types.api::page.page.confirmed': 'Подтверждён',
        'content-manager.content-types.api::page.page.date': 'Дата',
        'content-manager.content-types.api::page.page.location': 'Место',
        'content-manager.content-types.api::page.page.createdAt': 'Создано',
        'content-manager.content-types.api::page.page.files': 'Вложения',
        'content-manager.content-types.api::page.page.articleFeedSection': 'Блок «Новости» под контентом',

        // Контент-тип Administration (Администрация)
        'content-manager.content-types.api::administration.administration.members': 'Члены администрации',
        'content-manager.components.elements.administration-member.fullName': 'ФИО',
        'content-manager.components.elements.administration-member.position': 'Должность',
        'content-manager.components.elements.administration-member.contacts': 'Контакты',
        'content-manager.components.elements.administration-member.photo': 'Фото',

        // Контент-тип Admission Document (Документы приёмной комиссии)
        'content-manager.content-types.api::admission-document.admission-document.fullTimeBase': 'Доп. информация (очная форма)',
        'content-manager.content-types.api::admission-document.admission-document.fullTimeItems': 'Документы (очная форма)',
        'content-manager.content-types.api::admission-document.admission-document.partTimeBase': 'Доп. информация (заочная форма)',
        'content-manager.content-types.api::admission-document.admission-document.partTimeItems': 'Документы (заочная форма)',

        // Контент-тип Annual Symbol (Ежегодные символы)
        'content-manager.content-types.api::annual-symbol.annual-symbol.title': 'Название тематического года',
        'content-manager.content-types.api::annual-symbol.annual-symbol.description': 'Описание тематического года',
        'content-manager.content-types.api::annual-symbol.annual-symbol.pageUrl': 'Ссылка на страницу',
        'content-manager.content-types.api::annual-symbol.annual-symbol.logo': 'Логотип тематического года',

        // Контент-тип Menu (Меню)
        'content-manager.content-types.api::menu.menu.mainMenu': 'Главное меню',
        'content-manager.components.elements.menu-section.title': 'Заголовок раздела',
        'content-manager.components.elements.menu-section.url': 'Ссылка',
        'content-manager.components.elements.menu-section.links': 'Ссылки',

        // Контент-тип Specialty (Специальности)
        'content-manager.content-types.api::specialty.specialty.items': 'Список специальностей',
        'content-manager.components.elements.specialty-item.name': 'Название',
        'content-manager.components.elements.specialty-item.code': 'Код',
        'content-manager.components.elements.specialty-item.specializations': 'Специализации',
        'content-manager.components.elements.specialty-item.qualification': 'Квалификация',
        'content-manager.components.elements.specialty-item.workerProfessions': 'Профессии',

        // Контент-тип Global Settings (Глобальные настройки)
        'content-manager.content-types.api::global.global.collegeFullName': 'Полное название колледжа',
        'content-manager.content-types.api::global.global.collegeShortName': 'Краткое название колледжа',
        'content-manager.content-types.api::global.global.collegeMainName': 'Основное название колледжа',
        'content-manager.content-types.api::global.global.collegeBranchShortName': 'Краткое название филиала',
        'content-manager.content-types.api::global.global.heroBranchWord': 'Слово «филиал» для главной',
        'content-manager.content-types.api::global.global.universityName': 'Название университета',
        'content-manager.content-types.api::global.global.address': 'Адрес',
        'content-manager.content-types.api::global.global.phoneReception': 'Телефон приёмной',
        'content-manager.content-types.api::global.global.phoneDirector': 'Телефон директора',
        'content-manager.content-types.api::global.global.email': 'Email',
        'content-manager.content-types.api::global.global.instagramLink': 'Ссылка на Instagram',
        'content-manager.content-types.api::global.global.telegramLink': 'Ссылка на Telegram',
        'content-manager.content-types.api::global.global.tiktokLink': 'Ссылка на TikTok',
        'content-manager.content-types.api::global.global.vkLink': 'Ссылка на VK',
        'content-manager.content-types.api::global.global.resources': 'Полезные ресурсы в подвале',
        'content-manager.components.elements.footer-resource.title': 'Название ресурса',
        'content-manager.components.elements.footer-resource.url': 'Ссылка',

        // Плагин Users & Permissions — пользователи (User)
        'content-manager.content-types.plugin::users-permissions.user.id': 'ID',
        'content-manager.content-types.plugin::users-permissions.user.username': 'Имя пользователя',
        'content-manager.content-types.plugin::users-permissions.user.email': 'Email',
        'content-manager.content-types.plugin::users-permissions.user.confirmed': 'Подтверждён',
        'content-manager.content-types.plugin::users-permissions.user.title': 'Заголовок',
        'content-manager.content-types.plugin::users-permissions.user.slug': 'Ссылка (slug)',
        'content-manager.content-types.plugin::users-permissions.user.announcement': 'Анонс',
        'content-manager.content-types.plugin::users-permissions.user.pageUrl': 'Страница',
        'content-manager.content-types.plugin::users-permissions.user.createdAt': 'Создано',
        'content-manager.content-types.plugin::users-permissions.user.files': 'Вложения',
        'content-manager.content-types.plugin::users-permissions.user.date': 'Дата',
        'content-manager.content-types.plugin::users-permissions.user.location': 'Место',

        // Медиа-библиотека / загрузка файлов
        'upload.header.breadcrumbs.nav.label': 'Навигация по папкам',
        'upload.header.actions.folder-level-up': 'Назад',
        'list-assets-select': 'Выберите ресурс {name}',
        'list.table.header.sort': 'Сортировать по {label}',
        'list.folder.select': 'Выберите папку {name}',
        'list.table.content.empty-label': 'Это поле пустое',
        'cancel': 'Отмена',
        'upload.form.input.label.folder-location-default-label': 'Медиабиблиотека',
        'upload.form.input.label.file-location': 'Расположение',
        'app.utils.toggle': 'Переключить',
        'upload.modal.folder.create.title': 'Добавить новую папку',
        'upload.form.input.label.folder-name': 'Название',
        'upload.form.input.label.folder-location': 'Расположение',
        'upload.modal.folder.create.submit': 'Создать',
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
          import('./components/MenuLinkSelectInput').then((mod) => ({ default: mod.default as unknown as ComponentType })),
      },
    });
  },
  bootstrap() {
    const oldUploadLabel = 'Перетащите сюда или';
    const newUploadLabel = 'Перетащите файлы сюда или выберите на компьютере';

    const updateUploadDropzoneText = () => {
      const fileInputs = document.querySelectorAll<HTMLInputElement>(`input[type="file"][aria-label="${oldUploadLabel}"]`);
      fileInputs.forEach((input) => input.setAttribute('aria-label', newUploadLabel));

      const spans = document.querySelectorAll<HTMLSpanElement>('span');
      spans.forEach((span) => {
        if (span.textContent?.trim() === oldUploadLabel) {
          span.textContent = newUploadLabel;
        }
      });
    };

    const lockPageTitleInput = () => {
      const onPageEditScreen = window.location.pathname.includes('/content-manager/collection-types/api::page.page');
      if (!onPageEditScreen) return;

      const titleInput = document.querySelector<HTMLInputElement>('input[name="title"]');
      if (!titleInput) return;

      if (!titleInput.disabled) {
        titleInput.disabled = true;
      }
      titleInput.setAttribute('title', 'Поле заполняется автоматически из пункта меню');
      titleInput.setAttribute('aria-disabled', 'true');
      titleInput.style.cursor = 'not-allowed';
      titleInput.style.opacity = '0.8';
    };

    updateUploadDropzoneText();
    lockPageTitleInput();

    // Модалка upload рендерится динамически — подхватываем новые узлы.
    const observer = new MutationObserver(() => {
      updateUploadDropzoneText();
      lockPageTitleInput();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
};

