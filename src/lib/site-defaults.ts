import type { Locale } from "./i18n";

/**
 * Значения по умолчанию для контактов и брендинга сайта.
 * Используются, когда Strapi недоступен или не настроен.
 */
export const siteDefaults = {
  address: "г. Орша, ул. Ленина, 1",
  phoneReception: "+375 (216) 51-23-45",
  phoneDirector: "" as string | undefined,
  email: "info@ogkjt.by",
} as const;

export const collegeNamesFallback: Record<
  Locale,
  {
    full: string;
    short: string;
    main: string;
    branchShort: string;
    heroBranchWord: string;
    university: string;
  }
> = {
  ru: {
    full: "Оршанский колледж - филиал учреждения образования «Белорусский государственный университет транспорта»",
    short: "Оршанский колледж - филиал БелГУТа",
    main: "Оршанский колледж",
    branchShort: "филиал БелГУТа",
    heroBranchWord: "филиал",
    university: "Белорусский государственный университет транспорта",
  },
  be: {
    full: "Аршанскі каледж - філіял установы адукацыі «Беларускі дзяржаўны ўніверсітэт транспарту»",
    short: "Аршанскі каледж - філіял БелДУТа",
    main: "Аршанскі каледж",
    branchShort: "філіял БелДУТа",
    heroBranchWord: "філіял",
    university: "Беларускі дзяржаўны ўніверсітэт транспарту",
  },
  en: {
    full: "Orsha College - branch of Belarusian State University of Transport",
    short: "Orsha College - branch of BSUT",
    main: "Orsha College",
    branchShort: "branch of BSUT",
    heroBranchWord: "branch",
    university: "Belarusian State University of Transport",
  },
};
