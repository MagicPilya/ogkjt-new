/**
 * Перевод статьи (title, announcement, content blocks) для отображения на другом языке.
 * Исходный контент предполагается на defaultLocale (ru).
 */
import type { Article } from "./strapi";
import type { Locale } from "./i18n";
import { defaultLocale } from "./i18n";
import { translateText, translateLongText } from "./translate";

type ContentBlock = {
  type?: string;
  text?: string;
  plainText?: string;
  children?: ContentBlock[];
  [key: string]: unknown;
};

/** Глубокое копирование блоков контента */
function cloneBlocks(blocks: unknown[]): ContentBlock[] {
  return JSON.parse(JSON.stringify(blocks)) as ContentBlock[];
}

/**
 * Рекурсивно переводит текст в узлах, сохраняя структуру и форматирование.
 */
async function translateNodeRecursive(
  node: ContentBlock,
  source: Locale,
  target: Locale
): Promise<ContentBlock> {
  const translatedNode: ContentBlock = { ...node };

  // Переводим текстовое поле, если оно есть
  if (typeof node.text === "string") {
    if (node.text.trim()) {
      translatedNode.text = await translateLongText(node.text, source, target);
    }
  }

  // Переводим plainText для блоков кода, если он есть
  if (typeof node.plainText === "string") {
    if (node.plainText.trim()) {
      translatedNode.plainText = await translateLongText(node.plainText, source, target);
    }
  }

  // Рекурсивно обрабатываем дочерние узлы
  if (Array.isArray(node.children) && node.children.length > 0) {
    translatedNode.children = await Promise.all(
      node.children.map((child) => translateNodeRecursive(child, source, target))
    );
  }

  return translatedNode;
}

/**
 * Переводит все контентные блоки с сохранением структуры и форматирования.
 */
async function translateContentBlocks(
  blocks: unknown[] | null | undefined,
  source: Locale,
  target: Locale
): Promise<ContentBlock[]> {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return [];

  const cloned = cloneBlocks(blocks);
  return Promise.all(cloned.map((block) => translateNodeRecursive(block, source, target)));
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
  const [title, announcement, content] = await Promise.all([
    translateText(article.title, source, targetLocale),
    article.announcement
      ? translateText(article.announcement, source, targetLocale)
      : Promise.resolve(undefined),
    translateContentBlocks(article.content, source, targetLocale),
  ]);

  return {
    ...article,
    title,
    ...(announcement !== undefined ? { announcement } : {}),
    content,
  };
}

/**
 * Переводит массив строк: сначала одним запросом (склейка через SEP).
 * Если API «съедает» разделитель и разбор не совпадает по количеству — переводим каждый элемент по отдельности.
 */
export async function translateBatch(texts: string[], source: Locale, target: Locale): Promise<string[]> {
  if (texts.length === 0) return [];
  if (source === target) return texts;
  // Поэлементный перевод надёжнее для списков карточек:
  // часть внешних API иногда искажает разделители при батч-склейке.
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
 * Возвращает список статей для ленты. Источник всегда defaultLocale (ru),
 * для be/en выполняется авто-перевод title/announcement.
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
  if (locale === defaultLocale) return { ...ruRes, isTranslated: false };
  const titles = ruRes.data.map((a) => a.title);
  const announcements = ruRes.data.map((a) => a.announcement ?? "");
  const [translatedTitles, translatedAnnouncements] = await Promise.all([
    translateBatch(titles, defaultLocale, locale),
    translateBatch(announcements, defaultLocale, locale),
  ]);
  const data: Article[] = ruRes.data.map((a, i) => ({
    ...a,
    title: translatedTitles[i] ?? a.title,
    ...(a.announcement !== undefined && a.announcement !== null
      ? { announcement: translatedAnnouncements[i] ?? a.announcement }
      : {}),
  }));
  return { data, meta: ruRes.meta, isTranslated: true };
}
