import { installBlocksEditorTools } from './blocks-editor-tools';
import { applyAdminDomLocalizationTweaks } from './dom-localization';
import { ensureImageOptimizerButton } from './upload-tools';

let isAdminBootstrapInstalled = false;

export function bootstrapAdmin(): void {
  if (isAdminBootstrapInstalled) return;
  isAdminBootstrapInstalled = true;

  const applyStaticEnhancements = () => {
    applyAdminDomLocalizationTweaks();
    ensureImageOptimizerButton();
  };

  applyStaticEnhancements();
  installBlocksEditorTools();

  // Модалка upload рендерится динамически — подхватываем новые узлы.
  const observer = new MutationObserver(() => {
    applyStaticEnhancements();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
