import { Languages } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageByPath } from "@/lib/strapi";
import { getArticlesForLocale } from "@/lib/translateArticle";
import { ContentBlocks } from "@/components/blocks/ContentBlocks";
import { ArticleCard } from "@/components/blocks/ArticleCard";
import { translationDisclaimer, type Locale } from "@/lib/i18n";
import { getSppsSectionConfig } from "@/lib/spps-sections";

const SITE_TITLE = "Оршанский колледж – филиал БелГУТа";
const PAGE_SIZE = 12;

interface Props {
  params: Promise<{ locale: Locale; section: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, section } = await params;
  const config = getSppsSectionConfig(section);
  if (!config) return { title: "404" };

  const pageData = await getPageByPath(config.path, locale);
  const pageTitle = pageData?.title ?? config.defaultTitle[locale];
  return {
    title: `${pageTitle} | ${SITE_TITLE}`,
    description: pageData?.metaDescription ?? undefined,
  };
}

export default async function SppsSectionPage({ params, searchParams }: Props) {
  const { locale, section } = await params;
  const config = getSppsSectionConfig(section);
  if (!config) notFound();

  const { page: pageParam } = await (searchParams ?? Promise.resolve({ page: undefined }));
  const parsedPage = Number.parseInt(pageParam ?? "1", 10);
  const requestedPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const pageData = await getPageByPath(config.path, locale);
  const title = pageData?.title ?? config.defaultTitle[locale];

  const getItemsForLocale = (page: number, pageSize: number, _sectionUrl: string | null, targetLocale?: Locale) =>
    config.getItems(page, pageSize, targetLocale);

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
    if (page <= 1) return `/${locale}/ideology/spps/${section}`;
    return `/${locale}/ideology/spps/${section}?page=${page}`;
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
              href={`/${locale}/ideology/spps/${section}/${articlePath}`}
              centered
              showReadMore
            />
          );
        })}
      </div>

      {pageCount > 1 && (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label={config.paginationAria[locale]}>
          {hasPrev ? (
            <Link
              href={makePageHref(currentPage - 1)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {config.prevLabel[locale]}
            </Link>
          ) : (
            <span className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-400 dark:border-slate-800 dark:text-slate-600">
              {config.prevLabel[locale]}
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
              {config.nextLabel[locale]}
            </Link>
          ) : (
            <span className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-400 dark:border-slate-800 dark:text-slate-600">
              {config.nextLabel[locale]}
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
