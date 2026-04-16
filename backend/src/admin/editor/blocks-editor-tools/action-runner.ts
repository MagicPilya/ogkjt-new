import {
  MENU_CONTAINERS_SELECTOR,
  MENU_OPTIONS_SELECTOR,
  TOOLBAR_BUTTONS_SELECTOR,
  blockTypeOptionLabels,
  blockTypeTriggerLabels,
  blocksActionLabels,
  optionTextByAction,
  selectDrivenActions,
  type BlocksAction,
} from './config';
import { applyFallbackFormatting } from './fallback-formatting';
import {
  activateToolbarButton,
  getActionScope,
  getActiveBlocksEditor,
  getElementActionText,
  getNodeOwnText,
  isToolbarActionElement,
  isVisible,
  normalizeText,
  restoreSelectionInEditor,
} from './dom-utils';

export const tryApplyViaBlockTypeSelect = (action: BlocksAction, root: HTMLElement): boolean => {
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
      Array.from(container.querySelectorAll<HTMLElement>(MENU_OPTIONS_SELECTOR)).filter((el) => isToolbarActionElement(el))
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

export const triggerBlocksAction = (
  action: BlocksAction,
  preferredRoot?: HTMLElement | null,
  preferredRange?: Range | null
): boolean => {
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

export const getActionActiveState = (action: BlocksAction, root: HTMLElement) => {
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
