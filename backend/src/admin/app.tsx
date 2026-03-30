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
        'actions.delete.label': 'Удалить запись{isLocalized, select, true { (все локали)} other {}}',
        'actions.delete.error': 'Ошибка при удалении документа.',
        'actions.delete.dialog.body': 'Вы уверены, что хотите удалить этот документ? Это действие необратимо.',
        'content-manager.actions.delete.label': 'Удалить запись{isLocalized, select, true { (все локали)} other {}}',
        'content-manager.actions.delete.error': 'Ошибка при удалении документа.',
        'content-manager.actions.delete.dialog.body': 'Вы уверены, что хотите удалить этот документ? Это действие необратимо.',
        'actions.discard.label': 'Отменить изменения',
        'content-manager.actions.discard.label': 'Отменить изменения',
        'i18n.actions.delete.label': 'Удалить запись ({locale})',
        'i18n.actions.delete.error': 'Ошибка при удалении локали документа.',
        'i18n.actions.delete.dialog.title': 'Подтверждение',
        'i18n.actions.delete.dialog.body': 'Вы уверены, что хотите удалить локаль {locale}?',
        'i18n.CMEditViewCopyLocale.copy-text': 'Заполнить из другой локали',
        'i18n.CMEditViewCopyLocale.cancel-text': 'Нет, отмена',
        'i18n.CMEditViewCopyLocale.submit-text': 'Да, заполнить',
        'i18n.CMEditViewCopyLocale.dialog.title': 'Подтверждение',
        'i18n.CMEditViewCopyLocale.dialog.body': 'Текущее содержимое будет очищено и заполнено содержимым выбранной локали:',
        'i18n.CMEditViewCopyLocale.dialog.field.label': 'Локаль',
        'i18n.CMEditViewCopyLocale.dialog.field.placeholder': 'Выберите локаль...',
        'i18n.CMEditViewLocalePicker.locale.create': 'Создать локаль <bold>{locale}</bold>',
        'i18n.CMEditViewBulkLocale.publish-title': 'Опубликовать несколько локалей',
        'i18n.CMEditViewBulkLocale.unpublish-title': 'Снять с публикации несколько локалей',
        'content-manager.containers.edit.panels.default.title': 'Запись',
        'content-manager.containers.edit.information.last-published.label': 'Опубликовано',
        'content-manager.containers.edit.information.last-draft.label': 'Обновлено',
        'content-manager.containers.edit.information.document.label': 'Создано',
        'content-manager.containers.edit.tabs.draft': 'Черновик',
        'content-manager.containers.edit.tabs.published': 'Опубликовано',
        'content-manager.preview.panel.title': 'Предпросмотр',
        'content-manager.preview.panel.button-configuration': 'Настроить предпросмотр',
        'components.Blocks.modifiers.bold': 'Жирный',
        'components.Blocks.modifiers.italic': 'Курсив',
        'components.Blocks.modifiers.underline': 'Подчеркнутый',
        'components.Blocks.modifiers.strikethrough': 'Зачеркнутый',
        'components.Blocks.modifiers.code': 'Встроенный код',
        'components.Blocks.link': 'Ссылка',
        'components.Blocks.blocks.text': 'Текст',
        'components.Blocks.blocks.heading1': 'Заголовок 1',
        'components.Blocks.blocks.heading2': 'Заголовок 2',
        'components.Blocks.blocks.heading3': 'Заголовок 3',
        'components.Blocks.blocks.heading4': 'Заголовок 4',
        'components.Blocks.blocks.heading5': 'Заголовок 5',
        'components.Blocks.blocks.heading6': 'Заголовок 6',
        'components.Blocks.blocks.code': 'Блок кода',
        'components.Blocks.blocks.bulletList': 'Маркированный список',
        'components.Blocks.blocks.numberList': 'Нумерованный список',
        'components.Blocks.blocks.unorderedList': 'Маркированный список',
        'components.Blocks.blocks.orderedList': 'Нумерованный список',
        'components.Wysiwyg.blocks.code': 'Код',
        'components.Blocks.blocks.image': 'Изображение',
        'components.Blocks.popover.link': 'Ссылка',
        'components.Blocks.popover.link.text': 'Текст',
        'components.Blocks.popover.link.url': 'Ссылка',
        'components.Blocks.popover.link.rel': 'Rel (необязательно)',
        'components.Blocks.popover.link.target': 'Target (необязательно)',
        'components.Blocks.popover.link.url.placeholder': 'Вставьте ссылку',
        'components.Blocks.popover.link.text.placeholder': 'Введите текст ссылки',
        'components.Blocks.popover.link.rel.placeholder': 'noopener, nofollow, noreferrer',
        'components.Blocks.popover.link.target.placeholder': '_blank, _self, _parent, _top',
        'components.Blocks.blocks.quote': 'Цитата',
        'components.Wysiwyg.selectOptions.title': 'Текст',
        'components.Wysiwyg.selectOptions.H1': 'Заголовок 1',
        'components.Wysiwyg.selectOptions.H2': 'Заголовок 2',
        'components.Wysiwyg.selectOptions.H3': 'Заголовок 3',
        'components.Wysiwyg.selectOptions.H4': 'Заголовок 4',
        'components.Wysiwyg.selectOptions.H5': 'Заголовок 5',
        'components.Wysiwyg.selectOptions.H6': 'Заголовок 6',
        'components.Wysiwyg.ToggleMode.markdown-mode': 'Режим Markdown',
        'components.Wysiwyg.ToggleMode.preview-mode': 'Режим предпросмотра',

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

    const normalizePageEditLayout = () => {
      const onPageEditScreen = window.location.pathname.includes('/content-manager/collection-types/api::page.page');
      if (!onPageEditScreen) return;

      const findFieldContainer = (fieldName: string, fallbackLabel?: string): HTMLElement | null => {
        const byDataAttr = document.querySelector<HTMLElement>(
          `[data-strapi-field-name="${fieldName}"], [data-field-name="${fieldName}"]`
        );
        if (byDataAttr) return byDataAttr;

        const byName = document.querySelector<HTMLElement>(`[name="${fieldName}"]`);
        if (byName) {
          let current: HTMLElement | null = byName;
          for (let i = 0; i < 8 && current?.parentElement; i += 1) {
            current = current.parentElement;
            if (!current) break;
            const hasField = current.querySelector(`[name="${fieldName}"]`);
            const hasLabel = current.querySelector('label');
            if (hasField && hasLabel) return current;
          }
        }

        if (fallbackLabel) {
          const textNodes = document.querySelectorAll<HTMLElement>('label, span, div, p');
          for (const node of Array.from(textNodes)) {
            if (node.textContent?.trim() !== fallbackLabel) continue;
            const wrapper =
              node.closest<HTMLElement>('[data-strapi-field-name], [data-field-name]') ||
              node.closest<HTMLElement>('div');
            if (wrapper) return wrapper;
          }
        }

        return null;
      };

      const hideField = (fieldName: string, label: string) => {
        const fieldContainer = findFieldContainer(fieldName, label);
        if (fieldContainer) fieldContainer.style.display = 'none';

        // Иногда в правой колонке остается отдельный текстовый узел лейбла.
        const textNodes = document.querySelectorAll<HTMLElement>('label, span, div, p');
        textNodes.forEach((node) => {
          if (node.textContent?.trim() !== label) return;
          const wrapper = node.closest<HTMLElement>('[data-strapi-field-name], [data-field-name], div');
          if (wrapper) {
            wrapper.style.display = 'none';
          } else {
            node.style.display = 'none';
          }
        });
      };

      hideField('pageUrl', 'Страница');
      hideField('articleFeedSection', 'Блок «Новости» под контентом');

      const titleContainer = findFieldContainer('title', 'Заголовок');
      const contentContainer = findFieldContainer('content', 'Контент');
      if (!titleContainer || !contentContainer) return;

      titleContainer.style.gridColumn = '1 / -1';
      titleContainer.style.width = '100%';
      titleContainer.style.order = '1';
      contentContainer.style.order = '2';

      if (titleContainer.parentElement === contentContainer.parentElement) {
        contentContainer.parentElement?.insertBefore(titleContainer, contentContainer);
      }
    };

    const lockPageDeleteButtons = () => {
      const onPageScreen = window.location.pathname.includes('/content-manager/collection-types/api::page.page');
      if (!onPageScreen) return;

      const deleteTexts = ['delete', 'удалить', 'delete all entries', 'удалить все записи', 'all locales', 'все локали'];
      const buttons = document.querySelectorAll<HTMLButtonElement>('button');
      buttons.forEach((button) => {
        const text = `${button.textContent ?? ''} ${button.getAttribute('aria-label') ?? ''}`.toLowerCase();
        if (!deleteTexts.some((token) => text.includes(token))) return;
        button.disabled = true;
        button.setAttribute('aria-disabled', 'true');
        button.setAttribute('title', 'Удаление страниц отключено: страницы управляются через меню');
        button.style.display = 'none';
      });
    };

    const localizeI18nLocalePickerTexts = () => {
      const onPageEditScreen = window.location.pathname.includes('/content-manager/collection-types/api::page.page');
      if (!onPageEditScreen) return;

      const elements = document.querySelectorAll<HTMLElement>('span, div, p');
      elements.forEach((el) => {
        const text = el.textContent?.trim();
        if (!text) return;
        if (text === 'Entry') {
          el.textContent = 'Запись';
          return;
        }
        if (text === 'Preview') {
          el.textContent = 'Предпросмотр';
          return;
        }
        if (text === 'Set up preview') {
          el.textContent = 'Настроить предпросмотр';
          return;
        }
        if (text === 'Published') {
          el.textContent = 'Опубликовано';
          return;
        }
        const createLocaleMatch = text.match(/^Create\\s+(.+)\\s+locale$/i);
        if (createLocaleMatch) {
          el.textContent = `Создать локаль ${createLocaleMatch[1]}`;
        }
      });
    };

    const localizeBlocksLinkPopoverTexts = () => {
      const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
      dialogs.forEach((dialog) => {
        const hasLinkField =
          dialog.querySelector('input[placeholder="Paste link"]') ||
          dialog.querySelector('input[placeholder="Вставьте ссылку"]');
        if (!hasLinkField) return;

        const textNodes = dialog.querySelectorAll<HTMLElement>('label, span, p');
        textNodes.forEach((node) => {
          const text = node.textContent?.trim();
          if (!text) return;

          if (text === 'Text') {
            node.textContent = 'Текст';
            return;
          }
          if (text === 'Rel (optional)') {
            node.textContent = 'Rel (необязательно)';
            return;
          }
          if (text === 'Target (optional)') {
            node.textContent = 'Target (необязательно)';
          }
        });

        const inputs = dialog.querySelectorAll<HTMLInputElement>('input[placeholder]');
        inputs.forEach((input) => {
          const placeholder = input.getAttribute('placeholder')?.trim();
          if (!placeholder) return;
          if (placeholder === 'Paste link') {
            input.setAttribute('placeholder', 'Вставьте ссылку');
            return;
          }
          if (placeholder === 'Enter link text') {
            input.setAttribute('placeholder', 'Введите текст ссылки');
          }
        });
      });
    };

    const IMAGE_OPTIMIZER_BUTTON_ID = 'ogkjt-image-optimizer-run-button';
    const getAdminJwtToken = () => {
      const localStorageCandidates = ['jwtToken', 'strapi-admin-jwt', 'token'];
      for (const key of localStorageCandidates) {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        const trimmed = raw.trim();

        if (!trimmed) continue;
        if (trimmed.startsWith('{')) {
          try {
            const parsed = JSON.parse(trimmed) as { jwt?: string; token?: string };
            if (typeof parsed.jwt === 'string' && parsed.jwt) return parsed.jwt;
            if (typeof parsed.token === 'string' && parsed.token) return parsed.token;
          } catch {
            // ignore invalid JSON and keep fallback checks.
          }
        }

        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (typeof parsed === 'string' && parsed) return parsed;
          } catch {
            // ignore parse error and fallback to raw value.
          }
        }

        return trimmed;
      }

      return null;
    };

    const ensureImageOptimizerButton = () => {
      const onUploadPluginPage = window.location.pathname.includes('/plugins/upload');
      const existingButton = document.getElementById(IMAGE_OPTIMIZER_BUTTON_ID) as HTMLButtonElement | null;
      if (!onUploadPluginPage) {
        if (existingButton) existingButton.remove();
        return;
      }

      if (existingButton) return;

      const button = document.createElement('button');
      button.id = IMAGE_OPTIMIZER_BUTTON_ID;
      button.type = 'button';
      button.textContent = 'Оптимизировать изображения';
      button.style.position = 'fixed';
      button.style.right = '16px';
      button.style.bottom = '16px';
      button.style.zIndex = '9998';
      button.style.padding = '10px 14px';
      button.style.border = '1px solid rgba(122, 131, 199, 0.55)';
      button.style.borderRadius = '8px';
      button.style.background = 'linear-gradient(180deg, #3f58b4 0%, #2f468f 100%)';
      button.style.color = '#f8f9ff';
      button.style.fontSize = '13px';
      button.style.fontWeight = '600';
      button.style.cursor = 'pointer';
      button.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
      button.style.transition = 'opacity .15s ease, transform .15s ease';

      button.onmouseenter = () => {
        if (button.disabled) return;
        button.style.transform = 'translateY(-1px)';
      };
      button.onmouseleave = () => {
        button.style.transform = 'translateY(0)';
      };

      button.onclick = async () => {
        if (button.disabled) return;
        const shouldRun = window.confirm(
          'Запустить оптимизацию уже загруженных изображений? Это может занять некоторое время.'
        );
        if (!shouldRun) return;

        const previousText = button.textContent;
        button.disabled = true;
        button.textContent = 'Оптимизация...';
        button.style.opacity = '0.75';
        button.style.cursor = 'wait';

        try {
          const token = getAdminJwtToken();
          const response = await window.fetch('/content-manager/image-optimizer/run', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({}),
          });
          const responseText = await response.text();
          let payload: {
            data?: {
              scanned?: number;
              optimized?: number;
              skipped?: number;
              failed?: number;
              totalSavedBytes?: number;
              errors?: Array<{ id?: number; message?: string }>;
            };
            error?: { message?: string };
          } = {};
          try {
            payload = responseText ? (JSON.parse(responseText) as typeof payload) : {};
          } catch {
            payload = {
              error: { message: responseText || `HTTP ${response.status}` },
            };
          }

          if (!response.ok) {
            const errorMessage = payload?.error?.message ?? `HTTP ${response.status}`;
            throw new Error(errorMessage);
          }

          const stats = payload.data ?? {};
          const savedMb = Number(((stats.totalSavedBytes ?? 0) / (1024 * 1024)).toFixed(2));
          const errorLines = (stats.errors ?? [])
            .map((errorItem) => `#${errorItem.id ?? '?'}: ${errorItem.message ?? 'Неизвестная ошибка'}`)
            .join('\n');
          const errorBlock = errorLines ? `\n\nОшибки:\n${errorLines}` : '';
          window.alert(
            `Оптимизация завершена.\n` +
              `Проверено: ${stats.scanned ?? 0}\n` +
              `Оптимизировано: ${stats.optimized ?? 0}\n` +
              `Пропущено: ${stats.skipped ?? 0}\n` +
              `С ошибками: ${stats.failed ?? 0}\n` +
              `Сэкономлено: ${savedMb} MB` +
              errorBlock
          );
        } catch (error) {
          window.alert(
            `Не удалось запустить оптимизацию изображений: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        } finally {
          button.disabled = false;
          button.textContent = previousText ?? 'Оптимизировать изображения';
          button.style.opacity = '1';
          button.style.cursor = 'pointer';
          button.style.transform = 'translateY(0)';
        }
      };

      document.body.appendChild(button);
    };

    type BlocksAction =
      | 'bold'
      | 'italic'
      | 'underline'
      | 'strikethrough'
      | 'inline-code'
      | 'link'
      | 'bulleted-list'
      | 'numbered-list'
      | 'quote'
      | 'image';
    const blocksActionLabels: Record<BlocksAction, string[]> = {
      bold: ['bold', 'жирный'],
      italic: ['italic', 'курсив'],
      underline: ['underline', 'подчеркнутый', 'подчёркнутый'],
      strikethrough: ['strikethrough', 'зачеркнутый', 'зачёркнутый'],
      'inline-code': ['inline code', 'встроенный код'],
      link: ['link', 'ссылка'],
      'bulleted-list': ['bulleted list', 'маркированный список', 'bullet list'],
      'numbered-list': ['numbered list', 'нумерованный список'],
      quote: ['quote', 'цитата', 'blockquote', 'цитирование', 'block quote'],
      image: ['image', 'изображение', 'картинка', 'media', 'медиа', 'insert image', 'insert media', 'media library'],
    };
    const toggleActions = new Set<BlocksAction>([
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'inline-code',
      'link',
      'bulleted-list',
      'numbered-list',
      'quote',
    ]);

    const getActiveBlocksEditor = (): HTMLElement | null => {
      const selection = window.getSelection();
      const fromSelection = selection?.anchorNode instanceof Element ? selection.anchorNode : selection?.anchorNode?.parentElement;
      const selectionRoot = fromSelection?.closest?.('[data-slate-editor="true"]') as HTMLElement | null;
      if (selectionRoot) return selectionRoot;

      const active = document.activeElement as HTMLElement | null;
      const activeRoot = active?.closest?.('[data-slate-editor="true"]') as HTMLElement | null;
      return activeRoot ?? null;
    };

    const isVisible = (el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.getBoundingClientRect().height > 0;
    };

    const activateToolbarButton = (button: HTMLElement) => {
      const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
      button.dispatchEvent(down);
      const up = new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window });
      button.dispatchEvent(up);
      const click = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
      button.dispatchEvent(click);
      if (typeof (button as HTMLButtonElement).click === 'function') {
        (button as HTMLButtonElement).click();
      }
    };

    const hasSelectionInsideRoot = (root: HTMLElement) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;
      const range = selection.getRangeAt(0);
      const startNode = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
      return !!startNode?.closest?.('[data-slate-editor="true"]') && root.contains(startNode);
    };

    const insertHtmlByRange = (root: HTMLElement, html: string): boolean => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;
      const range = selection.getRangeAt(0);
      if (!root.contains(range.startContainer)) return false;
      const template = document.createElement('template');
      template.innerHTML = html;
      const fragment = template.content.cloneNode(true) as DocumentFragment;
      range.deleteContents();
      range.insertNode(fragment);
      selection.removeAllRanges();
      return true;
    };

    const applyFallbackFormatting = (action: BlocksAction, root: HTMLElement): boolean => {
      const hasSelection = hasSelectionInsideRoot(root);
      if (action === 'bold') return document.execCommand('bold');
      if (action === 'italic') return document.execCommand('italic');
      if (action === 'underline') return document.execCommand('underline');
      if (action === 'strikethrough') return document.execCommand('strikeThrough');
      if (action === 'link') {
        if (!hasSelection) return false;
        const url = window.prompt('Введите URL ссылки', 'https://');
        if (!url) return false;
        return document.execCommand('createLink', false, url);
      }
      if (action === 'bulleted-list') return document.execCommand('insertUnorderedList');
      if (action === 'numbered-list') return document.execCommand('insertOrderedList');
      if (action === 'quote') {
        if (!hasSelection) {
          const withExec = document.execCommand('insertHTML', false, '<blockquote><p>Цитата</p></blockquote><p><br/></p>');
          if (withExec) return true;
          return insertHtmlByRange(root, '<blockquote><p>Цитата</p></blockquote><p><br/></p>');
        }
        const selection = window.getSelection();
        const selectedText = selection?.toString() ?? '';
        if (!selectedText) return document.execCommand('formatBlock', false, 'blockquote');
        const escaped = selectedText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const byExec = document.execCommand('insertHTML', false, `<blockquote>${escaped}</blockquote>`);
        if (byExec) return true;
        return insertHtmlByRange(root, `<blockquote>${escaped}</blockquote>`);
      }
      if (action === 'image') {
        const url = window.prompt('Введите URL изображения', 'https://');
        if (!url) return false;
        const inserted = document.execCommand('insertImage', false, url);
        if (inserted) return true;
        const withExec = document.execCommand('insertHTML', false, `<img src="${url}" alt="" />`);
        if (withExec) return true;
        return insertHtmlByRange(root, `<img src="${url}" alt="" />`);
      }
      if (action === 'inline-code') {
        if (!hasSelection) return false;
        const selection = window.getSelection();
        const selectedText = selection?.toString() ?? '';
        if (!selectedText) return false;
        const escaped = selectedText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return document.execCommand('insertHTML', false, `<code>${escaped}</code>`);
      }
      return false;
    };

    const getElementActionText = (el: HTMLElement) =>
      [
        el.textContent ?? '',
        el.getAttribute('aria-label') ?? '',
        el.getAttribute('name') ?? '',
        el.getAttribute('title') ?? '',
        el.getAttribute('data-testid') ?? '',
        el.getAttribute('data-strapi-tooltip') ?? '',
      ]
        .join(' ')
        .toLowerCase();

    const isToolbarActionElement = (el: HTMLElement) => {
      if (!isVisible(el)) return false;
      if (el.getAttribute('aria-disabled') === 'true') return false;
      if ('disabled' in el && (el as HTMLButtonElement).disabled) return false;
      return true;
    };

    const restoreSelectionInEditor = (root: HTMLElement, range?: Range | null) => {
      if (!range) return;
      const selection = window.getSelection();
      if (!selection) return;
      if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return;
      selection.removeAllRanges();
      selection.addRange(range);
    };

    const selectDrivenActions = new Set<BlocksAction>(['bulleted-list', 'numbered-list', 'quote', 'image']);
    const blockTypeTriggerLabels = ['text', 'текст', 'paragraph', 'heading', 'заголовок', 'блок кода', 'code block'];
    const blockTypeOptionLabels: Record<BlocksAction, string[]> = {
      bold: [],
      italic: [],
      underline: [],
      strikethrough: [],
      'inline-code': [],
      link: [],
      'bulleted-list': ['bulleted list', 'маркированный список', 'bullet list'],
      'numbered-list': ['numbered list', 'нумерованный список'],
      quote: ['quote', 'цитата', 'blockquote'],
      image: ['image', 'изображение', 'media', 'медиа'],
    };
    const normalizeText = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();
    const getNodeOwnText = (el: HTMLElement) => normalizeText(el.textContent ?? '');
    const optionTextByAction: Record<BlocksAction, string[]> = {
      bold: [],
      italic: [],
      underline: [],
      strikethrough: [],
      'inline-code': [],
      link: [],
      'bulleted-list': ['маркированный список', 'bulleted list', 'bullet list'],
      'numbered-list': ['нумерованный список', 'numbered list'],
      quote: ['цитата', 'quote'],
      image: ['изображение', 'image'],
    };

    const tryApplyViaBlockTypeSelect = (action: BlocksAction, root: HTMLElement): boolean => {
      if (!selectDrivenActions.has(action)) return false;
      const scope =
        (root.closest('[data-strapi-field]') as HTMLElement | null) ??
        (root.closest('[role="dialog"]') as HTMLElement | null) ??
        (root.closest('form') as HTMLElement | null) ??
        document.body;
      const buttons = Array.from(scope.querySelectorAll<HTMLElement>('button, [role="button"]')).filter((el) => isToolbarActionElement(el));
      const trigger = buttons.find((el) => {
        const hasPopup =
          el.getAttribute('aria-haspopup') === 'menu' ||
          el.getAttribute('aria-expanded') !== null ||
          el.querySelector('[data-testid*="caret"], [data-testid*="chevron"]');
        if (!hasPopup) return false;
        const text = getElementActionText(el);
        return blockTypeTriggerLabels.some((label) => text.includes(label));
      });
      if (!trigger) return false;

      const optionLabels = blockTypeOptionLabels[action];
      const targetOptionTexts = optionTextByAction[action].map((label) => normalizeText(label));
      const clickOption = (): boolean => {
        const menuContainers = Array.from(
          document.querySelectorAll<HTMLElement>('[role="menu"], [data-radix-popper-content-wrapper], [data-floating-ui-portal]'),
        ).filter((el) => isVisible(el));
        if (menuContainers.length === 0) return false;
        const optionCandidates = menuContainers.flatMap((container) =>
          Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"], [role="option"], button, [role="button"]')).filter((el) => isToolbarActionElement(el)),
        );
        const option = optionCandidates.find((el) => {
          const ownText = getNodeOwnText(el);
          if (!ownText) return false;
          if (targetOptionTexts.some((target) => ownText === target || ownText.startsWith(`${target} `))) return true;
          const mixed = normalizeText(getElementActionText(el));
          return optionLabels.some((label) => mixed.includes(normalizeText(label)));
        });
        if (!option) return false;
        activateToolbarButton(option);
        return true;
      };

      activateToolbarButton(trigger);
      if (clickOption()) return true;
      window.setTimeout(() => {
        clickOption();
      }, 0);
      window.setTimeout(() => {
        clickOption();
      }, 60);
      return true;
    };

    const triggerBlocksAction = (action: BlocksAction, preferredRoot?: HTMLElement | null, preferredRange?: Range | null): boolean => {
      const root = preferredRoot ?? getActiveBlocksEditor();
      if (!root) return false;
      restoreSelectionInEditor(root, preferredRange);
      root.focus({ preventScroll: true });
      if (tryApplyViaBlockTypeSelect(action, root)) return true;

      const scope =
        (root.closest('[data-strapi-field]') as HTMLElement | null) ??
        (root.closest('[role="dialog"]') as HTMLElement | null) ??
        (root.closest('form') as HTMLElement | null) ??
        document.body;
      const candidates = Array.from(scope.querySelectorAll<HTMLElement>('button, [role="button"]')).filter((el) => isToolbarActionElement(el));
      const labels = blocksActionLabels[action];
      for (const button of candidates) {
        const text = getElementActionText(button);
        if (!labels.some((label) => text.includes(label))) continue;
        activateToolbarButton(button);
        return true;
      }
      return applyFallbackFormatting(action, root);
    };

    const hotkeyHandler = (event: KeyboardEvent) => {
      const hasModifier = event.ctrlKey || event.metaKey;
      if (!hasModifier) return;

      const target = event.target as HTMLElement | null;
      const targetEditor = target?.closest?.('[data-slate-editor="true"]') as HTMLElement | null;
      const activeEditor = getActiveBlocksEditor();
      const editorRoot = targetEditor ?? activeEditor;

      let action: BlocksAction | null = null;
      const key = event.key.toLowerCase();
      const code = event.code;
      const allowSimple = !event.shiftKey || event.altKey;

      // Используем code, чтобы сочетания работали при любой раскладке клавиатуры.
      if ((code === 'KeyB' || key === 'b') && allowSimple) action = 'bold';
      else if ((code === 'KeyI' || key === 'i') && allowSimple) action = 'italic';
      else if ((code === 'KeyU' || key === 'u') && allowSimple) action = 'underline';
      else if ((code === 'KeyK' || key === 'k') && allowSimple) action = 'link';
      else if ((code === 'KeyE' || key === 'e') && allowSimple) action = 'inline-code';
      else if ((code === 'KeyS' || key === 's') && event.shiftKey) action = 'strikethrough';

      if (!action) return;
      if (!editorRoot) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      triggerBlocksAction(action, editorRoot);
    };

    let blocksContextMenu: HTMLDivElement | null = null;
    const contextMenuButtons = new Map<BlocksAction, HTMLButtonElement>();
    const hideBlocksContextMenu = () => {
      if (!blocksContextMenu) return;
      blocksContextMenu.style.display = 'none';
    };

    let contextEditorRoot: HTMLElement | null = null;
    let contextSelectionRange: Range | null = null;

    const getActionActiveState = (action: BlocksAction, root: HTMLElement) => {
      const scope =
        (root.closest('[data-strapi-field]') as HTMLElement | null) ??
        (root.closest('[role="dialog"]') as HTMLElement | null) ??
        (root.closest('form') as HTMLElement | null) ??
        document.body;
      const labels = blocksActionLabels[action];
      const buttons = Array.from(scope.querySelectorAll<HTMLElement>('button, [role="button"]'));

      for (const button of buttons) {
        const text = getElementActionText(button);
        if (!labels.some((label) => text.includes(label))) continue;

        const stateCarrier = (button.closest('[data-state]') as HTMLElement | null) ?? button;
        const dataState = stateCarrier.getAttribute('data-state');
        const ariaPressed = stateCarrier.getAttribute('aria-pressed') ?? button.getAttribute('aria-pressed');
        if (dataState === 'on' || ariaPressed === 'true') return true;
      }

      return false;
    };

    const refreshContextMenuState = () => {
      if (!contextEditorRoot) return;
      contextMenuButtons.forEach((button, action) => {
        const isActive = toggleActions.has(action) && getActionActiveState(action, contextEditorRoot as HTMLElement);
        button.dataset.active = isActive ? 'true' : 'false';
        button.style.background = isActive ? 'rgba(63, 88, 180, 0.35)' : 'transparent';
        button.style.color = isActive ? '#c8d7ff' : '#f3f5ff';
        button.style.boxShadow = isActive ? 'inset 0 0 0 1px rgba(132, 166, 255, 0.45)' : 'none';

        const iconEl = button.querySelector<HTMLElement>('[data-icon="true"]');
        if (iconEl) {
          iconEl.style.background = isActive ? 'rgba(126, 164, 255, 0.23)' : 'rgba(69, 75, 125, 0.35)';
          iconEl.style.borderColor = isActive ? 'rgba(153, 184, 255, 0.7)' : 'rgba(118, 126, 187, 0.42)';
          iconEl.style.color = isActive ? '#d9e6ff' : '#ffffff';
        }
      });
    };

    const createBlocksContextMenu = () => {
      if (blocksContextMenu) return blocksContextMenu;
      const menu = document.createElement('div');
      menu.style.position = 'fixed';
      menu.style.zIndex = '9999';
      menu.style.minWidth = '260px';
      menu.style.width = 'min(360px, calc(100vw - 16px))';
      menu.style.maxWidth = 'calc(100vw - 16px)';
      menu.style.maxHeight = 'calc(100vh - 16px)';
      menu.style.overflowY = 'auto';
      menu.style.overflowX = 'hidden';
      menu.style.background = 'linear-gradient(180deg, #24284d 0%, #1d2140 100%)';
      menu.style.border = '1px solid rgba(122, 131, 199, 0.4)';
      menu.style.borderRadius = '12px';
      menu.style.padding = '8px';
      menu.style.backdropFilter = 'blur(4px)';
      menu.style.boxShadow = '0 14px 40px rgba(0,0,0,0.42)';
      menu.style.display = 'none';

      const entries: Array<{ label: string; action: BlocksAction }> = [
        { label: 'Жирный (Ctrl+B / Ctrl+Alt+B)', action: 'bold' },
        { label: 'Курсив (Ctrl+I / Ctrl+Alt+I)', action: 'italic' },
        { label: 'Подчеркнутый (Ctrl+U / Ctrl+Alt+U)', action: 'underline' },
        { label: 'Зачеркнутый (Ctrl+Shift+S)', action: 'strikethrough' },
        { label: 'Встроенный код (Ctrl+E / Ctrl+Alt+E)', action: 'inline-code' },
        { label: 'Ссылка (Ctrl+K / Ctrl+Alt+K)', action: 'link' },
        { label: 'Маркированный список', action: 'bulleted-list' },
        { label: 'Нумерованный список', action: 'numbered-list' },
        { label: 'Цитата', action: 'quote' },
        { label: 'Изображение', action: 'image' },
      ];

      const createActionIconBadge = (action: BlocksAction) => {
        const iconBadge = document.createElement('span');
        iconBadge.dataset.icon = 'true';
        iconBadge.style.display = 'inline-flex';
        iconBadge.style.alignItems = 'center';
        iconBadge.style.justifyContent = 'center';
        iconBadge.style.width = '34px';
        iconBadge.style.height = '34px';
        iconBadge.style.flexShrink = '0';
        iconBadge.style.fontSize = '20px';
        iconBadge.style.fontWeight = '700';
        iconBadge.style.lineHeight = '1';
        iconBadge.style.borderRadius = '9px';
        iconBadge.style.background = 'rgba(69, 75, 125, 0.35)';
        iconBadge.style.border = '1px solid rgba(118, 126, 187, 0.42)';
        iconBadge.style.color = '#ffffff';

        if (action === 'bold') iconBadge.textContent = 'B';
        else if (action === 'italic') iconBadge.textContent = 'I';
        else if (action === 'underline') iconBadge.textContent = 'U';
        else if (action === 'strikethrough') iconBadge.textContent = 'S';
        else if (action === 'inline-code') {
          iconBadge.textContent = '</>';
          iconBadge.style.fontFamily = 'Consolas, "Courier New", monospace';
          iconBadge.style.fontSize = '15px';
          iconBadge.style.letterSpacing = '-0.3px';
          iconBadge.style.whiteSpace = 'nowrap';
        } else if (action === 'link') iconBadge.textContent = '⛓';
        else if (action === 'bulleted-list') iconBadge.textContent = '•';
        else if (action === 'numbered-list') iconBadge.textContent = '1.';
        else if (action === 'quote') {
          iconBadge.textContent = '“”';
          iconBadge.style.fontFamily = 'Georgia, "Times New Roman", serif';
          iconBadge.style.fontSize = '20px';
          iconBadge.style.transform = 'translateY(-1px)';
          iconBadge.style.whiteSpace = 'nowrap';
        } else if (action === 'image') {
          iconBadge.textContent = 'IMG';
          iconBadge.style.fontSize = '11px';
          iconBadge.style.letterSpacing = '0.5px';
        }

        return iconBadge;
      };

      entries.forEach(({ label, action }) => {
        const button = document.createElement('button');
        button.type = 'button';
        const content = document.createElement('span');
        content.style.display = 'inline-flex';
        content.style.alignItems = 'center';
        content.style.gap = '12px';
        content.style.width = '100%';

        const iconBadge = createActionIconBadge(action);

        const textLabel = document.createElement('span');
        textLabel.textContent = label;
        textLabel.style.flex = '1';
        textLabel.style.fontSize = '13px';
        textLabel.style.fontWeight = '500';
        textLabel.style.lineHeight = '1.25';
        textLabel.style.letterSpacing = '0.1px';

        content.appendChild(iconBadge);
        content.appendChild(textLabel);
        button.appendChild(content);
        button.style.display = 'block';
        button.style.width = '100%';
        button.style.textAlign = 'left';
        button.style.padding = '9px 10px';
        button.style.border = '0';
        button.style.background = 'transparent';
        button.style.color = '#f3f5ff';
        button.style.cursor = 'pointer';
        button.style.borderRadius = '9px';
        button.style.transition = 'background .12s ease, box-shadow .12s ease, color .12s ease';
        button.onmouseenter = () => {
          if (button.dataset.active !== 'true') {
            button.style.background = 'rgba(55, 70, 148, 0.3)';
            button.style.boxShadow = 'inset 0 0 0 1px rgba(106, 124, 208, 0.35)';
          }
        };
        button.onmouseleave = () => {
          if (button.dataset.active !== 'true') {
            button.style.background = 'transparent';
            button.style.boxShadow = 'none';
          }
        };
        button.onclick = () => {
          triggerBlocksAction(action, contextEditorRoot, contextSelectionRange);
          refreshContextMenuState();
          hideBlocksContextMenu();
        };
        contextMenuButtons.set(action, button);
        menu.appendChild(button);
      });

      document.body.appendChild(menu);
      blocksContextMenu = menu;
      return menu;
    };

    const selectionChangeHandler = () => {
      contextEditorRoot = getActiveBlocksEditor();
      if (!contextEditorRoot) {
        contextSelectionRange = null;
        return;
      }
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        contextSelectionRange = null;
        return;
      }
      const range = selection.getRangeAt(0);
      if (!contextEditorRoot.contains(range.startContainer)) {
        contextSelectionRange = null;
        return;
      }
      contextSelectionRange = range.cloneRange();
    };

    const contextMenuHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const isBlocksEditor = target?.closest?.('[data-slate-editor="true"]') as HTMLElement | null;
      if (!isBlocksEditor) return;

      event.preventDefault();
      contextEditorRoot = isBlocksEditor;
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const selectedRange = selection.getRangeAt(0);
        if (isBlocksEditor.contains(selectedRange.startContainer)) {
          contextSelectionRange = selectedRange.cloneRange();
        }
      }
      const menu = createBlocksContextMenu();
      refreshContextMenuState();
      menu.style.display = 'block';
      const viewportPadding = 8;
      const menuRect = menu.getBoundingClientRect();
      const maxLeft = Math.max(viewportPadding, window.innerWidth - menuRect.width - viewportPadding);
      const maxTop = Math.max(viewportPadding, window.innerHeight - menuRect.height - viewportPadding);
      const nextLeft = Math.min(event.clientX, maxLeft);
      const nextTop = Math.min(event.clientY, maxTop);
      menu.style.left = `${Math.max(viewportPadding, nextLeft)}px`;
      menu.style.top = `${Math.max(viewportPadding, nextTop)}px`;
    };

    updateUploadDropzoneText();
    lockPageTitleInput();
    normalizePageEditLayout();
    lockPageDeleteButtons();
    localizeI18nLocalePickerTexts();
    localizeBlocksLinkPopoverTexts();
    ensureImageOptimizerButton();

    document.addEventListener('keydown', hotkeyHandler, true);
    document.addEventListener('contextmenu', contextMenuHandler, true);
    document.addEventListener('click', hideBlocksContextMenu, true);
    document.addEventListener('scroll', hideBlocksContextMenu, true);
    document.addEventListener('selectionchange', selectionChangeHandler);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') hideBlocksContextMenu();
    });

    // Модалка upload рендерится динамически — подхватываем новые узлы.
    const observer = new MutationObserver(() => {
      updateUploadDropzoneText();
      lockPageTitleInput();
      normalizePageEditLayout();
      lockPageDeleteButtons();
      localizeI18nLocalePickerTexts();
      localizeBlocksLinkPopoverTexts();
      ensureImageOptimizerButton();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
};

