/**
 * Перевод статьи (title, announcement, content blocks) для отображения на другом языке.
 * Исходный контент предполагается на defaultLocale (ru).
 */
import type { Article } from "./strapi";
import type { Locale } from "./i18n";
import { defaultLocale } from "./i18n";
import { translateText, translateLongText } from "./translate";

const SEP = "\u200B\u200B\u200B";

type ContentBlock = {
  type?: string;
  text?: string;
  plainText?: string;
  children?: ContentBlock[];
  [key: string]: unknown;
};

/** Собирает все текстовые фрагменты из блоков в порядке обхода (рекурсия) */
function collectTexts(blocks: ContentBlock[]): string[] {
  const out: string[] = [];
  function walk(nodes: ContentBlock[] | undefined) {
    if (!nodes) return;
    for (const n of nodes) {
      if (typeof n.text === "string" && n.text.trim()) out.push(n.text);
      if (typeof n.plainText === "string" && n.plainText.trim()) out.push(n.plainText);
      walk(n.children);
    }
  }
  walk(blocks);
  return out;
}

/** Подставляет переведённые строки обратно в копию блоков (тот же порядок обхода) */
function fillTexts(blocks: ContentBlock[], translated: string[]): void {
  let i = 0;
  function walk(nodes: ContentBlock[] | undefined) {
    if (!nodes) return;
    for (const n of nodes) {
      if (typeof n.text === "string" && n.text.trim()) {
        if (translated[i] !== undefined) n.text = translated[i];
        i++;
      }
      if (typeof n.plainText === "string" && n.plainText.trim()) {
        if (translated[i] !== undefined) n.plainText = translated[i];
        i++;
      }
      walk(n.children);
    }
  }
  walk(blocks);
}

/** Глубокое копирование блоков контента */
function cloneBlocks(blocks: unknown[]): ContentBlock[] {
  return JSON.parse(JSON.stringify(blocks)) as ContentBlock[];
}

/**
 * Переводит статью с defaultLocale на targetLocale.
 * Возвращает новую статью (объект) с переведёнными title, announcement и content.
 */
export async function translateArticle(
  article: Article,
  targetLocale: Locale
): Promise<Article> {
  if (targetLocale === defaultLocale) return article;

  const source: Locale = defaultLocale;
  const [title, announcement, ...contentTranslated] = await Promise.all([
    translateText(article.title, source, targetLocale),
    translateText(article.announcement, source, targetLocale),
    translateContentBlocks(article.content, source, targetLocale),
  ]);

  const content = Array.isArray(article.content)
    ? cloneBlocks(article.content)
    : [];
  if (content.length && contentTranslated.length) {
    fillTexts(content, contentTranslated[0]);
  }

  return {
    ...article,
    title,
    announcement,
    content,
  };
}

/**
 * Переводит все текстовые поля в content blocks. Возвращает массив переведённых строк в порядке обхода.
 */
async function translateContentBlocks(
  blocks: unknown[] | null | undefined,
  source: Locale,
  target: Locale
): Promise<string[]> {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return [];

  const texts = collectTexts(blocks as ContentBlock[]);
  if (texts.length === 0) return [];

  const SEP_PLACEHOLDER = " " + SEP + " ";
  const joined = texts.join(SEP_PLACEHOLDER);
  const translated = await translateLongText(joined, source, target);
  const parts = translated.split(SEP).map((p) => (typeof p === "string" ? p.trim() : ""));

  if (parts.length === texts.length) {
    return parts;
  }
  // Разделитель потерялся — переводим каждый фрагмент по отдельности
  return Promise.all(texts.map((t) => translateLongText(t, source, target)));
}

/**
 * Переводит массив строк: сначала одним запросом (склейка через SEP).
 * Если API «съедает» разделитель и разбор не совпадает по количеству — переводим каждый элемент по отдельности.
 */
export async function translateBatch(texts: string[], source: Locale, target: Locale): Promise<string[]> {
  if (texts.length === 0) return [];
  if (source === target) return texts;
  const SEP_PLACEHOLDER = " " + SEP + " ";
  const joined = texts.join(SEP_PLACEHOLDER);
  const translated = await translateLongText(joined, source, target);
  const parts = translated.split(SEP).map((p) => (typeof p === "string" ? p.trim() : ""));
  if (parts.length === texts.length) {
    return parts;
  }
  // Разделитель потерялся при переводе — переводим по одному
  return Promise.all(texts.map((t) => translateText(t, source, target)));
}

export interface TranslatedArticleResult {
  article: Article;
  isTranslated: boolean;
}

/**
 * Возвращает статью для отображения.
 * Для ru — из Strapi как есть. Для be/en — всегда берём статью из ru и переводим (чтобы перевод реально срабатывал).
 */
export async function getArticleForLocale(
  getArticleBySlug: (slug: string, locale?: Locale) => Promise<Article | null>,
  slug: string,
  locale: Locale
): Promise<TranslatedArticleResult | null> {
  const sourceArticle = await getArticleBySlug(slug, defaultLocale);
  if (!sourceArticle) {
    return null;
  }
  if (locale === defaultLocale) {
    return { article: sourceArticle, isTranslated: false };
  }
  const article = await translateArticle(sourceArticle, locale);
  return { article, isTranslated: true };
}

export interface ArticlesListResult {
  data: Article[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
  isTranslated: boolean;
}

type GetArticlesFn = (
  page: number,
  pageSize: number,
  sectionUrl: string | null,
  locale?: Locale
) => Promise<{ data: Article[]; meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } } }>;

/**
 * Возвращает список статей для ленты. Для be/en всегда загружаем с ru и переводим title/announcement.
 */
export async function getArticlesForLocale(
  getArticles: GetArticlesFn,
  page: number,
  pageSize: number,
  sectionUrl: string | null,
  locale: Locale
): Promise<ArticlesListResult> {
  const ruRes = await getArticles(page, pageSize, sectionUrl, defaultLocale);
  if (ruRes.data.length === 0) {
    return { data: [], meta: ruRes.meta, isTranslated: false };
  }
  if (locale === defaultLocale) {
    return { ...ruRes, isTranslated: false };
  }
  const titles = ruRes.data.map((a) => a.title);
  const announcements = ruRes.data.map((a) => a.announcement);
  const [translatedTitles, translatedAnnouncements] = await Promise.all([
    translateBatch(titles, defaultLocale, locale),
    translateBatch(announcements, defaultLocale, locale),
  ]);
  const data: Article[] = ruRes.data.map((a, i) => ({
    ...a,
    title: translatedTitles[i] ?? a.title,
    announcement: translatedAnnouncements[i] ?? a.announcement,
  }));
  return { data, meta: ruRes.meta, isTranslated: true };
}
