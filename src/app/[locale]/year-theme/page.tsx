import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
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
  const pageImage = annualSymbol?.logo;
  const pageImageUrl = getStrapiMediaWithFormats(pageImage, ["medium", "small", "thumbnail"]);

  return (
    <div className="w-full px-4 md:px-8 max-w-[1200px] mx-auto py-12">
      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 md:p-10 shadow-sm">
        <div className="mb-8 flex flex-col md:flex-row md:items-start gap-6">
          {pageImageUrl && (
            <div className="w-full md:w-[280px] lg:w-[320px] shrink-0">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-3">
                <Image
                  src={pageImageUrl}
                  alt={pageImage?.alternativeText || pageData.title}
                  width={320}
                  height={420}
                  className="w-full h-auto object-contain rounded-lg"
                  unoptimized
                />
              </div>
            </div>
          )}

          <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-pink-700 dark:text-pink-300 mb-2">
            {yearTheme.mainPageBlockTitle[locale]}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
            {annualSymbol?.title || pageData.title}
          </h1>
          {(annualSymbol?.description || pageData.metaDescription) && (
            <p className="mt-3 text-lg text-slate-700 dark:text-slate-300">
              {annualSymbol?.description || pageData.metaDescription}
            </p>
          )}
          </div>
        </div>

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
