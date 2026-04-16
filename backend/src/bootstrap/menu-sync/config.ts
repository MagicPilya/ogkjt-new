export const MENU_POPULATE = {
  mainMenu: {
    populate: {
      links: { populate: ['sublinks'] },
    },
  },
};

export const MENU_SYNC_STORE_KEY = 'page-urls-by-locale';
export const DEFAULT_PAGE_CONTENT = [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
export const MENU_SYNC_DEDUP_WINDOW_MS = 5000;
