import type { Locale } from "./i18n";
import type { MenuSection, MenuLink, MenuSublink } from "./strapi";
import { uiStrings } from "./ui-strings";

/**
 * Единый источник структуры меню и подразделов.
 * Используется при отсутствии Strapi или при развёртывании без CMS.
 * Редактируйте только здесь — изменения переносятся при любом клонировании/сборке.
 */
const defaultMenuByLocale: Record<Locale, MenuSection[]> = {
  ru: [
    {
        id: 1,
        title: "Новости",
        url: "/news",
        links: []
    },
    {
        id: 2,
        title: "О колледже",
        url: "/about",
        links: [
            { id: 1, title: "Администрация", url: "/about/administration" },
            { id: 2, title: "Контакты и схема проезда", url: "/about/contacts" },
            { id: 3, title: "Символика", url: "/about/symbols" },
            { id: 4, title: "Профилактика коррупции", url: "/about/corruption" },
            { id: 5, title: "Платные услуги", url: "/about/services" },
            { id: 6, title: "История колледжа", url: "/about/history" },
        ]
    },
    {
        id: 3,
        title: "Абитуриентам",
        url: "/applicants",
        links: [
            { id: 7, title: "Специальности", url: "/applicants/specialties" },
            { id: 8, title: "План приёма", url: "/applicants/plan" },
            { id: 9, title: "Документы", url: "/applicants/documents" },
            { id: 10, title: "Информация о местах", url: "/applicants/transfer" },
        ]
    },
    {
        id: 4,
        title: "Обучающимся",
        url: "/students",
        links: [
            { id: 11, title: "Дневное отделение", url: "/students/day" },
            { id: 12, title: "Заочное отделение", url: "/students/correspondence" },
            { id: 13, title: "Общежитие — Общая информация", url: "/students/dormitory" },
            { id: 14, title: "Общежитие — Новости", url: "/students/dormitory/news" },
        ]
    },
    {
        id: 5,
        title: "Воспитательная работа",
        url: "/ideology",
        links: [
            { id: 15, title: "СППС", url: "/ideology/spps" },
            { id: 16, title: "Молодёжная политика", url: "/ideology/youth-policy" },
            { id: 17, title: "В помощь куратору", url: "/ideology/curator" },
        ]
    },
    {
        id: 6,
        title: "Одно окно",
        url: "/one-window",
        links: []
    },
    {
        id: 7,
        title: "Электронные обращения",
        url: "/appeals",
        links: []
    }
  ],
  be: [
    {
      id: 1,
      title: "Навіны",
      url: "/news",
      links: []
    },
    {
      id: 2,
      title: "Пра каледж",
      url: "/about",
      links: [
        { id: 1, title: "Адміністрацыя", url: "/about/administration" },
        { id: 2, title: "Кантакты і схема праезду", url: "/about/contacts" },
        { id: 3, title: "Сімволіка", url: "/about/symbols" },
        { id: 4, title: "Прафілактыка карупцыі", url: "/about/corruption" },
        { id: 5, title: "Платныя паслугі", url: "/about/services" },
        { id: 6, title: "Гісторыя каледжа", url: "/about/history" },
      ]
    },
    {
      id: 3,
      title: "Абітурыентам",
      url: "/applicants",
      links: [
        { id: 7, title: "Спецыяльнасці", url: "/applicants/specialties" },
        { id: 8, title: "План прыёму", url: "/applicants/plan" },
        { id: 9, title: "Дакументы", url: "/applicants/documents" },
        { id: 10, title: "Інфармацыя аб месцах", url: "/applicants/transfer" },
      ]
    },
    {
      id: 4,
      title: "Навучэнцам",
      url: "/students",
      links: [
        { id: 11, title: "Дзённае аддзяленне", url: "/students/day" },
        { id: 12, title: "Завочнае аддзяленне", url: "/students/correspondence" },
        { id: 13, title: "Інтэрнат - Агульная інфармацыя", url: "/students/dormitory" },
        { id: 14, title: "Інтэрнат - Навіны", url: "/students/dormitory/news" },
      ]
    },
    {
      id: 5,
      title: "Выхаваўчая работа",
      url: "/ideology",
      links: [
        { id: 15, title: "СППС", url: "/ideology/spps" },
        { id: 16, title: "Моладзевая палітыка", url: "/ideology/youth-policy" },
        { id: 17, title: "У дапамогу куратару", url: "/ideology/curator" },
      ]
    },
    {
      id: 6,
      title: "Адно акно",
      url: "/one-window",
      links: []
    },
    {
      id: 7,
      title: "Электронныя звароты",
      url: "/appeals",
      links: []
    }
  ],
  en: [
    {
      id: 1,
      title: "News",
      url: "/news",
      links: []
    },
    {
      id: 2,
      title: "About College",
      url: "/about",
      links: [
        { id: 1, title: "Administration", url: "/about/administration" },
        { id: 2, title: "Contacts and directions", url: "/about/contacts" },
        { id: 3, title: "Symbols", url: "/about/symbols" },
        { id: 4, title: "Anti-corruption", url: "/about/corruption" },
        { id: 5, title: "Paid services", url: "/about/services" },
        { id: 6, title: "College history", url: "/about/history" },
      ]
    },
    {
      id: 3,
      title: "Applicants",
      url: "/applicants",
      links: [
        { id: 7, title: "Specialties", url: "/applicants/specialties" },
        { id: 8, title: "Admission plan", url: "/applicants/plan" },
        { id: 9, title: "Documents", url: "/applicants/documents" },
        { id: 10, title: "Information on places", url: "/applicants/transfer" },
      ]
    },
    {
      id: 4,
      title: "Students",
      url: "/students",
      links: [
        { id: 11, title: "Full-time department", url: "/students/day" },
        { id: 12, title: "Part-time department", url: "/students/correspondence" },
        { id: 13, title: "Dormitory - General info", url: "/students/dormitory" },
        { id: 14, title: "Dormitory - News", url: "/students/dormitory/news" },
      ]
    },
    {
      id: 5,
      title: "Educational work",
      url: "/ideology",
      links: [
        { id: 15, title: "SPPS", url: "/ideology/spps" },
        { id: 16, title: "Youth policy", url: "/ideology/youth-policy" },
        { id: 17, title: "For curators", url: "/ideology/curator" },
      ]
    },
    {
      id: 6,
      title: "One window",
      url: "/one-window",
      links: []
    },
    {
      id: 7,
      title: "Electronic appeals",
      url: "/appeals",
      links: []
    }
  ],
};

