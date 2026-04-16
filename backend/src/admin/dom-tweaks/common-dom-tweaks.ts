export function localizeCommonStatusBadges(): void {
  const elements = document.querySelectorAll<HTMLElement>('span, div, p');
  elements.forEach((el) => {
    const text = el.textContent?.trim();
    if (!text) return;
    if (text === 'Modified') el.textContent = 'Черновик';
    if (text === 'Draft') el.textContent = 'Черновик';
    if (text === 'Опубликован') el.textContent = 'Опубликовано';
    if (text === 'Published') el.textContent = 'Опубликовано';
  });
}

export function normalizeStatusBadgeTypography(): void {
  const statusTexts = new Set(['Черновик', 'Опубликовано']);
  const elements = document.querySelectorAll<HTMLElement>('span, div, p');
  elements.forEach((el) => {
    const text = el.textContent?.trim();
    if (!text || !statusTexts.has(text)) return;
    el.style.fontSize = '1.4rem';
    el.style.lineHeight = '1.43';
    el.style.fontWeight = '600';
  });
}

export function localizeAndNormalizeStatusBadges(): void {
  localizeCommonStatusBadges();
  normalizeStatusBadgeTypography();
  localizeCommonStatusBadges();
  normalizeStatusBadgeTypography();
}

export function localizeBlocksLinkPopoverTexts(): void {
  const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
  dialogs.forEach((dialog) => {
    const hasLinkField = dialog.querySelector('input[placeholder="Paste link"]') || dialog.querySelector('input[placeholder="Вставьте ссылку"]');
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
}

export function localizeEntryActionsMenuTexts(): void {
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
}

export function localizeCreateEntryTexts(): void {
  const nodes = document.querySelectorAll<HTMLElement>('h1, h2, h3, span, div, p, a, button');
  nodes.forEach((node) => {
    const text = node.textContent?.trim();
    if (!text) return;
    if (text === 'Create an entry') {
      node.textContent = 'Создать запись';
    }
  });
}

export function localizeDocumentTitle(): void {
  const title = document.title;
  if (!title) return;
  if (title.includes('Untitled')) {
    document.title = title.replace(/Untitled/g, 'Без названия');
  }
}

export function hideUserCollectionTypeInSidebar(): void {
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
}
