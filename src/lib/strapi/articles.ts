import { defaultLocale, type Locale } from "../i18n";
import { fetchAPI } from "./fetch-api";
import type { Article, StrapiResponse } from "./types";
import { SECTION_URL_TO_STRAPI } from "./types";

const ARTICLE_REVALIDATE_SECONDS = 30;

function toSectionValueForFilter(sectionUrlOrStrapiValue: string): string {
  if (sectionUrlOrStrapiValue.startsWith("/")) {
    return SECTION_URL_TO_STRAPI[sectionUrlOrStrapiValue] ?? sectionUrlOrStrapiValue;
  }
  return sectionUrlOrStrapiValue;
}

export async function getArticles(page = 1, pageSize = 10, sectionUrl?: string | null, locale?: Locale) {
  void locale;
  const params: Record<string, string> = {
    status: "published",
    populate: "*",
    "sort[0]": "date:desc",
    "sort[1]": "createdAt:desc",
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
  };
  params.locale = defaultLocale;
  if (sectionUrl) {
    const sectionValue = toSectionValueForFilter(sectionUrl);
    const isMainNews = sectionValue === "НОВОСТИ КОЛЛЕДЖА";
    if (isMainNews) {
      params["filters[$or][0][sectionUrl][$eq]"] = sectionValue;
      params["filters[$or][1][sectionUrl][$null]"] = "true";
    } else {
      params["filters[sectionUrl][$eq]"] = sectionValue;
    }
  }
  const data = await fetchAPI<StrapiResponse<Article[]>>("/articles", params, {
    next: { revalidate: ARTICLE_REVALIDATE_SECONDS },
  });

  if (!data || !Array.isArray(data.data)) {
    return {
      data: [],
      meta: {
        pagination: {
          page: 1,
          pageSize,
          pageCount: 0,
          total: 0,
        },
      },
    };
  }

  return data;
}

export async function getArticleBySlug(slug: string, locale?: Locale) {
  const params: Record<string, string> = {
    status: "published",
    "filters[slug][$eq]": slug,
    populate: "*",
  };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<Article[]>>("/articles", params, {
    next: { revalidate: ARTICLE_REVALIDATE_SECONDS },
  });

  if (!data || !Array.isArray(data.data)) {
    return null;
  }

  return data.data[0] || null;
}

export async function getArticleBySlugOrDocumentId(identifier: string, locale?: Locale) {
  const params: Record<string, string> = {
    status: "published",
    populate: "*",
    "filters[$or][0][slug][$eq]": identifier,
    "filters[$or][1][documentId][$eq]": identifier,
  };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<Article[]>>("/articles", params, {
    next: { revalidate: ARTICLE_REVALIDATE_SECONDS },
  });

  if (!data || !Array.isArray(data.data)) {
    return null;
  }

  return data.data[0] || null;
}
