import { NextRequest, NextResponse } from "next/server";
import { STRAPI_URL } from "@/lib/config";
import { defaultLocale, isValidLocale, type Locale } from "@/lib/i18n";
import { extractTextFromBlocks } from "@/lib/blocks-text";
import { normalizeStrapiUrl } from "@/lib/normalize-strapi-url";

export interface SearchResultItem {
  type: "article" | "page" | "administration" | "specialty";
  id: number | string;
  title: string;
  url: string;
  snippet?: string;
}

async function fetchStrapi<T>(
  path: string,
  params: Record<string, string>
): Promise<{ data: T[] }> {
  const base = normalizeStrapiUrl(STRAPI_URL || "");
  if (!base) return { data: [] };
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${base}/api${path}${query ? `?${query}` : ""}`, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: SEARCH_REVALIDATE_SECONDS },
  });
  if (!res.ok) return { data: [] };
  const json = await res.json();
  const data = Array.isArray(json.data) ? json.data : [];
  return { data };
}

/** Single-type API (administration, specialty) возвращает один объект в data. */
async function fetchStrapiSingle<T>(
  path: string,
  params: Record<string, string>
): Promise<T | null> {
  const base = normalizeStrapiUrl(STRAPI_URL || "");
  if (!base) return null;
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${base}/api${path}${query ? `?${query}` : ""}`, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: SEARCH_REVALIDATE_SECONDS },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

const SEARCH_PAGE_SIZE = 80;
const MAX_RESULTS_PER_TYPE = 10;
/** Символов контекста до и после совпадения в сниппете */
const SNIPPET_CONTEXT = 55;
const SNIPPET_MAX_LENGTH = 180;
const SEARCH_REVALIDATE_SECONDS = 30;

type ArticleRow = {
  id: number;
  title: string;
  slug: string;
  announcement?: string | null;
  content?: unknown;
};

type PageRow = {
  id: number;
  title: string;
  pageUrl: string;
  metaDescription?: string | null;
  content?: unknown;
};

type AdministrationMemberRow = {
  id?: number;
  documentId?: string;
  fullName: string;
  position: string;
  contacts?: string | null;
};

type AdministrationRow = {
  id?: number;
  members?: AdministrationMemberRow[] | null;
};

type SpecializationRow = { name: string; code: string };
type WorkerProfessionRow = { title: string };
type SpecialtyItemRow = {
  name: string;
  code: string;
  specializations?: SpecializationRow[] | null;
  qualification?: string | null;
  workerProfessions?: WorkerProfessionRow[] | null;
};
type SpecialtiesRow = {
  id?: number;
  items?: SpecialtyItemRow[] | null;
};

/**
 * Строит короткий отрывок вокруг первого вхождения запроса:
 * совпадение в начале — троеточие только в конце, в конце — только в начале, в середине — с обеих сторон.
 */
function buildExcerptAroundMatch(fullText: string, qLower: string): string {
  const lower = fullText.toLowerCase();
  const pos = lower.indexOf(qLower);
  if (pos === -1) return fullText.slice(0, SNIPPET_MAX_LENGTH).trim();
  const qLen = qLower.length;
  const start = Math.max(0, pos - SNIPPET_CONTEXT);
  const end = Math.min(fullText.length, pos + qLen + SNIPPET_CONTEXT);
  let excerpt = fullText.slice(start, end).trim();
  if (start > 0) excerpt = "… " + excerpt;
  if (end < fullText.length) excerpt = excerpt + " …";
  return excerpt;
}

function getArticleSearchableText(a: ArticleRow): string {
  return [a.title ?? "", a.announcement ?? "", extractTextFromBlocks(a.content)].join(" ");
}

function getPageSearchableText(p: PageRow): string {
  return [p.title ?? "", extractTextFromBlocks(p.content)].join(" ");
}

function getMemberSearchableText(m: AdministrationMemberRow): string {
  return [m.fullName ?? "", m.position ?? "", m.contacts ?? ""].join(" ");
}

