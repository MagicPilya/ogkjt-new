import { installBlocksEditorContextMenu } from './blocks-editor-tools/context-menu';
import { installBlocksEditorHotkeys } from './blocks-editor-tools/hotkeys';

let isBlocksEditorToolsInstalled = false;

export function installBlocksEditorTools(): void {
  if (isBlocksEditorToolsInstalled) return;
  isBlocksEditorToolsInstalled = true;
  installBlocksEditorHotkeys();
  installBlocksEditorContextMenu();
}
