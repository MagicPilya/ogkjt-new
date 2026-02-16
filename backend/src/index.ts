import type { Core } from '@strapi/strapi';

/** Действия API, которые разрешаем для роли Public (find и findOne для контента, find для Global и Menu) */
const PUBLIC_PERMISSION_ACTIONS = [
  'api::article.article.find',
  'api::article.article.findOne',
  'api::event.event.find',
  'api::event.event.findOne',
  'api::page.page.find',
  'api::page.page.findOne',
  'api::global.global.find',
  'api::menu.menu.find',
  'api::administration.administration.find',
  'api::specialty.specialty.find',
] as const;

/**
 * Дефолтное меню для одиночного типа Menu (Меню → mainMenu).
 * Структура: элементы menu-section с title, url и links (массив menu-link: title, url).
 */
/** Миграция: старые значения sectionUrl (URL) → новые (подписи для админки). */
const SECTION_URL_TO_STRAPI: Record<string, string> = {
  '/news': 'НОВОСТИ КОЛЛЕДЖА',
  '/students/dormitory': 'НОВОСТИ ОБЩЕЖИТИЯ',
  '/about': 'О колледже',
  '/applicants': 'Абитуриентам',
  '/students': 'Обучающимся',
  '/ideology': 'Воспитательная работа',
  '/one-window': 'Одно окно',
  '/appeals': 'Электронные обращения',
};

const DEFAULT_MAIN_MENU = [
  { title: 'Новости', url: '/news', links: [] },
  {
    title: 'О колледже',
    url: '/about',
    links: [
      { title: 'Администрация', url: '/about/administration' },
      { title: 'Контакты и схема проезда', url: '/about/contacts' },
      { title: 'Символика', url: '/about/symbols' },
      { title: 'Профилактика коррупции', url: '/about/corruption' },
      { title: 'Платные услуги', url: '/about/services' },
      { title: 'История колледжа', url: '/about/history' },
    ],
  },
  {
    title: 'Абитуриентам',
    url: '/applicants',
    links: [
      { title: 'Специальности', url: '/applicants/specialties' },
      { title: 'План приёма', url: '/applicants/plan' },
      { title: 'Документы', url: '/applicants/documents' },
      { title: 'Информация о местах', url: '/applicants/transfer' },
    ],
  },
  {
    title: 'Обучающимся',
    url: '/students',
    links: [
      { title: 'Дневное отделение', url: '/students/day' },
      { title: 'Заочное отделение', url: '/students/correspondence' },
      { title: 'Общежитие — Общая информация', url: '/students/dormitory' },
      { title: 'Общежитие — Новости', url: '/students/dormitory/news' },
    ],
  },
  {
    title: 'Воспитательная работа',
    url: '/ideology',
    links: [
      { title: 'СППС', url: '/ideology/spps' },
      { title: 'Молодёжная политика', url: '/ideology/youth-policy' },
      { title: 'В помощь куратору', url: '/ideology/curator' },
    ],
  },
  { title: 'Одно окно', url: '/one-window', links: [] },
  { title: 'Электронные обращения', url: '/appeals', links: [] },
];

function getTitleForUrl(mainMenu: Array<{ title: string; url?: string | null; links?: Array<{ title: string; url: string }> }>, pageUrl: string): string | null {
  const url = (pageUrl || '').trim();
  const withSlash = url.startsWith('/') ? url : `/${url}`;
  for (const section of mainMenu) {
    const sectionUrl = (section.url ?? '').trim();
    if (sectionUrl && (sectionUrl === withSlash || sectionUrl === url)) return section.title ?? null;
    for (const link of section.links ?? []) {
      const linkUrl = (link.url ?? '').trim();
      if (linkUrl && (linkUrl === withSlash || linkUrl === url)) return link.title ?? null;
    }
  }
  return null;
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.customFields.register({
      name: 'menu-link-select',
      type: 'string',
      inputSize: { default: 6, isResizable: true },
    });

    strapi.documents.use(async (context, next) => {
      if (context.uid !== 'api::page.page' || (context.action !== 'create' && context.action !== 'update')) {
        return next();
      }
      const data = context.params?.data as { pageUrl?: string | null; title?: string | null } | undefined;
      if (!data?.pageUrl) return next();

      const menuDoc = await strapi.documents('api::menu.menu').findFirst({ status: 'published' });
      const mainMenu = (menuDoc as { mainMenu?: typeof DEFAULT_MAIN_MENU })?.mainMenu ?? DEFAULT_MAIN_MENU;
      const title = getTitleForUrl(mainMenu, data.pageUrl);
      if (title) (data as { title: string }).title = title;
      return next();
    });
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await setPublicPermissions(strapi);
      await seedGlobalIfEmpty(strapi);
      await seedMenuIfEmpty(strapi);
      await syncPagesFromMainMenu(strapi);
      await migrateArticleSectionUrls(strapi);
    } catch (e) {
      strapi.log.warn('Bootstrap default settings failed (при первом запуске можно перезапустить Strapi).', e);
    }
  },
};

