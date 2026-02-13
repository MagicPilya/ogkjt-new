import type { Core } from '@strapi/strapi';

/** Действия API, которые разрешаем для роли Public (find и findOne для контента, find для Global) */
const PUBLIC_PERMISSION_ACTIONS = [
  'api::article.article.find',
  'api::article.article.findOne',
  'api::event.event.find',
  'api::event.event.findOne',
  'api::page.page.find',
  'api::page.page.findOne',
  'api::global.global.find',
] as const;

/**
 * Дефолтное меню для глобальных настроек в Strapi (Global Settings → mainMenu).
 * Структура: элементы menu-section с title, url и links (массив menu-link: title, url).
 */
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
      { title: 'Общежитие', url: '/students/dormitory' },
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

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await setPublicPermissions(strapi);
      await seedGlobalIfEmpty(strapi);
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
  // Для single type проверяем наличие любой записи (draft или published)
  const existing = await strapi.documents('api::global.global').findFirst();
  if (existing) return;

  // Создаём сразу опубликованным (status: 'published'), иначе API не отдаёт данные на фронт
  await strapi.documents('api::global.global').create({
    data: {
      mainMenu: DEFAULT_MAIN_MENU,
      address: '211386, Республика Беларусь, г. Орша, Витебская обл., ул. Климента Тимирязева, 26.',
      phoneReception: '(0216) 29-31-10',
      phoneDirector: '(0216) 29-21-25',
      email: 'ogkjt@bsut.by',
      instagramLink: 'https://www.instagram.com/orsha_jd?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
      telegramLink: 'https://t.me/orsha_jd',
      tiktokLink: 'https://www.tiktok.com/@bsut.orsha?_r=1&_t=ZS-93UxtlAecmO',
    },
    status: 'published',
  });
}
