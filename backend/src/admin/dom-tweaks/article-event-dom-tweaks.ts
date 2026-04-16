import { isArticleOrEventScreen, isEventScreen } from '../admin-url-utils';

export function keepRuLocaleInAddressBarForArticleAndEvent(): void {
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
}

export function hideLocaleControlsForArticleAndEvent(): void {
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
    const wrapper = node.closest<HTMLElement>('[data-state]') || node.closest<HTMLElement>('[role="group"]') || node.parentElement;
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
}
