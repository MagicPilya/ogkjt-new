import { NextRequest, NextResponse } from "next/server";
import { STRAPI_URL } from "@/lib/config";

export interface SearchResultItem {
  type: "article" | "page";
  id: number;
  title: string;
  url: string;
  snippet?: string;
}

function normalizeStrapiUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

/** Извлекает плоский текст из Strapi Blocks для поиска. Пробелы между блоками и узлами сохраняются, чтобы текст оставался читаемым. */
function extractTextFromBlocks(blocks: unknown): string {
  if (!blocks || !Array.isArray(blocks)) return "";
  const parts: string[] = [];
  for (const block of blocks) {
    const b = block as { children?: Array<{ text?: string; children?: Array<{ text?: string }> }> };
    if (b.children) {
      for (const child of b.children) {
        if (child.text) parts.push(child.text.trim());
        if (child.children) {
          for (const c of child.children) if (c.text) parts.push(c.text.trim());
        }
      }
    }
  }
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
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
    next: { revalidate: 0 },
  });
  if (!res.ok) return { data: [] };
  const json = await res.json();
  const data = Array.isArray(json.data) ? json.data : [];
  return { data };
}

const SEARCH_PAGE_SIZE = 80;
const MAX_RESULTS_PER_TYPE = 10;
/** Символов контекста до и после совпадения в сниппете */
const SNIPPET_CONTEXT = 55;
const SNIPPET_MAX_LENGTH = 180;

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

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (rawQuery.length < 2) {
    return NextResponse.json({ results: [] });
  }
  const qLower = rawQuery.toLowerCase();
  const results: SearchResultItem[] = [];

  // Загружаем статьи и страницы с контентом, фильтруем по нашему запросу (регистронезависимо, включая контент)
  const [articlesRes, pagesRes] = await Promise.all([
    fetchStrapi<ArticleRow>("/articles", {
      status: "published",
      populate: "*",
      "pagination[pageSize]": String(SEARCH_PAGE_SIZE),
      sort: "createdAt:desc",
    }),
    fetchStrapi<PageRow>("/pages", {
      status: "published",
      populate: "*",
      "pagination[pageSize]": String(SEARCH_PAGE_SIZE),
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

  return NextResponse.json({ results });
}
