import type { Locale } from "../i18n";
import { fetchAPI } from "./fetch-api";
import type { Page, StrapiResponse } from "./types";

const PAGE_REVALIDATE_SECONDS = 120;

export async function getPageByPath(path: string, locale?: Locale) {
  const pathNorm = path.replace(/^\//, "").trim();
  const pageUrlWithSlash = pathNorm ? `/${pathNorm}` : "/";
  const params: Record<string, string> = {
    status: "published",
    "filters[pageUrl][$eq]": pageUrlWithSlash,
    populate: "*",
  };
  if (locale) params.locale = locale;

  let data = await fetchAPI<StrapiResponse<Page[]>>("/pages", params, {
    next: { revalidate: PAGE_REVALIDATE_SECONDS },
  });

  if ((!data || !Array.isArray(data.data) || data.data.length === 0) && pathNorm) {
    params["filters[pageUrl][$eq]"] = pathNorm;
    data = await fetchAPI<StrapiResponse<Page[]>>("/pages", params, {
      next: { revalidate: PAGE_REVALIDATE_SECONDS },
    });
  }

  if (!data || !Array.isArray(data.data)) return null;
  return data.data[0] || null;
}

/** @deprecated Используйте getPageByPath(path, locale) */
export async function getPageBySlug(slug: string, locale?: Locale) {
  return getPageByPath(slug, locale);
}