function getSpecialtyItemSearchableText(s: SpecialtyItemRow): string {
  const parts = [s.name ?? "", s.code ?? "", s.qualification ?? ""];
  (s.specializations ?? []).forEach((sp) => {
    parts.push(sp.name, sp.code);
  });
  (s.workerProfessions ?? []).forEach((wp) => parts.push(wp.title));
  return parts.join(" ");
}

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const localeParam = request.nextUrl.searchParams.get("locale")?.trim() ?? "";
  const locale: Locale = isValidLocale(localeParam) ? localeParam : defaultLocale;
  if (rawQuery.length < 2) {
    return NextResponse.json({ results: [] });
  }
  const qLower = rawQuery.toLowerCase();
  const results: SearchResultItem[] = [];

  // Загружаем статьи, страницы, администрацию и специальности
  const [articlesRes, dormitoryNewsRes, pagesRes, administrationData, specialtiesData] = await Promise.all([
    fetchStrapi<ArticleRow>("/articles", {
      status: "published",
      locale,
      populate: "*",
      "pagination[pageSize]": String(SEARCH_PAGE_SIZE),
      sort: "createdAt:desc",
    }),
    fetchStrapi<ArticleRow>("/dormitory-news-items", {
      status: "published",
      locale,
      populate: "*",
      "pagination[pageSize]": String(SEARCH_PAGE_SIZE),
      sort: "createdAt:desc",
    }),
    fetchStrapi<PageRow>("/pages", {
      status: "published",
      locale,
      populate: "*",
      "pagination[pageSize]": String(SEARCH_PAGE_SIZE),
    }),
    fetchStrapiSingle<AdministrationRow>("/administration", {
      status: "published",
      locale,
      populate: "*",
    }),
    fetchStrapiSingle<SpecialtiesRow>("/specialty", {
      status: "published",
      locale,
      populate: "*",
    }),
  ]);

  let articleCount = 0;
  for (const a of articlesRes.data) {
    if (articleCount >= MAX_RESULTS_PER_TYPE) break;
    const searchable = getArticleSearchableText(a);
    if (!searchable.toLowerCase().includes(qLower)) continue;
    articleCount++;
    results.push({
      type: "article",
      id: a.id,
      title: a.title,
      url: `/news/${a.slug}`,
      snippet: buildExcerptAroundMatch(searchable, qLower) || undefined,
    });
  }

  for (const a of dormitoryNewsRes.data) {
    if (articleCount >= MAX_RESULTS_PER_TYPE) break;
    const searchable = getArticleSearchableText(a);
    if (!searchable.toLowerCase().includes(qLower)) continue;
    articleCount++;
    results.push({
      type: "article",
      id: `dormitory-${a.id}`,
      title: a.title,
      url: `/students/dormitory/news/${a.slug}`,
      snippet: buildExcerptAroundMatch(searchable, qLower) || undefined,
    });
  }

  let pageCount = 0;
  for (const p of pagesRes.data) {
    if (pageCount >= MAX_RESULTS_PER_TYPE) break;
    const searchable = getPageSearchableText(p);
    if (!searchable.toLowerCase().includes(qLower)) continue;
    pageCount++;
    const url = (p.pageUrl || "/").replace(/^\s*\//, "/") || "/";
    results.push({
      type: "page",
      id: p.id,
      title: p.title,
      url: url.startsWith("/") ? url : `/${url}`,
      snippet: buildExcerptAroundMatch(searchable, qLower) || undefined,
    });
  }

  const members = administrationData?.members ?? [];
  let memberCount = 0;
  for (let i = 0; i < members.length && memberCount < MAX_RESULTS_PER_TYPE; i++) {
    const m = members[i];
    const searchable = getMemberSearchableText(m);
    if (!searchable.toLowerCase().includes(qLower)) continue;
    memberCount++;
    results.push({
      type: "administration",
      id: m.documentId ?? `member-${i}`,
      title: m.fullName,
      url: "/about/administration",
      snippet: buildExcerptAroundMatch(searchable, qLower) || m.position || undefined,
    });
  }

  const specialtyItems = specialtiesData?.items ?? [];
  let specialtyCount = 0;
  for (let i = 0; i < specialtyItems.length && specialtyCount < MAX_RESULTS_PER_TYPE; i++) {
    const s = specialtyItems[i];
    const searchable = getSpecialtyItemSearchableText(s);
    if (!searchable.toLowerCase().includes(qLower)) continue;
    specialtyCount++;
    results.push({
      type: "specialty",
      id: s.code ?? `specialty-${i}`,
      title: s.name,
      url: "/applicants/specialties",
      snippet: buildExcerptAroundMatch(searchable, qLower) || `Шифр: ${s.code}`,
    });
  }

  return NextResponse.json({ results });
}
