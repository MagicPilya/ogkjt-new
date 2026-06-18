import { defaultLocale, type Locale } from "../i18n";
import { fetchAPI } from "./fetch-api";
import type { Article, StrapiResponse } from "./types";

const SPPS_SOCIAL_REVALIDATE_SECONDS = 30;

export async function getSppsSocial(page = 1, pageSize = 10, locale?: Locale) {
  void locale;
  const params: Record<string, string> = {
    status: "published",
    populate: "*",
    "sort[0]": "date:desc",
    "sort[1]": "createdAt:desc",
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
    locale: defaultLocale,
  };

  const data = await fetchAPI<StrapiResponse<Article[]>>("/spps-social-items", params, {
    next: { revalidate: SPPS_SOCIAL_REVALIDATE_SECONDS },
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

export async function getSppsSocialBySlugOrDocumentId(identifier: string, locale?: Locale) {
  const params: Record<string, string> = {
    status: "published",
    populate: "*",
    "filters[$or][0][slug][$eq]": identifier,
    "filters[$or][1][documentId][$eq]": identifier,
  };
  if (locale) params.locale = locale;

  const data = await fetchAPI<StrapiResponse<Article[]>>("/spps-social-items", params, {
    next: { revalidate: SPPS_SOCIAL_REVALIDATE_SECONDS },
  });

  if (!data || !Array.isArray(data.data)) {
    return null;
  }

  return data.data[0] || null;
}
