import type { Locale } from "./i18n";
import type { MenuSection, MenuLink, MenuSublink } from "./strapi";
import { uiStrings } from "./ui-strings";
import { yearTheme } from "./year-theme";

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
            { id: 15, title: "Социально-педагогическая и психологическая служба", url: "/ideology/spps", sublinks: [
                { id: 151, title: "Педагог-психолог", url: "/ideology/spps/psy" },
                { id: 152, title: "Педагог социальный", url: "/ideology/spps/social" },
            ] },
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
        { id: 13, title: "Інтэрнат", url: "/students/dormitory" },
      ]
    },
    {
      id: 5,
      title: "Выхаваўчая работа",
      url: "/ideology",
      links: [
        { id: 15, title: "Сацыяльна-педагагічная і псіхалагічная служба", url: "/ideology/spps", sublinks: [
            { id: 151, title: "Педагог-псіхолаг", url: "/ideology/spps/psy" },
            { id: 152, title: "Сацыяльны педагог", url: "/ideology/spps/social" },
        ] },
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
        { id: 13, title: "Dormitory", url: "/students/dormitory" },
      ]
    },
    {
      id: 5,
      title: "Educational work",
      url: "/ideology",
      links: [
        { id: 15, title: "Social, pedagogical and psychological service", url: "/ideology/spps", sublinks: [
            { id: 151, title: "Educational psychologist", url: "/ideology/spps/psy" },
            { id: 152, title: "Social educator", url: "/ideology/spps/social" },
        ] },
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
      else if (firstSegment === yearTheme.path.replace(/^\//, "") && i === 0) label = yearTheme.fallbackTitle[locale];
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
  const normalizeUrl = (value: string | null | undefined): string => {
    if (!value) return "#";
    if (value === "#") return "#";
    return value.startsWith("/") ? value : `/${value}`;
  };

  const isSameNode = (
    left: { url?: string | null; title?: string | null },
    right: { url?: string | null; title?: string | null }
  ) => {
    const leftUrl = (left.url ?? "").replace(/^\//, "");
    const rightUrl = (right.url ?? "").replace(/^\//, "");
    return (leftUrl && leftUrl === rightUrl) || (!!left.title && left.title === right.title);
  };

  const mergeSublinks = (defaultLink: MenuLink, strapiLink?: MenuLink): MenuSublink[] => {
    const fallback = Array.isArray(defaultLink.sublinks) ? defaultLink.sublinks : [];
    const incoming = Array.isArray(strapiLink?.sublinks) ? strapiLink!.sublinks : [];
    if (!fallback.length) return incoming;

    const merged = fallback.map((fallbackItem) => {
      const matched = incoming.find((item) => isSameNode(item, fallbackItem));
      const node = matched ?? fallbackItem;
      return {
        id: node.id ?? fallbackItem.id,
        title: node.title ?? fallbackItem.title,
        url: normalizeUrl(node.url ?? fallbackItem.url),
      } as MenuSublink;
    });

    for (const incomingItem of incoming) {
      if (!merged.some((item) => isSameNode(item, incomingItem))) {
        merged.push({
          id: incomingItem.id,
          title: incomingItem.title,
          url: normalizeUrl(incomingItem.url),
        } as MenuSublink);
      }
    }

    return merged;
  };

  const mergeLinks = (defaultSection: MenuSection, strapiSection?: MenuSection): MenuLink[] => {
    const fallbackLinks = Array.isArray(defaultSection.links) ? defaultSection.links : [];
    const incomingLinks = Array.isArray(strapiSection?.links) ? strapiSection!.links : [];
    if (!fallbackLinks.length) {
      return incomingLinks.map((incoming) => ({
        id: incoming.id,
        title: incoming.title,
        url: normalizeUrl(incoming.url),
        sublinks: Array.isArray(incoming.sublinks)
          ? incoming.sublinks.map((sub) => ({ ...sub, url: normalizeUrl(sub.url) }))
          : [],
      })) as MenuLink[];
    }

    const merged = fallbackLinks.map((fallbackLink) => {
      const matched = incomingLinks.find((item) => isSameNode(item, fallbackLink));
      const node = matched ?? fallbackLink;
      return {
        id: node.id ?? fallbackLink.id,
        title: node.title ?? fallbackLink.title,
        url: normalizeUrl(node.url ?? fallbackLink.url),
        sublinks: mergeSublinks(fallbackLink, matched),
      } as MenuLink;
    });

    for (const incomingLink of incomingLinks) {
      if (!merged.some((item) => isSameNode(item, incomingLink))) {
        merged.push({
          id: incomingLink.id,
          title: incomingLink.title,
          url: normalizeUrl(incomingLink.url),
          sublinks: Array.isArray(incomingLink.sublinks)
            ? incomingLink.sublinks.map((sub) => ({ ...sub, url: normalizeUrl(sub.url) }))
            : [],
        } as MenuLink);
      }
    }

    return merged;
  };

  const fallbackSections = getDefaultMenu(locale);
  const incomingSections = Array.isArray(menu) ? menu : [];

  const mergedSections = fallbackSections.map((fallbackSection) => {
    const matched = incomingSections.find((item) => isSameNode(item, fallbackSection));
    const node = matched ?? fallbackSection;
    return {
      id: node.id ?? fallbackSection.id,
      title: node.title ?? fallbackSection.title,
      url: normalizeUrl(node.url ?? fallbackSection.url),
      links: mergeLinks(fallbackSection, matched),
    };
  });

  for (const incomingSection of incomingSections) {
    if (!mergedSections.some((section) => isSameNode(section, incomingSection))) {
      mergedSections.push({
        id: incomingSection.id,
        title: incomingSection.title,
        url: normalizeUrl(incomingSection.url),
        links: Array.isArray(incomingSection.links)
          ? incomingSection.links.map((link) => ({
              id: link.id,
              title: link.title,
              url: normalizeUrl(link.url),
              sublinks: Array.isArray(link.sublinks)
                ? link.sublinks.map((sub) => ({ ...sub, url: normalizeUrl(sub.url) }))
                : [],
            }))
          : [],
      });
    }
  }

  return mergedSections;
}
