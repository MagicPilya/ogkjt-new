import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { ContentBlocks } from "@/components/blocks/ContentBlocks";
import { PageFiles } from "@/components/blocks/PageFiles";
import { getAnnualSymbol, getPageByPath } from "@/lib/strapi";
import { normalizeYearThemePath, yearTheme } from "@/lib/year-theme";

const siteTitle = "Оршанский колледж – филиал БелГУТа";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const annualSymbol = await getAnnualSymbol(locale);
  const yearThemePath = normalizeYearThemePath(annualSymbol?.pageUrl);
  const pageData = await getPageByPath(yearThemePath, locale);
  const pageTitle = annualSymbol?.title ?? pageData?.title ?? yearTheme.fallbackTitle[locale];
  return {
    title: `${pageTitle} | ${siteTitle}`,
    description: annualSymbol?.description ?? pageData?.metaDescription ?? yearTheme.fallbackDescription[locale],
  };
}

export default async function YearThemePage({ params }: Props) {
  const { locale } = await params;
  const annualSymbol = await getAnnualSymbol(locale);
  const yearThemePath = normalizeYearThemePath(annualSymbol?.pageUrl);
  const pageData = await getPageByPath(yearThemePath, locale);
  if (!pageData) notFound();

  return (
    <div className="w-full px-4 md:px-8 max-w-[1200px] mx-auto py-12">
      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 md:p-10 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8">
          {annualSymbol?.title || pageData.title}
        </h1>

        {Array.isArray(pageData.content) && pageData.content.length > 0 && (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ContentBlocks blocks={pageData.content} />
          </div>
        )}

        {pageData.files && pageData.files.length > 0 && (
          <PageFiles files={pageData.files} locale={locale} className="mt-10" />
        )}
      </section>
    </div>
  );
}
