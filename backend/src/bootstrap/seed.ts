import type { Core } from '@strapi/strapi';

import { DEFAULT_MENU_LOCALE } from './constants';

const I18N_LOCALE_DISPLAY_NAMES: Record<string, string> = {
  ru: 'Русский (ru)',
  be: 'Беларуский (by)',
  en: 'English (en)',
};

export async function seedGlobalIfEmpty(strapi: Core.Strapi) {
  const existing = await strapi.documents('api::global.global').findFirst({
    locale: DEFAULT_MENU_LOCALE,
  });

  if (existing) return;

  await strapi.documents('api::global.global').create({
    data: {
      collegeFullName: 'Оршанский колледж - филиал учреждения образования «Белорусский государственный университет транспорта»',
      collegeShortName: 'Оршанский колледж - филиал БелГУТа',
      collegeMainName: 'Оршанский колледж',
      collegeBranchShortName: 'филиал БелГУТа',
      heroBranchWord: 'филиал',
      universityName: 'Белорусский государственный университет транспорта',
      address: '211386, Республика Беларусь, г. Орша, Витебская обл., ул. Климента Тимирязева, 26.',
      phoneReception: '(0216) 29-31-10',
      phoneDirector: '(0216) 29-21-25',
      email: 'ogkjt@bsut.by',
      instagramLink: 'https://www.instagram.com/orsha_jd?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
      telegramLink: 'https://t.me/orsha_jd',
      tiktokLink: 'https://www.tiktok.com/@bsut.orsha?_r=1&_t=ZS-93UxtlAecmO',
      vkLink: 'https://vk.com/ofutorsha',
      admissionCampaign: {
        dayStartDate: null,
        dayEndDate: null,
        partTimeStartDate: null,
        partTimeEndDate: null,
        sheetUrl: '',
        sheetOpenUrl: '',
      },
      resources: [
        { title: 'Сайт Президента РБ', url: 'https://president.gov.by' },
        { title: 'Министерство образования', url: 'https://edu.gov.by' },
        { title: 'Белорусская железная дорога', url: 'https://rw.by' },
        { title: 'Обращения.бел', url: 'https://обращения.бел' },
      ],
    },
    status: 'published',
    locale: DEFAULT_MENU_LOCALE,
  });
}

export async function seedMenuIfEmpty(strapi: Core.Strapi) {
  const existing = await strapi.documents('api::menu.menu').findFirst({
    locale: DEFAULT_MENU_LOCALE,
  });

  if (existing) return;

  await strapi.documents('api::menu.menu').create({
    data: { mainMenu: [] },
    status: 'published',
    locale: DEFAULT_MENU_LOCALE,
  });
}

export async function syncI18nLocaleDisplayNames(strapi: Core.Strapi) {
  const localeQuery = strapi.db.query('plugin::i18n.locale');
  const existingLocales = (await localeQuery.findMany({
    select: ['id', 'code', 'name'],
  })) as Array<{ id: number; code: string; name?: string }>;

  await Promise.all(
    existingLocales.map(async (locale) => {
      const expectedName = I18N_LOCALE_DISPLAY_NAMES[locale.code];
      if (!expectedName || locale.name === expectedName) return;
      await localeQuery.update({
        where: { id: locale.id },
        data: { name: expectedName },
      });
    })
  );
}
