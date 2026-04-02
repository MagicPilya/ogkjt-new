import type { Locale } from "../i18n";
import { fetchAPI } from "./fetch-api";
import type { AnnualSymbol, GlobalSettings, MenuData, StrapiResponse } from "./types";

const STATIC_REVALIDATE_SECONDS = 300;

export async function getGlobalSettings(locale?: Locale) {
  const params: Record<string, string> = {
    status: "published",
    "populate[resources]": "*",
  };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<GlobalSettings>>("/global", params, {
    next: { revalidate: STATIC_REVALIDATE_SECONDS },
  });
  if (!data || !data.data) return null;
  return data.data;
}

export async function getMenu(locale?: Locale) {
  const params: Record<string, string> = {
    status: "published",
    "populate[mainMenu][populate][links][populate]": "*",
    "populate[footerResources]": "*",
  };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<MenuData>>("/menu", params);
  if (!data || !data.data) return null;
  return data.data;
}

export async function getAnnualSymbol(locale?: Locale): Promise<AnnualSymbol | null> {
  const params: Record<string, string> = {
    status: "published",
    populate: "*",
  };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<AnnualSymbol>>("/annual-symbol", params, {
    next: { revalidate: STATIC_REVALIDATE_SECONDS },
  });
  if (!data || !data.data) return null;
  return data.data;
}
