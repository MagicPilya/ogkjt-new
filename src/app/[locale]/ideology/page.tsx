import { Languages } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { getMenu, getPageByPath } from "@/lib/strapi";
import { getIdeologyItems } from "@/lib/strapi/ideology";
import { getArticlesForLocale } from "@/lib/translateArticle";
import { ContentBlocks } from "@/components/blocks/ContentBlocks";
import { ArticleCard } from "@/components/blocks/ArticleCard";
import { SubSectionLinks } from "@/components/blocks/SubSectionLinks";
import { translationDisclaimer, type Locale } from "@/lib/i18n";
import { ideologyLabels, IDEOLOGY_PATH } from "@/lib/ideology";
import { getSectionByPath, normalizeMenu } from "@/lib/menu-sections";
import { uiStrings } from "@/lib/ui-strings";

const SITE_TITLE = "Оршанский колледж – филиал БелГУТа";
const PAGE_SIZE = 12;

interface Props {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const pageData = await getPageByPath(IDEOLOGY_PATH, locale);
  const labels = ideologyLabels[locale];
  const pageTitle = pageData?.title ?? labels.defaultTitle;
  return {
    title: `${pageTitle} | ${SITE_TITLE}`,
    description: pageData?.metaDescription ?? undefined,
  };
}

export default async function IdeologyPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page: pageParam } = await (searchParams ?? Promise.resolve({ page: undefined }));
  const parsedPage = Number.parseInt(pageParam ?? "1", 10);
  const requestedPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const labels = ideologyLabels[locale];
  const [pageData, menuData] = await Promise.all([
    getPageByPath(IDEOLOGY_PATH, locale),
    getMenu(locale),
  ]);
  const menu = normalizeMenu(menuData?.mainMenu, locale) ?? [];
  const sectionResult = getSectionByPath(`/${IDEOLOGY_PATH}`, menu, locale);
  const section = sectionResult?.section;
  const title = pageData?.title ?? labels.defaultTitle;

  const getItemsForLocale = (page: number, pageSize: number, _sectionUrl: string | null, targetLocale?: Locale) =>
    getIdeologyItems(page, pageSize, targetLocale);

  const { data: articles, meta, isTranslated } = await getArticlesForLocale(
    getItemsForLocale,
    requestedPage,
    PAGE_SIZE,
    null,
    locale
  );

  const pagination = meta.pagination;
  const currentPage = pagination.page;
  const pageCount = pagination.pageCount;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < pageCount;

  const makePageHref = (page: number) => {
    if (page <= 1) return `/${locale}/${IDEOLOGY_PATH}`;
    return `/${locale}/${IDEOLOGY_PATH}?page=${page}`;
  };

  const pageWindowStart = Math.max(1, currentPage - 2);
  const pageWindowEnd = Math.min(pageCount, currentPage + 2);
  const pageNumbers: number[] = [];
  for (let p = pageWindowStart; p <= pageWindowEnd; p += 1) {
    pageNumbers.push(p);
  }

  return (
    <div className="w-full px-4 md:px-8 max-w-[1600px] mx-auto py-12">
      {isTranslated && (
        <div
          className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
          role="note"
          aria-label={translationDisclaimer[locale]}
        >
          <Languages className="h-4 w-4 shrink-0" />
          <span>{translationDisclaimer[locale]}</span>
        </div>
      )}

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
          {title}
        </h1>
        {section?.links && section.links.length > 0 && (
          <SubSectionLinks
            links={section.links}
            title=""
            variant="minimal"
            className="mb-6"
            locale={locale}
          />
        )}
        {pageData?.content && pageData.content.length > 0 && (
          <div className="prose prose-slate dark:prose-invert max-w-2xl mx-auto text-left">
            <ContentBlocks blocks={pageData.content} className="text-lg text-slate-600 dark:text-slate-400" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articles.map((item) => {
          const articlePath = item.slug || item.documentId;
          return (
            <ArticleCard
              key={item.id}
              article={item}
              locale={locale}
              href={`/${locale}/${IDEOLOGY_PATH}/${articlePath}`}
              centered
              showReadMore
            />
          );
        })}
      </div>

      {pageCount > 1 && (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label={labels.pagination}>
          {hasPrev ? (
            <Link
              href={makePageHref(currentPage - 1)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {labels.prev}
            </Link>
          ) : (
            <span className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-400 dark:border-slate-800 dark:text-slate-600">
              {labels.prev}
            </span>
          )}

          {pageNumbers.map((page) => {
            const isActive = page === currentPage;
            return isActive ? (
              <span
                key={page}
                aria-current="page"
                className="rounded-md border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
              >
                {page}
              </span>
            ) : (
              <Link
                key={page}
                href={makePageHref(page)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {page}
              </Link>
            );
          })}

          {hasNext ? (
            <Link
              href={makePageHref(currentPage + 1)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {labels.next}
            </Link>
          ) : (
            <span className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-400 dark:border-slate-800 dark:text-slate-600">
              {labels.next}
            </span>
          )}
        </nav>
      )}

      {section?.links && section.links.length > 0 && (
        <SubSectionLinks
          links={section.links}
          title={uiStrings.subSectionsTitle[locale]}
          variant="cards"
          titleVariant="subtle"
          className="mt-12"
          locale={locale}
        />
      )}
    </div>
  );
}
