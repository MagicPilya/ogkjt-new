import { defaultLocale, type Locale } from "../i18n";
import { fetchAPI } from "./fetch-api";
import type { Event, StrapiResponse } from "./types";

export async function getEvents(limit = 3, locale?: Locale) {
  void locale;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const params: Record<string, string> = {
    status: "published",
    populate: "*",
    sort: "date:asc",
    "filters[date][$gte]": startOfToday.toISOString(),
    "pagination[pageSize]": String(limit),
  };
  params.locale = defaultLocale;
  const data = await fetchAPI<StrapiResponse<Event[]>>("/events", params, { cache: "no-store" });
  if (!data || !Array.isArray(data.data)) {
    return {
      data: [],
      meta: {
        pagination: {
          page: 1,
          pageSize: limit,
          pageCount: 0,
          total: 0,
        },
      },
    };
  }
  return data;
}

export async function getEventsInRange(start: Date, end: Date, locale?: Locale) {
  void locale;
  const params: Record<string, string> = {
    status: "published",
    populate: "*",
    sort: "date:asc",
    "filters[date][$gte]": start.toISOString(),
    "filters[date][$lte]": end.toISOString(),
    "pagination[pageSize]": "100",
  };
  params.locale = defaultLocale;
  const data = await fetchAPI<StrapiResponse<Event[]>>("/events", params, { cache: "no-store" });

  if (!data || !Array.isArray(data.data)) {
    return { data: [] };
  }
  return data;
}

export async function getEventById(id: number | string, locale?: Locale) {
  void locale;
  const params: Record<string, string> = {
    status: "published",
    "filters[id][$eq]": String(id),
    populate: "*",
  };
  params.locale = defaultLocale;
  const data = await fetchAPI<StrapiResponse<Event[]>>("/events", params, { cache: "no-store" });

  if (!data || !Array.isArray(data.data)) {
    return null;
  }

  return data.data[0] || null;
}
