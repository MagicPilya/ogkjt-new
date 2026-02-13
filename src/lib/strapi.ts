import { getStrapiURL } from "./utils";

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
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Page {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: any[]; // Strapi blocks
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}

export interface MenuLink {
  id: number;
  title: string;
  url: string;
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
  mainMenu: MenuSection[];
  address: string;
  phoneReception: string;
  phoneDirector: string;
  email: string;
  instagramLink: string | null;
  telegramLink: string | null;
  tiktokLink: string | null;
}

// ...

/**
 * Get global settings (menu, etc)
 */
export async function getGlobalSettings() {
  const data = await fetchAPI<StrapiResponse<GlobalSettings>>(
    "/global",
    {
      "populate[mainMenu][populate]": "*",
    },
    {
      next: { revalidate: 60 },
    }
  );

  if (!data || !data.data) {
    return null;
  }

  return data.data;
}

export async function getPageBySlug(slug: string) {
  const data = await fetchAPI<StrapiResponse<Page[]>>(
    "/pages",
    {
      "filters[slug][$eq]": slug,
    },
    {
      next: { revalidate: 60 },
    }
  );

  if (!data || !Array.isArray(data.data)) {
    return null;
  }

  return data.data[0] || null;
}

async function fetchAPI<T>(path: string, urlParamsObject = {}, options = {}) {
  if (!getStrapiURL()) {
    return {} as T;
  }
  try {
    const mergedOptions = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    const queryString = new URLSearchParams(urlParamsObject).toString();
    const requestUrl = `${getStrapiURL()}/api${path}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(requestUrl, mergedOptions);
    const data = await response.json();

    return data as T;
  } catch (error) {
    console.error(error);
    return {} as T;
  }
}

/**
 * Get all articles (news)
 */
export async function getArticles(page = 1, pageSize = 10) {
  const data = await fetchAPI<StrapiResponse<Article[]>>("/articles", {
    "populate": "*",
    "sort": "createdAt:desc", // Сортируем по дате создания пока что
    // "publicationState": "preview", // Раскомментируйте для отладки, если нужно видеть черновики
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
  }, {
     // Новости должны обновляться сразу после публикации
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
export async function getArticleBySlug(slug: string) {
  const data = await fetchAPI<StrapiResponse<Article[]>>("/articles", {
    "filters[slug][$eq]": slug,
    "populate": "*",
  }, {
    // Детальная страница новости тоже без кеша
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
export async function getEvents(limit = 3) {
  const now = new Date().toISOString();
  
  const data = await fetchAPI<StrapiResponse<Event[]>>("/events", {
    "populate": "*",
    "sort": "date:asc",
    "filters[date][$gte]": now, // Only future events
    "pagination[pageSize]": String(limit),
  }, {
    next: { revalidate: 60 }
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
 * Get single event by id
 *
 * Используем список с фильтром по id, чтобы не зависеть
 * от маршрута /events/:id (который у тебя даёт 404).
 */
export async function getEventById(id: number | string) {
  const data = await fetchAPI<StrapiResponse<Event[]>>(
    "/events",
    {
      "filters[id][$eq]": String(id),
      populate: "*",
    },
    {
      next: { revalidate: 60 },
    }
  );

  if (!data || !Array.isArray(data.data)) {
    return null;
  }

  return data.data[0] || null;
}

