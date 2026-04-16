import { isArticleOrEventScreen, isEventScreen, isPageScreen } from './admin-url-utils';

export function applyAdminDomLocalizationTweaks(): void {
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
    const onPageEditScreen = isPageScreen(window.location.pathname);
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
    const onPageEditScreen = isPageScreen(window.location.pathname);
    if (!onPageEditScreen) return;
    const pageEditRoot = document.querySelector<HTMLElement>('main') ?? document.body;

    const findFieldContainer = (fieldName: string, fallbackLabel?: string): HTMLElement | null => {
      const byDataAttr = pageEditRoot.querySelector<HTMLElement>(
        `[data-strapi-field-name="${fieldName}"], [data-field-name="${fieldName}"]`
      );
      if (byDataAttr) return byDataAttr;

      const byName = pageEditRoot.querySelector<HTMLElement>(`[name="${fieldName}"]`);
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
        const textNodes = pageEditRoot.querySelectorAll<HTMLElement>('label, span, div, p');
        for (const node of Array.from(textNodes)) {
          if (node.textContent?.trim() !== fallbackLabel) continue;
          const wrapper =
            node.closest<HTMLElement>('[data-strapi-field-name], [data-field-name]') || node.closest<HTMLElement>('div');
          if (wrapper) return wrapper;
        }
      }

      return null;
    };

    const hideField = (fieldName: string, label: string) => {
      const fieldContainer = findFieldContainer(fieldName, label);
      if (fieldContainer) fieldContainer.style.display = 'none';
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
    const onPageScreen = isPageScreen(window.location.pathname);
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
    const onPageEditScreen = isPageScreen(window.location.pathname);
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
      const createLocaleMatch = text.match(/^Create\s+(.+)\s+locale$/i);
      if (createLocaleMatch) {
        el.textContent = `Создать локаль ${createLocaleMatch[1]}`;
      }
    });
  };

  const localizeCommonStatusBadges = () => {
    const elements = document.querySelectorAll<HTMLElement>('span, div, p');
    elements.forEach((el) => {
      const text = el.textContent?.trim();
      if (!text) return;
      if (text === 'Modified') el.textContent = 'Черновик';
      if (text === 'Draft') el.textContent = 'Черновик';
      if (text === 'Опубликован') el.textContent = 'Опубликовано';
      if (text === 'Published') el.textContent = 'Опубликовано';
    });
  };

  const normalizeStatusBadgeTypography = () => {
    const statusTexts = new Set(['Черновик', 'Опубликовано']);
    const elements = document.querySelectorAll<HTMLElement>('span, div, p');
    elements.forEach((el) => {
      const text = el.textContent?.trim();
      if (!text || !statusTexts.has(text)) return;
      el.style.fontSize = '1.4rem';
      el.style.lineHeight = '1.43';
      el.style.fontWeight = '600';
    });
  };

  const localizeAndNormalizeStatusBadges = () => {
    localizeCommonStatusBadges();
    normalizeStatusBadgeTypography();
    localizeCommonStatusBadges();
    normalizeStatusBadgeTypography();
  };

  const keepRuLocaleInAddressBarForArticleAndEvent = () => {
    if (!isArticleOrEventScreen(window.location.pathname)) return;
    const url = new URL(window.location.href);
    let changed = false;

    const localeKeys = ['locale', 'plugins[i18n][locale]'];
    localeKeys.forEach((key) => {
      const current = url.searchParams.get(key);
      if (current === 'ru') return;
      if (current !== null || key === 'locale') {
        url.searchParams.set(key, 'ru');
        changed = true;
      }
    });

    if (changed) {
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };

  const hideLocaleControlsForArticleAndEvent = () => {
    if (!isArticleOrEventScreen(window.location.pathname)) return;
    const root = document.querySelector<HTMLElement>('main') ?? document.body;
    const localeTokens = new Set(['ru', 'be', 'en', 'русский', 'беларуская', 'english']);
    const controls = root.querySelectorAll<HTMLElement>('button, [role="button"], select, a[href]');

    controls.forEach((node) => {
      const text = (node.textContent ?? '').trim().toLowerCase();
      const ariaLabel = (node.getAttribute('aria-label') ?? '').trim().toLowerCase();
      const testId = (node.getAttribute('data-testid') ?? '').trim().toLowerCase();
      const href = (node.getAttribute('href') ?? '').trim().toLowerCase();
      const name = (node.getAttribute('name') ?? '').trim().toLowerCase();
      const id = (node.getAttribute('id') ?? '').trim().toLowerCase();
      const haystack = `${text} ${ariaLabel} ${testId} ${name} ${id}`;
      const hasLocaleHint = /locale|локал|language|язык|i18n/.test(haystack);
      const isLocaleToken = localeTokens.has(text);
      const hasI18nHref = href.includes('plugins%5bi18n%5d%5blocale%5d') || href.includes('plugins[i18n][locale]');

      if (!hasLocaleHint && !isLocaleToken && !hasI18nHref) return;
      if (node.closest('table')) return;

      if (node instanceof HTMLSelectElement) {
        node.value = 'ru';
        node.disabled = true;
      }
      if (node instanceof HTMLButtonElement) {
        node.disabled = true;
        node.setAttribute('aria-disabled', 'true');
      }

      const wrapper =
        node.closest<HTMLElement>('[data-testid*="locale" i]') ||
        node.closest<HTMLElement>('[aria-label*="locale" i]') ||
        node.closest<HTMLElement>('[role="group"]') ||
        null;
      const target = wrapper ?? node;
      if (target.getBoundingClientRect().width > 700) return;
      target.style.display = 'none';
    });

    const directLocaleComboboxSelectors = [
      '[aria-label="Выбрать перевод"][role="combobox"]',
      '[aria-label="Select translation"][role="combobox"]',
    ].join(', ');
    const directLocaleComboboxes = root.querySelectorAll<HTMLElement>(directLocaleComboboxSelectors);
    directLocaleComboboxes.forEach((node) => {
      const wrapper =
        node.closest<HTMLElement>('[data-state]') || node.closest<HTMLElement>('[role="group"]') || node.parentElement;
      const target = wrapper ?? node;
      target.style.display = 'none';
    });

    if (isEventScreen(window.location.pathname)) {
      const topContainers = root.querySelectorAll<HTMLElement>('header, [role="toolbar"], [role="group"], nav, section, div');
      topContainers.forEach((container) => {
        const text = (container.textContent ?? '').toLowerCase();
        const hasLocaleLabel = text.includes('locale') || text.includes('локал');
        const hasLocaleValues = /\bru\b/.test(text) && (/\bbe\b/.test(text) || /\ben\b/.test(text));
        const hasLocaleHref = !!container.querySelector('a[href*="plugins%5Bi18n%5D%5Blocale%5D"], a[href*="plugins[i18n][locale]"]');

        if (!hasLocaleLabel && !hasLocaleValues && !hasLocaleHref) return;
        if (container.getBoundingClientRect().width > 800) return;
        container.style.display = 'none';
      });
    }
  };

  const localizeBlocksLinkPopoverTexts = () => {
    const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
    dialogs.forEach((dialog) => {
      const hasLinkField =
        dialog.querySelector('input[placeholder="Paste link"]') || dialog.querySelector('input[placeholder="Вставьте ссылку"]');
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

  const localizeEntryActionsMenuTexts = () => {
    const nodes = document.querySelectorAll<HTMLElement>('span, div, p, button, a');
    const applyDeleteLikeTypography = (node: HTMLElement) => {
      node.style.fontSize = '1.4rem';
      node.style.lineHeight = '1.43';
      node.style.fontWeight = '600';
    };
    nodes.forEach((node) => {
      const text = node.textContent?.trim();
      if (!text) return;

      if (text === 'Edit') {
        node.textContent = 'Редактировать';
        applyDeleteLikeTypography(node);
        return;
      }
      if (text === 'Duplicate') {
        node.textContent = 'Дублировать';
        applyDeleteLikeTypography(node);
        return;
      }
      if (text === 'Редактировать' || text === 'Дублировать') {
        applyDeleteLikeTypography(node);
        return;
      }
      if (text === 'Delete entry') {
        node.textContent = 'Удалить запись';
        return;
      }
      if (text === 'Delete entry (all locales)') {
        node.textContent = 'Удалить запись (все локали)';
      }
    });
  };

  const localizeCreateEntryTexts = () => {
    const nodes = document.querySelectorAll<HTMLElement>('h1, h2, h3, span, div, p, a, button');
    nodes.forEach((node) => {
      const text = node.textContent?.trim();
      if (!text) return;
      if (text === 'Create an entry') {
        node.textContent = 'Создать запись';
      }
    });
  };

  const localizeDocumentTitle = () => {
    const title = document.title;
    if (!title) return;
    if (title.includes('Untitled')) {
      document.title = title.replace(/Untitled/g, 'Без названия');
    }
  };

  const hideUserCollectionTypeInSidebar = () => {
    const userHrefTokens = [
      'plugin::users-permissions.user',
      'plugin%3a%3ausers-permissions.user',
      'plugin%3a%3ausers-permissions%2euser',
      'users-permissions%2euser',
      'users-permissions.user',
    ];
    const sidebarRoots = document.querySelectorAll<HTMLElement>('nav, aside');
    if (sidebarRoots.length === 0) return;

    sidebarRoots.forEach((sidebarRoot) => {
      const links = sidebarRoot.querySelectorAll<HTMLAnchorElement>('a[href]');
      links.forEach((link) => {
        const href = (link.getAttribute('href') ?? '').toLowerCase();
        if (!href) return;
        if (!userHrefTokens.some((token) => href.includes(token))) return;
        const row =
          link.closest<HTMLElement>('[role="listitem"]') ||
          link.closest<HTMLElement>('[role="menuitem"]') ||
          link.closest<HTMLElement>('li') ||
          link;
        row.style.display = 'none';
      });
    });
  };

  updateUploadDropzoneText();
  lockPageTitleInput();
  normalizePageEditLayout();
  lockPageDeleteButtons();
  localizeI18nLocalePickerTexts();
  keepRuLocaleInAddressBarForArticleAndEvent();
  hideLocaleControlsForArticleAndEvent();
  localizeBlocksLinkPopoverTexts();
  localizeAndNormalizeStatusBadges();
  localizeEntryActionsMenuTexts();
  localizeCreateEntryTexts();
  localizeDocumentTitle();
  hideUserCollectionTypeInSidebar();
}
