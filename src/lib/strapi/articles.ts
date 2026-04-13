import { defaultLocale, type Locale } from "../i18n";
import { fetchAPI } from "./fetch-api";
import type { Article, StrapiResponse } from "./types";

const ARTICLE_REVALIDATE_SECONDS = 30;

export async function getArticles(page = 1, pageSize = 10, sectionUrl?: string | null, locale?: Locale) {
  void locale;
  void sectionUrl;
  const params: Record<string, string> = {
    status: "published",
    populate: "*",
    "sort[0]": "date:desc",
    "sort[1]": "createdAt:desc",
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
  };
  params.locale = defaultLocale;
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
