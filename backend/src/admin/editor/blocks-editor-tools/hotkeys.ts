import { isDraftShortcutScreen } from '../../core/runtime-helpers';

import { EDITOR_SELECTOR, type BlocksAction } from './config';
import { getActiveBlocksEditor, isVisible } from './dom-utils';
import { triggerBlocksAction } from './action-runner';

function trySaveDraftByHotkey(): boolean {
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
}

function hotkeyHandler(event: KeyboardEvent) {
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
}

export function installBlocksEditorHotkeys(): void {
  document.addEventListener('keydown', hotkeyHandler, true);
}
