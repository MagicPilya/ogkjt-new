import { EDITOR_SELECTOR, toggleActions, type BlocksAction } from './config';
import { getActiveBlocksEditor } from './dom-utils';
import { getActionActiveState, triggerBlocksAction } from './action-runner';

export function installBlocksEditorContextMenu(): void {
  let blocksContextMenu: HTMLDivElement | null = null;
  const contextMenuButtons = new Map<BlocksAction, HTMLButtonElement>();
  const hideBlocksContextMenu = () => {
    if (!blocksContextMenu) return;
    blocksContextMenu.style.display = 'none';
  };

  let contextEditorRoot: HTMLElement | null = null;
  let contextSelectionRange: Range | null = null;

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

  document.addEventListener('contextmenu', contextMenuHandler, true);
  document.addEventListener('click', hideBlocksContextMenu, true);
  document.addEventListener('scroll', hideBlocksContextMenu, true);
  document.addEventListener('selectionchange', selectionChangeHandler);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideBlocksContextMenu();
  });
}
