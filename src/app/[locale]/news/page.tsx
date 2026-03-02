import { Languages } from "lucide-react";
import { Metadata } from "next";
import { getPageByPath, getArticles } from "@/lib/strapi";
import { getArticlesForLocale } from "@/lib/translateArticle";
import { Events } from "@/components/blocks/Events";
import { ContentBlocks } from "@/components/blocks/ContentBlocks";
import { ArticleCard } from "@/components/blocks/ArticleCard";
import { translationDisclaimer, type Locale } from "@/lib/i18n";

const SITE_TITLE = "Оршанский колледж – филиал БелГУТа";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const pageData = await getPageByPath("news", locale);
  const pageTitle = pageData?.title ?? "Новости колледжа";
  const title = `${pageTitle} | ${SITE_TITLE}`;
  const description = pageData?.metaDescription ?? undefined;
  return { title, description };
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  const pageData = await getPageByPath("news", locale);
  const title = pageData?.title ?? "Новости колледжа";
  const feedSection =
    pageData?.articleFeedSection && pageData.articleFeedSection !== "Не показывать"
      ? pageData.articleFeedSection
      : "НОВОСТИ КОЛЛЕДЖА";
  const { data: articles, isTranslated } = await getArticlesForLocale(
    getArticles,
    1,
    50,
    feedSection,
    locale
  );

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {articles.map((item) => {
              const articlePath = item.slug || item.documentId;
              return (
                <ArticleCard
                  key={item.id}
                  article={item}
                  locale={locale}
                  href={`/${locale}/news/${articlePath}`}
                  centered
                  showReadMore
                />
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-3">
          <Events locale={locale} />
        </div>
      </div>
    </div>
  );
}
