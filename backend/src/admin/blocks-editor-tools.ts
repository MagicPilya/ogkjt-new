import { promptForSafeHttpUrl } from './admin-url-utils';
import { isDraftShortcutScreen } from './runtime-helpers';

const EDITOR_SELECTOR = '[data-slate-editor="true"]';
const TOOLBAR_BUTTONS_SELECTOR = 'button, [role="button"]';
const MENU_OPTIONS_SELECTOR = '[role="menuitem"], [role="option"], button, [role="button"]';
const MENU_CONTAINERS_SELECTOR = '[role="menu"], [data-radix-popper-content-wrapper], [data-floating-ui-portal]';

let isBlocksEditorToolsInstalled = false;

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

export function installBlocksEditorTools(): void {
  if (isBlocksEditorToolsInstalled) return;
  isBlocksEditorToolsInstalled = true;

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
    const selectionRoot = fromSelection?.closest?.(EDITOR_SELECTOR) as HTMLElement | null;
    if (selectionRoot) return selectionRoot;

    const active = document.activeElement as HTMLElement | null;
    const activeRoot = active?.closest?.(EDITOR_SELECTOR) as HTMLElement | null;
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
    return !!startNode?.closest?.(EDITOR_SELECTOR) && root.contains(startNode);
  };

  const escapeHtml = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const insertNodeByRange = (root: HTMLElement, node: Node): boolean => {
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

  const insertQuoteBlockAtRange = (root: HTMLElement): boolean => {
    const blockquote = document.createElement('blockquote');
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Цитата';
    blockquote.appendChild(paragraph);
    return insertNodeByRange(root, blockquote);
  };

  const applyFallbackFormatting = (action: BlocksAction, root: HTMLElement): boolean => {
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

  const getActionScope = (root: HTMLElement): HTMLElement =>
    (root.closest('[data-strapi-field]') as HTMLElement | null) ??
    (root.closest('[role="dialog"]') as HTMLElement | null) ??
    (root.closest('form') as HTMLElement | null) ??
    document.body;

  const tryApplyViaBlockTypeSelect = (action: BlocksAction, root: HTMLElement): boolean => {
    if (!selectDrivenActions.has(action)) return false;
    const scope = getActionScope(root);
    const buttons = Array.from(scope.querySelectorAll<HTMLElement>(TOOLBAR_BUTTONS_SELECTOR)).filter((el) =>
      isToolbarActionElement(el)
    );
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
      const menuContainers = Array.from(document.querySelectorAll<HTMLElement>(MENU_CONTAINERS_SELECTOR)).filter((el) =>
        isVisible(el)
      );
      if (menuContainers.length === 0) return false;
      const optionCandidates = menuContainers.flatMap((container) =>
        Array.from(container.querySelectorAll<HTMLElement>(MENU_OPTIONS_SELECTOR)).filter((el) =>
          isToolbarActionElement(el)
        )
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

    const scope = getActionScope(root);
    const candidates = Array.from(scope.querySelectorAll<HTMLElement>(TOOLBAR_BUTTONS_SELECTOR)).filter((el) =>
      isToolbarActionElement(el)
    );
    const labels = blocksActionLabels[action];
    for (const button of candidates) {
      const text = getElementActionText(button);
      if (!labels.some((label) => text.includes(label))) continue;
      activateToolbarButton(button);
      return true;
    }
    return applyFallbackFormatting(action, root);
  };

  const trySaveDraftByHotkey = (): boolean => {
    if (!isDraftShortcutScreen(window.location.pathname)) return false;
    const root = document.querySelector<HTMLElement>('main') ?? document.body;
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('button'));
    const saveButton = buttons.find((button) => {
      if (button.disabled || button.getAttribute('aria-disabled') === 'true') return false;
      if (!isVisible(button)) return false;
      const text = `${button.textContent ?? ''} ${button.getAttribute('aria-label') ?? ''}`.toLowerCase().trim();
      if (!text) return false;
      return text.includes('save') || text.includes('сохран');
    });

    if (!saveButton) return false;
    saveButton.click();
    return true;
  };

  const hotkeyHandler = (event: KeyboardEvent) => {
    const hasModifier = event.ctrlKey || event.metaKey;
    if (!hasModifier) return;
    const key = event.key.toLowerCase();
    const code = event.code;

    if ((code === 'KeyS' || key === 's') && !event.shiftKey && !event.altKey) {
      const saved = trySaveDraftByHotkey();
      if (!saved) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      return;
    }

    const target = event.target as HTMLElement | null;
    const targetEditor = target?.closest?.(EDITOR_SELECTOR) as HTMLElement | null;
    const activeEditor = getActiveBlocksEditor();
    const editorRoot = targetEditor ?? activeEditor;

    let action: BlocksAction | null = null;
    const allowSimple = !event.shiftKey || event.altKey;

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
    const scope = getActionScope(root);
    const labels = blocksActionLabels[action];
    const buttons = Array.from(scope.querySelectorAll<HTMLElement>(TOOLBAR_BUTTONS_SELECTOR));

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
    const isBlocksEditor = target?.closest?.(EDITOR_SELECTOR) as HTMLElement | null;
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

  document.addEventListener('keydown', hotkeyHandler, true);
  document.addEventListener('contextmenu', contextMenuHandler, true);
  document.addEventListener('click', hideBlocksContextMenu, true);
  document.addEventListener('scroll', hideBlocksContextMenu, true);
  document.addEventListener('selectionchange', selectionChangeHandler);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideBlocksContextMenu();
  });
}
