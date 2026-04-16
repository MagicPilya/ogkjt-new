import { promptForSafeHttpUrl } from '../../core/admin-url-utils';

import type { BlocksAction } from './config';
import { escapeHtml, hasSelectionInsideRoot, insertNodeByRange, insertQuoteBlockAtRange } from './dom-utils';

export const applyFallbackFormatting = (action: BlocksAction, root: HTMLElement): boolean => {
  const hasSelection = hasSelectionInsideRoot(root);
  if (action === 'bold') return document.execCommand('bold');
  if (action === 'italic') return document.execCommand('italic');
  if (action === 'underline') return document.execCommand('underline');
  if (action === 'strikethrough') return document.execCommand('strikeThrough');
  if (action === 'link') {
    if (!hasSelection) return false;
    const url = promptForSafeHttpUrl('Введите URL ссылки');
    if (!url) return false;
    return document.execCommand('createLink', false, url);
  }
  if (action === 'bulleted-list') return document.execCommand('insertUnorderedList');
  if (action === 'numbered-list') return document.execCommand('insertOrderedList');
  if (action === 'quote') {
    if (!hasSelection) {
      const insertedByRange = insertQuoteBlockAtRange(root);
      if (insertedByRange) return true;
      return document.execCommand('insertHTML', false, '<blockquote><p>Цитата</p></blockquote><p><br/></p>');
    }
    const selection = window.getSelection();
    const selectedText = selection?.toString() ?? '';
    if (!selectedText) return document.execCommand('formatBlock', false, 'blockquote');
    const blockquote = document.createElement('blockquote');
    blockquote.textContent = selectedText;
    const byRange = insertNodeByRange(root, blockquote);
    if (byRange) return true;
    return document.execCommand('formatBlock', false, 'blockquote');
  }
  if (action === 'image') {
    const url = promptForSafeHttpUrl('Введите URL изображения');
    if (!url) return false;
    const inserted = document.execCommand('insertImage', false, url);
    if (inserted) return true;
    const image = document.createElement('img');
    image.setAttribute('src', url);
    image.setAttribute('alt', '');
    return insertNodeByRange(root, image);
  }
  if (action === 'inline-code') {
    if (!hasSelection) return false;
    const selection = window.getSelection();
    const selectedText = selection?.toString() ?? '';
    if (!selectedText) return false;
    const code = document.createElement('code');
    code.textContent = selectedText;
    const byRange = insertNodeByRange(root, code);
    if (byRange) return true;
    return document.execCommand('insertHTML', false, `<code>${escapeHtml(selectedText)}</code>`);
  }
  return false;
};
