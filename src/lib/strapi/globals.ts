import type { Locale } from "../i18n";
import { fetchAPI } from "./fetch-api";
import type { AnnualSymbol, GlobalSettings, MenuData, StrapiResponse } from "./types";

export async function getGlobalSettings(locale?: Locale) {
  const params: Record<string, string> = {
    status: "published",
    "populate[resources]": "*",
  };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<GlobalSettings>>("/global", params, { cache: "no-store" });
  if (!data || !data.data) return null;
  return data.data;
}

export async function getMenu(locale?: Locale) {
  const params: Record<string, string> = {
    status: "published",
    "populate[mainMenu][populate][links][populate]": "*",
  };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<MenuData>>("/menu", params, { cache: "no-store" });
  if (!data || !data.data) return null;
  return data.data;
}

export async function getAnnualSymbol(locale?: Locale): Promise<AnnualSymbol | null> {
  const params: Record<string, string> = {
    status: "published",
    populate: "*",
  };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<AnnualSymbol>>("/annual-symbol", params, { cache: "no-store" });
  if (!data || !data.data) return null;
  return data.data;
}
