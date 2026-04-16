export const EDITOR_SELECTOR = '[data-slate-editor="true"]';
export const TOOLBAR_BUTTONS_SELECTOR = 'button, [role="button"]';
export const MENU_OPTIONS_SELECTOR = '[role="menuitem"], [role="option"], button, [role="button"]';
export const MENU_CONTAINERS_SELECTOR = '[role="menu"], [data-radix-popper-content-wrapper], [data-floating-ui-portal]';

export type BlocksAction =
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

export const blocksActionLabels: Record<BlocksAction, string[]> = {
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

export const toggleActions = new Set<BlocksAction>([
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

export const selectDrivenActions = new Set<BlocksAction>(['bulleted-list', 'numbered-list', 'quote', 'image']);
export const blockTypeTriggerLabels = ['text', 'текст', 'paragraph', 'heading', 'заголовок', 'блок кода', 'code block'];

export const blockTypeOptionLabels: Record<BlocksAction, string[]> = {
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

export const optionTextByAction: Record<BlocksAction, string[]> = {
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
