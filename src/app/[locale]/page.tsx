import { Hero } from "@/components/blocks/Hero";
import { NewsGrid } from "@/components/blocks/NewsGrid";
import { Events } from "@/components/blocks/Events";
import { Features } from "@/components/blocks/Features";
import type { Locale } from "@/lib/i18n";
import { getAnnualSymbol, getGlobalSettings, getPageByPath } from "@/lib/strapi";
import { normalizeYearThemePath, yearTheme } from "@/lib/year-theme";
import { getStrapiMedia, getStrapiMediaWithFormats } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Venus } from "lucide-react";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const globalSettings = await getGlobalSettings(locale);
  const annualSymbol = await getAnnualSymbol(locale);
  const yearThemePath = normalizeYearThemePath(annualSymbol?.pageUrl);
  const yearThemePage = await getPageByPath(yearThemePath, locale);
  const yearThemeImage = annualSymbol?.logo;
  const yearThemeTitle = annualSymbol?.title || yearThemePage?.title;
  const yearThemeDescription = annualSymbol?.description || yearThemePage?.metaDescription;
  const yearThemeImageUrl =
    getStrapiMediaWithFormats(yearThemeImage, ["small", "thumbnail"]) || getStrapiMedia(yearThemeImage?.url);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero
        locale={locale}
        collegeShortName={globalSettings?.collegeShortName}
        collegeFullName={globalSettings?.collegeFullName}
        universityName={globalSettings?.universityName}
      />
      <Features locale={locale} />

      <section className="py-16 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="w-full px-4 md:px-8 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
            <div className="lg:col-span-8 xl:col-span-9">
              <NewsGrid locale={locale} />
            </div>
            <div className="lg:col-span-4 xl:col-span-3 space-y-6">
              <Link
                href={`/${locale}${yearThemePath}`}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-slate-900 dark:to-slate-900/60 p-4 hover:shadow-md hover:border-pink-300 dark:hover:border-pink-500/50 transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  {yearThemeImageUrl ? (
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-white shadow shrink-0">
                      <Image
                        src={yearThemeImageUrl}
                        alt={yearThemeImage?.alternativeText || yearThemeTitle || yearTheme.fallbackTitle[locale]}
                        width={48}
                        height={48}
                        className="h-full w-full object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-pink-600 text-white flex items-center justify-center shadow shrink-0">
                      <Venus className="h-6 w-6" aria-hidden />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {yearThemeTitle || yearTheme.fallbackTitle[locale]}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                      {yearThemeDescription || yearTheme.fallbackDescription[locale]}
                    </p>
                  </div>
                </div>
              </Link>
              <Events locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
