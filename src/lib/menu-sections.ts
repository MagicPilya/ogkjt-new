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
            { id: 13, title: "Общежитие", url: "/students/dormitory" },
        ]
    },
    {
        id: 5,
        title: "Воспитательная работа",
        url: "/ideology",
        links: [
            { id: 14, title: "СППС", url: "/ideology/spps" },
            { id: 15, title: "Молодёжная политика", url: "/ideology/youth-policy" },
            { id: 16, title: "В помощь куратору", url: "/ideology/curator" },
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
