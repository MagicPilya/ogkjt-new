import { defaultLocale, type Locale } from "../i18n";
import { fetchAPI } from "./fetch-api";
import type { Administration, AdmissionDocuments, Specialties } from "./types";

export async function getAdministration(locale?: Locale): Promise<Administration | null> {
  const params: Record<string, string> = { status: "published", populate: "*" };
  if (locale) params.locale = locale;
  const data = await fetchAPI<{ data: Administration }>("/administration", params, { cache: "no-store" });
  if (!data?.data) return null;
  return data.data;
}

export async function getSpecialties(locale?: Locale): Promise<Specialties | null> {
  const params: Record<string, string> = { status: "published", populate: "*" };
  if (locale) params.locale = locale;
  const data = await fetchAPI<{ data: Specialties }>("/specialty", params, { cache: "no-store" });
  if (!data?.data) return null;
  return data.data;
}

export async function getAdmissionDocuments(locale?: Locale): Promise<AdmissionDocuments | null> {
  const params: Record<string, string> = { status: "published", populate: "*" };
  if (locale) params.locale = locale;
  let data = await fetchAPI<{ data: AdmissionDocuments }>("/admission-document", params, { cache: "no-store" });

  if (!data?.data && locale && locale !== defaultLocale) {
    const fallbackParams: Record<string, string> = {
      status: "published",
      populate: "*",
      locale: defaultLocale,
    };
    data = await fetchAPI<{ data: AdmissionDocuments }>("/admission-document", fallbackParams, { cache: "no-store" });
  }

  if (!data?.data) return null;
  return data.data;
}
