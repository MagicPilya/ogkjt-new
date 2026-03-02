import { Hero } from "@/components/blocks/Hero";
import { NewsGrid } from "@/components/blocks/NewsGrid";
import { Events } from "@/components/blocks/Events";
import { Features } from "@/components/blocks/Features";
import { YearThemeBanner } from "@/components/blocks/YearThemeBanner";
import type { Locale } from "@/lib/i18n";
import { getAnnualSymbol, getGlobalSettings, getPageByPath } from "@/lib/strapi";
import { normalizeYearThemePath, yearTheme } from "@/lib/year-theme";
import { getStrapiMedia, getStrapiMediaWithFormats } from "@/lib/utils";

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

  return (
    <div className="flex flex-col min-h-screen">
      <Hero
        locale={locale}
        collegeShortName={globalSettings?.collegeShortName}
        collegeFullName={globalSettings?.collegeFullName}
        universityName={globalSettings?.universityName}
      />
      <YearThemeBanner
        locale={locale}
        title={yearThemeTitle}
        description={yearThemeDescription}
        imageUrl={getStrapiMediaWithFormats(yearThemeImage, ["small", "thumbnail"]) || getStrapiMedia(yearThemeImage?.url)}
        imageAlt={yearThemeImage?.alternativeText || yearThemeTitle}
        href={`/${locale}${yearThemePath}`}
      />
      <Features locale={locale} />

      <section className="py-16 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="w-full px-4 md:px-8 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
            <div className="lg:col-span-8 xl:col-span-9">
              <NewsGrid locale={locale} />
            </div>
            <div className="lg:col-span-4 xl:col-span-3">
              <Events locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
