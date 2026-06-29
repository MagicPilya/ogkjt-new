import type { MenuSection } from "./strapi";

export const IDEOLOGY_PATH = "ideology";

/** Подраздел из меню «Воспитательная работа» (не статья ideology-item). */
export function isIdeologySubsectionSlug(slug: string, menu: MenuSection[]): boolean {
  const section = menu.find((item) => (item.url ?? "").replace(/^\//, "") === IDEOLOGY_PATH);
  if (!section?.links?.length) return false;

  const target = `${IDEOLOGY_PATH}/${slug.replace(/^\//, "")}`;
  return section.links.some((link) => (link.url ?? "").replace(/^\//, "").replace(/\/$/, "") === target);
}

export const ideologyLabels = {
  ru: {
    defaultTitle: "Воспитательная работа",
    pagination: "Пагинация материалов раздела «Воспитательная работа»",
    prev: "Назад",
    next: "Вперед",
    back: "Назад к материалам",
  },
  be: {
    defaultTitle: "Выхаваўчая работа",
    pagination: "Пагінацыя матэрыялаў раздзела «Выхаваўчая работа»",
    prev: "Назад",
    next: "Наперад",
    back: "Назад да матэрыялаў",
  },
  en: {
    defaultTitle: "Educational work",
    pagination: "Educational work materials pagination",
    prev: "Previous",
    next: "Next",
    back: "Back to materials",
  },
} as const;
