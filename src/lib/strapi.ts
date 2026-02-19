import { getStrapiURL } from "./utils";
import type { Locale } from "./i18n";

/** Соответствие URL раздела и значения enum в Strapi (Место размещения / Раздел ленты). */
export const SECTION_URL_TO_STRAPI: Record<string, string> = {
  "/news": "НОВОСТИ КОЛЛЕДЖА",
  "/students/dormitory": "НОВОСТИ ОБЩЕЖИТИЯ",
  "/about": "О колледже",
  "/applicants": "Абитуриентам",
  "/students": "Обучающимся",
  "/ideology": "Воспитательная работа",
  "/one-window": "Одно окно",
  "/appeals": "Электронные обращения",
};

/** Приводит URL раздела или значение из Strapi к значению для фильтра API. */
function toSectionValueForFilter(sectionUrlOrStrapiValue: string): string {
  if (sectionUrlOrStrapiValue.startsWith("/")) {
    return SECTION_URL_TO_STRAPI[sectionUrlOrStrapiValue] ?? sectionUrlOrStrapiValue;
  }
  return sectionUrlOrStrapiValue;
}

interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface StrapiImage {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  name?: string | null;
}

export interface Event {
  id: number;
  documentId: string;
  title: string;
  date: string;
  location?: string | null;
  description?: any;
  file?: StrapiImage | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  announcement: string;
  content: any[]; // Blocks content
  date: string;
  cover: StrapiImage | null;
  sectionUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Page {
  id: number;
  documentId: string;
  pageUrl: string;
  title: string;
  metaDescription?: string | null;
  content: any[];
  /** Раздел ленты новостей на странице или "Не показывать" */
  articleFeedSection?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}

/** Один сотрудник из блока «Администрация» (single type) */
export interface AdministrationMember {
  id?: number;
  documentId?: string;
  fullName: string;
  position: string;
  contacts?: string | null;
  photo?: StrapiImage | null;
}

/** Single type «Администрация» — список сотрудников для страницы О колледже → Администрация */
export interface Administration {
  id?: number;
  documentId?: string;
  members?: AdministrationMember[] | null;
}

/** Одна специализация: название и шифр */
export interface SpecializationItem {
  name: string;
  code: string;
}

/** Один пункт перечисления профессий рабочего */
export interface WorkerProfession {
  title: string;
}

/** Одна специальность: название, шифр, специализации, квалификация, профессии рабочего */
export interface SpecialtyItem {
  name: string;
  code: string;
  specializations?: SpecializationItem[] | null;
  qualification?: string | null;
  workerProfessions?: WorkerProfession[] | null;
}

/** Single type «Специальности» — список специальностей для страницы Абитуриентам → Специальности */
export interface Specialties {
  id?: number;
  documentId?: string;
  items?: SpecialtyItem[] | null;
}

/** Пункт 3-го уровня меню (без вложенности). */
export interface MenuSublink {
  id: number;
  title: string;
  url: string;
}

export interface MenuLink {
  id: number;
  title: string;
  url: string;
  sublinks?: MenuSublink[];
}

export interface MenuSection {
  id: number;
  title: string;
  url: string | null;
  links: MenuLink[];
}

export interface GlobalSettings {
  id: number;
  documentId: string;
  address: string;
  phoneReception: string;
  phoneDirector: string;
  email: string;
  instagramLink: string | null;
  telegramLink: string | null;
  tiktokLink: string | null;
  vkLink: string | null;
}

export interface MenuData {
  id: number;
  documentId: string;
  mainMenu: MenuSection[];
}

/**
 * Глобальные настройки (контакты, соцсети). Меню — отдельно через getMenu().
 */
export async function getGlobalSettings(locale?: Locale) {
  const params: Record<string, string> = { status: "published" };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<GlobalSettings>>(
    "/global",
    params,
    { cache: "no-store" }
  );
  if (!data || !data.data) return null;
  return data.data;
}

/**
 * Главное меню сайта (одиночный тип «Меню» в Strapi).
 */
export async function getMenu(locale?: Locale) {
  const params: Record<string, string> = {
    status: "published",
    "populate[mainMenu][populate][links][populate]": "*",
  };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<MenuData>>(
    "/menu",
    params,
    { cache: "no-store" }
  );
  if (!data || !data.data) return null;
  return data.data;
}

/**
 * Страница по пути (например "news", "about/administration").
 * Заголовок и путь берутся из меню; в админке задаётся только выбор «Страница» и контент.
 * Ищем по полному URL (с ведущим слэшем); при отсутствии — пробуем без слэша (на случай иного формата в Strapi).
 */
export async function getPageByPath(path: string, locale?: Locale) {
  const pathNorm = path.replace(/^\//, "").trim();
  const pageUrlWithSlash = pathNorm ? `/${pathNorm}` : "/";
  const params: Record<string, string> = {
    status: "published",
    "filters[pageUrl][$eq]": pageUrlWithSlash,
    "populate": "*",
  };
  if (locale) params.locale = locale;

  let data = await fetchAPI<StrapiResponse<Page[]>>("/pages", params, { cache: "no-store" });

  if ((!data || !Array.isArray(data.data) || data.data.length === 0) && pathNorm) {
    params["filters[pageUrl][$eq]"] = pathNorm;
    data = await fetchAPI<StrapiResponse<Page[]>>("/pages", params, { cache: "no-store" });
  }

  if (!data || !Array.isArray(data.data)) return null;
  return data.data[0] || null;
}

/** @deprecated Используйте getPageByPath(path, locale) */
export async function getPageBySlug(slug: string, locale?: Locale) {
  return getPageByPath(slug, locale);
}

/**
 * Данные блока «Администрация» (single type): список сотрудников с ФИО, должностью, контактами, фото.
 * Используется на странице /about/administration.
 */
export async function getAdministration(locale?: Locale): Promise<Administration | null> {
  const params: Record<string, string> = { status: "published", "populate": "*" };
  if (locale) params.locale = locale;
  const data = await fetchAPI<{ data: Administration }>(
    "/administration",
    params,
    { cache: "no-store" }
  );
  if (!data?.data) return null;
  return data.data;
}

/**
 * Данные блока «Специальности» (single type): список специальностей с названием, шифром,
 * специализациями, квалификацией и профессиями рабочего. Используется на странице /applicants/specialties.
 */
export async function getSpecialties(locale?: Locale): Promise<Specialties | null> {
  const params: Record<string, string> = { status: "published", "populate": "*" };
  if (locale) params.locale = locale;
  const data = await fetchAPI<{ data: Specialties }>(
    "/specialty",
    params,
    { cache: "no-store" }
  );
  if (!data?.data) return null;
  return data.data;
}

async function fetchAPI<T>(path: string, urlParamsObject = {}, options = {}) {
  if (!getStrapiURL()) {
    return {} as T;
  }
  try {
    const requestedLocale = urlParamsObject && typeof urlParamsObject === "object" && "locale" in urlParamsObject
      ? (urlParamsObject as { locale?: string }).locale
      : undefined;

    const queryString = new URLSearchParams(urlParamsObject).toString();
    const requestUrl = `${getStrapiURL()}/api${path}${queryString ? `?${queryString}` : ""}`;

    const mergedOptions = {
      cache: "no-store" as RequestCache,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache",
        "Pragma": "no-cache",
      },
      ...options,
    };

    if (process.env.NODE_ENV === "development" && requestedLocale !== undefined) {
      console.log("[Strapi] Запрос:", path, "| locale =", requestedLocale);
    }

    const response = await fetch(requestUrl, mergedOptions);
    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[Strapi] ${response.status} ${response.statusText}: ${requestUrl.replace(/\?.*/, "")}`
        );
      }
      return {} as T;
    }
    const data = await response.json();

    if (process.env.NODE_ENV === "development" && requestedLocale !== undefined) {
      const resLocale = (data as { data?: { locale?: string } | Array<{ locale?: string }> })?.data != null
        ? (Array.isArray((data as { data: unknown }).data)
          ? (data as { data: Array<{ locale?: string }> }).data[0]?.locale
          : (data as { data: { locale?: string } }).data?.locale)
        : undefined;
      if (resLocale !== undefined && resLocale !== requestedLocale) {
        console.warn("[Strapi] В ответе другая локаль: запрашивали", requestedLocale, ", пришло", resLocale, "|", path);
      }
    }
    return data as T;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Strapi] Запрос не выполнен (сеть/URL):", getStrapiURL() + path);
    }
    return {} as T;
  }
}

/**
 * Get all articles (news), optionally filtered by section URL for section feeds.
 * Для раздела «Новости колледжа» в выборку попадают и статьи без раздела (sectionUrl = null),
 * чтобы отображались существующие новости, у которых раздел не задан.
 */
export async function getArticles(
  page = 1,
  pageSize = 10,
  sectionUrl?: string | null,
  locale?: Locale
) {
  const params: Record<string, string> = {
    status: "published",
    "populate": "*",
    "sort": "createdAt:desc",
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
  };
  if (locale) params.locale = locale;
  if (sectionUrl) {
    const sectionValue = toSectionValueForFilter(sectionUrl);
    const isMainNews = sectionValue === "НОВОСТИ КОЛЛЕДЖА";
    if (isMainNews) {
      // На главной ленте новостей показываем и статьи без раздела (sectionUrl = null)
      params["filters[$or][0][sectionUrl][$eq]"] = sectionValue;
      params["filters[$or][1][sectionUrl][$null]"] = "true";
    } else {
      params["filters[sectionUrl][$eq]"] = sectionValue;
    }
  }
  const data = await fetchAPI<StrapiResponse<Article[]>>("/articles", params, {
    cache: "no-store",
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

/**
 * Get single article by slug
 */
export async function getArticleBySlug(slug: string, locale?: Locale) {
  const params: Record<string, string> = {
    status: "published",
    "filters[slug][$eq]": slug,
    "populate": "*",
  };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<Article[]>>("/articles", params, {
    cache: "no-store",
  });

  if (!data || !Array.isArray(data.data)) {
    return null;
  }

  return data.data[0] || null;
}

/**
 * Get upcoming events
 */
export async function getEvents(limit = 3, locale?: Locale) {
  const now = new Date().toISOString();
  const params: Record<string, string> = {
    status: "published",
    "populate": "*",
    "sort": "date:asc",
    "filters[date][$gte]": now,
    "pagination[pageSize]": String(limit),
  };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<Event[]>>("/events", params, {
    cache: "no-store",
  });

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

/**
 * Get events in a date range (for calendar: e.g. month)
 */
export async function getEventsInRange(start: Date, end: Date, locale?: Locale) {
  const params: Record<string, string> = {
    status: "published",
    "populate": "*",
    "sort": "date:asc",
    "filters[date][$gte]": start.toISOString(),
    "filters[date][$lte]": end.toISOString(),
    "pagination[pageSize]": "100",
  };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<Event[]>>("/events", params, {
    cache: "no-store",
  });

  if (!data || !Array.isArray(data.data)) {
    return { data: [] };
  }
  return data;
}

/**
 * Get single event by id
 *
 * Используем список с фильтром по id, чтобы не зависеть
 * от маршрута /events/:id (который у тебя даёт 404).
 */
export async function getEventById(id: number | string, locale?: Locale) {
  const params: Record<string, string> = {
    status: "published",
    "filters[id][$eq]": String(id),
    populate: "*",
  };
  if (locale) params.locale = locale;
  const data = await fetchAPI<StrapiResponse<Event[]>>(
    "/events",
    params,
    { cache: "no-store" }
  );

  if (!data || !Array.isArray(data.data)) {
    return null;
  }

  return data.data[0] || null;
}

