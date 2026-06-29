/** Подразделы /ideology, которые обрабатываются через SectionPage, а не как статьи. */
export const IDEOLOGY_RESERVED_SLUGS = new Set(["spps", "youth-policy", "curator"]);

export const IDEOLOGY_PATH = "ideology";

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