export const defaultMenu: MenuSection[] = defaultMenuByLocale.ru;

export function getDefaultMenu(locale: Locale = "ru"): MenuSection[] {
  return defaultMenuByLocale[locale] ?? defaultMenuByLocale.ru;
}

export type SubSectionLink = { id: number; title: string; url: string };

/** Подразделы по URL раздела (например /applicants, /about) */
export function getSubLinks(sectionUrl: string): SubSectionLink[] {
    const section = defaultMenu.find(s => s.url === sectionUrl);
    return section?.links ?? [];
}

export interface SectionByPathResult {
    section: MenuSection;
    /** URL раздела для ленты статей (например /students/dormitory для страницы общежития) */
    sectionUrl: string;
    isRootSection: boolean;
}

/** Разделы с собственной лентой статей (длинные пути первыми для корректного match). */
const FEED_SECTION_URLS = [
    "/students/dormitory",
    "/news",
    "/about",
    "/applicants",
    "/students",
    "/ideology",
    "/one-window",
    "/appeals",
] as const;

/**
 * По pathname возвращает sectionUrl для ленты статей (значение из enum Article.sectionUrl).
 * Например: /students/dormitory/news → /students/dormitory, /about/administration → /about.
 */
export function getFeedSectionUrlForPath(pathname: string): string {
    const path = pathname.replace(/^\//, "").trim() || "";
    const pathWithSlash = "/" + path;
    for (const feedUrl of FEED_SECTION_URLS) {
        if (pathWithSlash === feedUrl || pathWithSlash.startsWith(feedUrl + "/")) return feedUrl;
    }
    return "/" + path.split("/")[0];
}

/**
 * Заголовок страницы по pathname из меню (раздел, подраздел или пункт 3-го уровня).
 */
export function getTitleForPath(pathname: string, menu: MenuSection[]): string {
  const path = pathname.replace(/^\//, "").trim() || "";
  const pathWithSlash = "/" + path;
  for (const section of menu) {
    const sectionUrl = (section.url ?? "").replace(/^\//, "");
    if (path === sectionUrl || pathWithSlash === (section.url ?? "")) return section.title ?? path;
    for (const link of section.links ?? []) {
      const linkUrl = (link.url ?? "").replace(/^\//, "");
      if (path === linkUrl || pathWithSlash === (link.url ?? "")) return link.title ?? path;
      for (const sub of link.sublinks ?? []) {
        const subUrl = (sub.url ?? "").replace(/^\//, "");
        if (path === subUrl || pathWithSlash === (sub.url ?? "")) return sub.title ?? path;
      }
    }
  }
  return path;
}

/**
 * По pathname (например /about или /about/administration) определяет секцию из меню.
 * sectionUrl — для ленты статей (раздел из enum: новости колледжа, общежития или каталог).
 */
export function getSectionByPath(pathname: string, menu: MenuSection[]): SectionByPathResult | null {
    const path = pathname.replace(/^\//, "").trim() || "";
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return null;
    const rootSegment = segments[0];
    const section = menu.find(s => (s.url ?? "").replace(/^\//, "") === rootSegment);
    if (!section) return null;
    const sectionUrl = getFeedSectionUrlForPath(pathname);
    return {
        section,
        sectionUrl,
        isRootSection: segments.length === 1,
    };
}

/** Элемент хлебной крошки */
export interface BreadcrumbItem {
  href: string;
  label: string;
}

/**
 * Форматирует slug в читаемый заголовок (например news-slug → News slug).
 */
function slugToTitle(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Строит список пунктов хлебных крошек по pathname и меню.
 * Для сегментов, не найденных в меню (например slug новости), подставляет форматированный slug или общий ярлык.
 */
export function getBreadcrumbItems(pathname: string, menu: MenuSection[], locale: Locale = "ru"): BreadcrumbItem[] {
  const path = pathname.replace(/^\//, "").trim() || "";
  if (!path) return [];

  const segments = path.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ href: "/", label: uiStrings.home[locale] }];

  for (let i = 0; i < segments.length; i++) {
    const segmentPath = segments.slice(0, i + 1).join("/");
    const href = "/" + segmentPath;
    let label = getTitleForPath("/" + segmentPath, menu);
    // Если метка совпадает с путём (не найдено в меню), форматируем или подставляем общий ярлык
    if (label === segmentPath || label === segments[i]) {
      const firstSegment = segments[0];
      if (firstSegment === "news" && i === 1) label = uiStrings.newsItem[locale];
      else if (firstSegment === "events" && i === 1) label = uiStrings.eventItem[locale];
      else label = slugToTitle(segments[i]);
    }
    items.push({ href, label });
  }

  return items;
}

/**
 * Нормализует меню из Strapi: подставляет url/links/sublinks из defaultMenu, если в ответе их нет.
 * Всегда возвращает полную структуру на основе defaultMenu, чтобы маршруты (например /applicants)
 * работали для всех локалей, даже если в Strapi для be/en не заполнены все разделы меню.
 */
export function normalizeMenu(
  menu: MenuSection[] | null | undefined,
  locale: Locale = "ru"
): MenuSection[] | null {
    // defaultMenu — источник правды для структуры; данные Strapi — только переопределения (title и т.д.)
    return getDefaultMenu(locale).map((defaultSection, index) => {
        const strapiItem = menu?.find(
            (m) =>
                (m.url && (m.url.replace(/^\//, "") === (defaultSection.url ?? "").replace(/^\//, ""))) ||
                m.title === defaultSection.title
        );
        const rawUrl = strapiItem?.url ?? defaultSection.url ?? "#";
        const url = rawUrl === "#" ? "#" : rawUrl.startsWith("/") ? rawUrl : "/" + rawUrl;
        const defaultLinks = defaultSection.links ?? [];
        const strapiLinks = Array.isArray(strapiItem?.links) ? strapiItem.links : [];
        const links = defaultLinks.map((defaultLink, linkIndex) => {
            const strapiLink = strapiLinks[linkIndex] ?? strapiLinks.find(
                (s) => (s.url && (s.url.replace(/^\//, "") === (defaultLink.url ?? "").replace(/^\//, ""))) || s.title === defaultLink.title
            );
            const link = strapiLink ?? defaultLink;
            const fbLink = defaultLink;
            const linkUrlRaw = link.url ?? fbLink?.url ?? "#";
            const linkUrl = linkUrlRaw === "#" ? "#" : linkUrlRaw.startsWith("/") ? linkUrlRaw : "/" + linkUrlRaw;
            const sublinks =
                Array.isArray(link.sublinks) && link.sublinks.length > 0
                    ? link.sublinks
                    : (fbLink && "sublinks" in fbLink ? (fbLink as MenuLink).sublinks : undefined) ?? ([] as MenuSublink[]);
            return {
                id: link.id,
                title: link.title,
                url: linkUrl,
                sublinks,
            };
        }) as MenuLink[];
        return {
            id: strapiItem?.id ?? defaultSection.id,
            title: strapiItem?.title ?? defaultSection.title,
            url,
            links,
        };
    });
}
