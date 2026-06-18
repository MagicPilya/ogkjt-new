import type { Locale } from "./i18n";
import {
  getSppsPsy,
  getSppsPsyBySlugOrDocumentId,
  getSppsSocial,
  getSppsSocialBySlugOrDocumentId,
  type Article,
} from "./strapi";

export type SppsSectionKey = "psy" | "social";

const SITE_PATHS: Record<SppsSectionKey, string> = {
  psy: "ideology/spps/psy",
  social: "ideology/spps/social",
};

export function isSppsSectionKey(value: string): value is SppsSectionKey {
  return value in SITE_PATHS;
}

type ArticlesListResponse = {
  data: Article[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export interface SppsSectionConfig {
  path: string;
  defaultTitle: Record<Locale, string>;
  paginationAria: Record<Locale, string>;
  prevLabel: Record<Locale, string>;
  nextLabel: Record<Locale, string>;
  backLabel: Record<Locale, string>;
  getItems: (page: number, pageSize: number, locale?: Locale) => Promise<ArticlesListResponse>;
  getBySlug: (slug: string, locale?: Locale) => Promise<Article | null>;
}

export const sppsSections: Record<SppsSectionKey, SppsSectionConfig> = {
  psy: {
    path: SITE_PATHS.psy,
    defaultTitle: {
      ru: "Педагог-психолог",
      be: "Педагог-псіхолаг",
      en: "Educational psychologist",
    },
    paginationAria: {
      ru: "Пагинация материалов педагога-психолога",
      be: "Пагінацыя матэрыялаў педагога-псіхалага",
      en: "Educational psychologist materials pagination",
    },
    prevLabel: { ru: "Назад", be: "Назад", en: "Previous" },
    nextLabel: { ru: "Вперед", be: "Наперад", en: "Next" },
    backLabel: {
      ru: "Назад к материалам",
      be: "Назад да матэрыялаў",
      en: "Back to materials",
    },
    getItems: getSppsPsy,
    getBySlug: getSppsPsyBySlugOrDocumentId,
  },
  social: {
    path: SITE_PATHS.social,
    defaultTitle: {
      ru: "Педагог социальный",
      be: "Сацыяльны педагог",
      en: "Social educator",
    },
    paginationAria: {
      ru: "Пагинация материалов социального педагога",
      be: "Пагінацыя матэрыялаў сацыяльнага педагога",
      en: "Social educator materials pagination",
    },
    prevLabel: { ru: "Назад", be: "Назад", en: "Previous" },
    nextLabel: { ru: "Вперед", be: "Наперад", en: "Next" },
    backLabel: {
      ru: "Назад к материалам",
      be: "Назад да матэрыялаў",
      en: "Back to materials",
    },
    getItems: getSppsSocial,
    getBySlug: getSppsSocialBySlugOrDocumentId,
  },
};

export function getSppsSectionConfig(section: string): SppsSectionConfig | null {
  return isSppsSectionKey(section) ? sppsSections[section] : null;
}
