import { EDITOR_SELECTOR } from './config';

export const normalizeText = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();

export const getNodeOwnText = (el: HTMLElement) => normalizeText(el.textContent ?? '');

export const getActiveBlocksEditor = (): HTMLElement | null => {
  const selection = window.getSelection();
  const fromSelection = selection?.anchorNode instanceof Element ? selection.anchorNode : selection?.anchorNode?.parentElement;
  const selectionRoot = fromSelection?.closest?.(EDITOR_SELECTOR) as HTMLElement | null;
  if (selectionRoot) return selectionRoot;

  const active = document.activeElement as HTMLElement | null;
  const activeRoot = active?.closest?.(EDITOR_SELECTOR) as HTMLElement | null;
  return activeRoot ?? null;
};

export const isVisible = (el: HTMLElement) => {
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && el.getBoundingClientRect().height > 0;
};

export const activateToolbarButton = (button: HTMLElement) => {
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

export const hasSelectionInsideRoot = (root: HTMLElement) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;
  const range = selection.getRangeAt(0);
  const startNode = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
  return !!startNode?.closest?.('[data-slate-editor="true"]') && root.contains(startNode);
};

export const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const insertNodeByRange = (root: HTMLElement, node: Node): boolean => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer)) return false;

  const fragment = document.createDocumentFragment();
  fragment.appendChild(node);
  range.deleteContents();
  range.insertNode(fragment);
  selection.removeAllRanges();
  return true;
};

export const insertQuoteBlockAtRange = (root: HTMLElement): boolean => {
  const blockquote = document.createElement('blockquote');
  const paragraph = document.createElement('p');
  paragraph.textContent = 'Цитата';
  blockquote.appendChild(paragraph);
  return insertNodeByRange(root, blockquote);
};

export const getElementActionText = (el: HTMLElement) =>
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

export const isToolbarActionElement = (el: HTMLElement) => {
  if (!isVisible(el)) return false;
  if (el.getAttribute('aria-disabled') === 'true') return false;
  if ('disabled' in el && (el as HTMLButtonElement).disabled) return false;
  return true;
};

export const restoreSelectionInEditor = (root: HTMLElement, range?: Range | null) => {
  if (!range) return;
  const selection = window.getSelection();
  if (!selection) return;
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return;
  selection.removeAllRanges();
  selection.addRange(range);
};

export const getActionScope = (root: HTMLElement): HTMLElement =>
  (root.closest('[data-strapi-field]') as HTMLElement | null) ??
  (root.closest('[role="dialog"]') as HTMLElement | null) ??
  (root.closest('form') as HTMLElement | null) ??
  document.body;