async function setPublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });
  if (!publicRole) return;

  for (const action of PUBLIC_PERMISSION_ACTIONS) {
    const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
      where: { action, role: publicRole.id },
    });
    if (!existing) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: publicRole.id },
      });
    }
  }
}

async function seedGlobalIfEmpty(strapi: Core.Strapi) {
  const existing = await strapi.documents('api::global.global').findFirst();
  if (existing) return;

  await strapi.documents('api::global.global').create({
    data: {
      address: '211386, Республика Беларусь, г. Орша, Витебская обл., ул. Климента Тимирязева, 26.',
      phoneReception: '(0216) 29-31-10',
      phoneDirector: '(0216) 29-21-25',
      email: 'ogkjt@bsut.by',
      instagramLink: 'https://www.instagram.com/orsha_jd?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
      telegramLink: 'https://t.me/orsha_jd',
      tiktokLink: 'https://www.tiktok.com/@bsut.orsha?_r=1&_t=ZS-93UxtlAecmO',
      vkLink: 'https://vk.com/ofutorsha',
    },
    status: 'published',
  });
}

/** Создаёт запись Menu с дефолтным mainMenu, если её ещё нет. */
async function seedMenuIfEmpty(strapi: Core.Strapi) {
  const existing = await strapi.documents('api::menu.menu').findFirst();
  if (existing) return;

  await strapi.documents('api::menu.menu').create({
    data: { mainMenu: DEFAULT_MAIN_MENU },
    status: 'published',
  });
  strapi.log.info('Menu single type seeded with default mainMenu.');
}

/** Собирает из mainMenu все URL и заголовки (разделы + подразделы) для страниц. */
function collectUrlTitleFromMenu(mainMenu: Array<{ title: string; url?: string | null; links?: Array<{ title: string; url: string }> }>): Array<{ pageUrl: string; title: string }> {
  const items: Array<{ pageUrl: string; title: string }> = [];
  for (const section of mainMenu) {
    const sectionUrl = (section.url ?? '').trim();
    if (sectionUrl) {
      items.push({
        pageUrl: sectionUrl.startsWith('/') ? sectionUrl : `/${sectionUrl}`,
        title: section.title || sectionUrl,
      });
    }
    for (const link of section.links ?? []) {
      const linkUrl = (link.url ?? '').trim();
      if (linkUrl) {
        items.push({
          pageUrl: linkUrl.startsWith('/') ? linkUrl : `/${linkUrl}`,
          title: link.title || linkUrl,
        });
      }
    }
  }
  return items;
}

/**
 * Создаёт записи Page для всех пунктов mainMenu (тип Menu), которых ещё нет.
 * Заголовок подставляется из меню.
 */
async function syncPagesFromMainMenu(strapi: Core.Strapi) {
  const menuDoc = await strapi.documents('api::menu.menu').findFirst({ status: 'published' });
  const mainMenu = ((menuDoc as { mainMenu?: typeof DEFAULT_MAIN_MENU })?.mainMenu ?? DEFAULT_MAIN_MENU) as typeof DEFAULT_MAIN_MENU;
  const toCreate = collectUrlTitleFromMenu(mainMenu);

  for (const { pageUrl, title } of toCreate) {
    const existing = await strapi.documents('api::page.page').findFirst({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filters: { pageUrl } as any,
    });
    if (!existing) {
      await strapi.documents('api::page.page').create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { pageUrl, title, content: [] } as any,
        status: 'published',
      });
      strapi.log.info(`Page created from mainMenu: ${pageUrl} (${title})`);
    }
  }
}

/**
 * Один раз обновляет статьи со старым sectionUrl (URL) на новое значение (подпись).
 * После смены enum в схеме старые записи перестают проходить валидацию — миграция исправляет данные.
 */
async function migrateArticleSectionUrls(strapi: Core.Strapi) {
  const oldValues = Object.keys(SECTION_URL_TO_STRAPI);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docs = await strapi.documents('api::article.article').findMany({ filters: { sectionUrl: { $in: oldValues } } } as any);
  for (const doc of docs) {
    const oldVal = doc.sectionUrl as string;
    const newVal = SECTION_URL_TO_STRAPI[oldVal];
    if (newVal) {
      await strapi.documents('api::article.article').update({
        documentId: doc.documentId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { sectionUrl: newVal } as any,
      });
      strapi.log.info(`Article sectionUrl migrated: ${oldVal} → ${newVal}`);
    }
  }
}
