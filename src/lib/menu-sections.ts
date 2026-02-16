import type { MenuSection, MenuLink } from "./strapi";

/**
 * Единый источник структуры меню и подразделов.
 * Используется при отсутствии Strapi или при развёртывании без CMS.
 * Редактируйте только здесь — изменения переносятся при любом клонировании/сборке.
 */
export const defaultMenu: MenuSection[] = [
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
];

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
 * Заголовок страницы по pathname из меню (раздел или подраздел).
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

/**
 * Нормализует меню из Strapi: подставляет url/links из defaultMenu, если в ответе их нет.
 * Так поведение сайта одинаковое и при данных из CMS, и при встроенных данных.
 */
export function normalizeMenu(menu: MenuSection[] | null | undefined): MenuSection[] | null {
    if (!menu || !Array.isArray(menu) || menu.length === 0) return null;
    return menu.map((item, index) => {
        const fallback = defaultMenu[index] ?? defaultMenu.find(d => d.url === item.url || d.title === item.title);
        const url = item.url ?? fallback?.url ?? "#";
        const links = Array.isArray(item.links) && item.links.length > 0
            ? item.links
            : (fallback?.links ?? []) as MenuLink[];
        return { id: item.id, title: item.title, url, links };
    });
}
