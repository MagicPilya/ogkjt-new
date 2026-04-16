import { isPageScreen } from '../admin-url-utils';

export function updateUploadDropzoneText(): void {
  const oldUploadLabel = 'Перетащите сюда или';
  const newUploadLabel = 'Перетащите файлы сюда или выберите на компьютере';

  const fileInputs = document.querySelectorAll<HTMLInputElement>(`input[type="file"][aria-label="${oldUploadLabel}"]`);
  fileInputs.forEach((input) => input.setAttribute('aria-label', newUploadLabel));

  const spans = document.querySelectorAll<HTMLSpanElement>('span');
  spans.forEach((span) => {
    if (span.textContent?.trim() === oldUploadLabel) {
      span.textContent = newUploadLabel;
    }
  });
}

export function lockPageTitleInput(): void {
  if (!isPageScreen(window.location.pathname)) return;

  const titleInput = document.querySelector<HTMLInputElement>('input[name="title"]');
  if (!titleInput) return;

  if (!titleInput.disabled) {
    titleInput.disabled = true;
  }
  titleInput.setAttribute('title', 'Поле заполняется автоматически из пункта меню');
  titleInput.setAttribute('aria-disabled', 'true');
  titleInput.style.cursor = 'not-allowed';
  titleInput.style.opacity = '0.8';
}

export function normalizePageEditLayout(): void {
  if (!isPageScreen(window.location.pathname)) return;

  const pageEditRoot = document.querySelector<HTMLElement>('main') ?? document.body;

  const findFieldContainer = (fieldName: string, fallbackLabel?: string): HTMLElement | null => {
    const byDataAttr = pageEditRoot.querySelector<HTMLElement>(`[data-strapi-field-name="${fieldName}"], [data-field-name="${fieldName}"]`);
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
        const wrapper = node.closest<HTMLElement>('[data-strapi-field-name], [data-field-name]') || node.closest<HTMLElement>('div');
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
}

export function lockPageDeleteButtons(): void {
  if (!isPageScreen(window.location.pathname)) return;

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
}

export function localizeI18nLocalePickerTexts(): void {
  if (!isPageScreen(window.location.pathname)) return;

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
}
