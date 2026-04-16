import { hideLocaleControlsForArticleAndEvent, keepRuLocaleInAddressBarForArticleAndEvent } from './article-event-dom-tweaks';
import {
  hideUserCollectionTypeInSidebar,
  localizeAndNormalizeStatusBadges,
  localizeBlocksLinkPopoverTexts,
  localizeCreateEntryTexts,
  localizeDocumentTitle,
  localizeEntryActionsMenuTexts,
} from './common-dom-tweaks';
import {
  localizeI18nLocalePickerTexts,
  lockPageDeleteButtons,
  lockPageTitleInput,
  normalizePageEditLayout,
  updateUploadDropzoneText,
} from './page-dom-tweaks';

export function applyAdminDomLocalizationTweaks(): void {
  updateUploadDropzoneText();
  lockPageTitleInput();
  normalizePageEditLayout();
  lockPageDeleteButtons();
  localizeI18nLocalePickerTexts();
  keepRuLocaleInAddressBarForArticleAndEvent();
  hideLocaleControlsForArticleAndEvent();
  localizeBlocksLinkPopoverTexts();
  localizeAndNormalizeStatusBadges();
  localizeEntryActionsMenuTexts();
  localizeCreateEntryTexts();
  localizeDocumentTitle();
  hideUserCollectionTypeInSidebar();
}
