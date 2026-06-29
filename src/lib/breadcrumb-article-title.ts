import type { Locale } from "./i18n";
import { IDEOLOGY_RESERVED_SLUGS } from "./ideology";
import { getSppsSectionConfig } from "./spps-sections";
import {
  getArticleBySlugOrDocumentId,
  getDormitoryNewsBySlugOrDocumentId,
  type Article,
} from "./strapi";
import { getIdeologyItemBySlugOrDocumentId } from "./strapi/ideology";
import { getArticleForLocale } from "./translateArticle";

type ArticleFetcher = (slug: string, locale?: Locale) => Promise<Article | null>;

function parseArticleDetailPath(path: string): { slug: string; getBySlug: ArticleFetcher } | null {
  const segments = path.replace(/^\//, "").split("/").filter(Boolean);

  if (segments.length === 2 && segments[0] === "news") {
    return { slug: segments[1], getBySlug: getArticleBySlugOrDocumentId };
  }

  if (
    segments.length === 4 &&
    segments[0] === "students" &&
    segments[1] === "dormitory" &&
    segments[2] === "news"
  ) {
    return { slug: segments[3], getBySlug: getDormitoryNewsBySlugOrDocumentId };
  }

  if (segments.length === 4 && segments[0] === "ideology" && segments[1] === "spps") {
    const config = getSppsSectionConfig(segments[2]);
    if (config) {
      return { slug: segments[3], getBySlug: config.getBySlug };
    }
  }

  if (
    segments.length === 2 &&
    segments[0] === "ideology" &&
    !IDEOLOGY_RESERVED_SLUGS.has(segments[1])
  ) {
    return { slug: segments[1], getBySlug: getIdeologyItemBySlugOrDocumentId };
  }

  return null;
}

/** Заголовок статьи для последней крошки (с учётом be/en перевода). */
export async function getArticleBreadcrumbTitle(path: string, locale: Locale): Promise<string | null> {
  const parsed = parseArticleDetailPath(path);
  if (!parsed?.slug || parsed.slug === "null") {
    return null;
  }

  const result = await getArticleForLocale(parsed.getBySlug, parsed.slug, locale);
  return result?.article.title ?? null;
}
