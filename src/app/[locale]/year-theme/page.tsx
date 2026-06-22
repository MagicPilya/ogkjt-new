import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { ContentBlocks } from "@/components/blocks/ContentBlocks";
import { PageFiles } from "@/components/blocks/PageFiles";
import { getAnnualSymbol, getPageByPath } from "@/lib/strapi";
import { normalizeYearThemePath, yearTheme } from "@/lib/year-theme";
import { getStrapiMediaWithFormats } from "@/lib/utils";

const siteTitle = "Оршанский колледж – филиал БелГУТа";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const annualSymbol = await getAnnualSymbol(locale);
  const yearThemePath = normalizeYearThemePath(annualSymbol?.pageUrl);
  let pageData = await getPageByPath(yearThemePath, locale);
  if (!pageData && locale !== "en") {
    pageData = await getPageByPath(yearThemePath, "en");
  }
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
  let pageData = await getPageByPath(yearThemePath, locale);
  if (!pageData && locale !== "en") {
    pageData = await getPageByPath(yearThemePath, "en");
  }
  const title = annualSymbol?.title ?? pageData?.title ?? yearTheme.fallbackTitle[locale];
  const logoUrl = getStrapiMediaWithFormats(annualSymbol?.logo, ["large", "medium", "small", "thumbnail"]);
  const description = annualSymbol?.description ?? pageData?.metaDescription ?? yearTheme.fallbackDescription[locale];

  return (
    <div className="w-full px-4 md:px-8 max-w-[1200px] mx-auto py-12">
      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 md:p-10 shadow-sm">
        {logoUrl ? (
          <div className="flex justify-center mb-8">
            <img
              src={logoUrl}
              alt={annualSymbol?.logo?.alternativeText || title}
              className="max-h-[320px] object-contain"
            />
          </div>
        ) : null}

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">{title}</h1>

        {description ? (
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-none">{description}</p>
        ) : (
          <div className="mb-8" />
        )}

        {Array.isArray(pageData?.content) && pageData.content.length > 0 && (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ContentBlocks blocks={pageData.content} />
          </div>
        )}

        {pageData?.files && pageData.files.length > 0 && (
          <PageFiles files={pageData.files} locale={locale} className="mt-10" />
        )}
      </section>
    </div>
  );
}
