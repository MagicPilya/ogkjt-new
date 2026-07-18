import { notFound } from "next/navigation";
import { SubSectionLinks } from "@/components/blocks/SubSectionLinks";
import { ContentBlocks } from "@/components/blocks/ContentBlocks";
import { Events } from "@/components/blocks/Events";
import { AdministrationCards } from "@/components/blocks/AdministrationCards";
import { SpecialtyCards } from "@/components/blocks/SpecialtyCards";
import { DocumentCards } from "@/components/blocks/DocumentCards";
import { PageFiles } from "@/components/blocks/PageFiles";
import { ArticleCard } from "@/components/blocks/ArticleCard";
import { MediaSlider, type MediaItem } from "@/components/blocks/MediaSlider";
import { uiStrings } from "@/lib/ui-strings";
import type { Locale } from "@/lib/i18n";
import { loadSectionPageData, loadSectionPageMeta } from "@/lib/services/section-page";
import { getGlobalSettings, getAnnualSymbol } from "@/lib/strapi";
import {
  getAdmissionPeriodsSummary,
  getAdmissionSheetViewPath,
} from "@/lib/admission-campaign";
import { AdmissionSheetEmbed } from "@/components/blocks/AdmissionSheetEmbed";
import { yearTheme } from "@/lib/year-theme";

const SITE_TITLE = "Оршанский колледж – филиал БелГУТа";

interface SectionPageProps {
  /** Путь без ведущего слэша, например about, about/administration */
  path: string;
  locale?: Locale;
}

export default async function SectionPage({ path, locale }: SectionPageProps) {
  const data = await loadSectionPageData(path, locale);
  if (!data) notFound();

  const {
    section,
    isRootSection,
    pageData,
    title,
    showArticleFeed,
    articles,
    administration,
    specialties,
    admissionDocuments,
  } = data;

  const isYearThemePage = path === yearTheme.path.replace(/^\//, "");
  const annualSymbol = isYearThemePage ? await getAnnualSymbol(locale) : null;

  const isAdministrationPage = path === "about/administration";
  const isSpecialtiesPage = path === "applicants/specialties";
  const isDocumentsPage = path === "applicants/documents";
  const isAdmissionProgressPage = path === "applicants/admission-progress";
  const mediaList: MediaItem[] = Array.isArray(pageData?.media)
    ? pageData.media
    : ((pageData as { Media?: MediaItem[] } | null)?.Media ?? []);
  const pageContent = Array.isArray(pageData?.content) ? pageData.content : [];
  const yearThemeContent =
    isYearThemePage && annualSymbol && Array.isArray(annualSymbol.content) ? annualSymbol.content : [];
  const contentBlocks = isYearThemePage ? yearThemeContent : pageContent;
  const normalizedPath = `/${path.replace(/^\/+|\/+$/g, "")}`;
  const normalizeUrl = (url: string) => `/${url.replace(/^\/+|\/+$/g, "")}`;

  const activeSectionLink = section.links?.find((link) => {
    const linkUrl = normalizeUrl(link.url ?? "");
    return normalizedPath === linkUrl;
  });

  const topNavLinks = isRootSection ? section.links ?? [] : activeSectionLink?.sublinks ?? [];
  const globalSettings = isAdmissionProgressPage ? await getGlobalSettings(locale, { revalidateSeconds: null }) : null;
  const admissionLocale = locale ?? "ru";
  const admissionPeriods = isAdmissionProgressPage
    ? getAdmissionPeriodsSummary(globalSettings, admissionLocale)
    : [];
  const admissionSheetEmbedPath = isAdmissionProgressPage
    ? getAdmissionSheetViewPath(admissionLocale, { embed: true })
    : "";
  const admissionSheetViewPath = isAdmissionProgressPage ? getAdmissionSheetViewPath(admissionLocale) : "";
  const admissionIframeTitle = {
    ru: "Ход приёма документов",
    be: "Ход прыёму дакументаў",
    en: "Document admission progress",
  }[admissionLocale];
  const isDormitorySection = path === "students/dormitory";
  const newsHref = (identifier: string) =>
    isDormitorySection
      ? locale
        ? `/${locale}/students/dormitory/news/${identifier}`
        : `/students/dormitory/news/${identifier}`
      : locale
        ? `/${locale}/news/${identifier}`
        : `/news/${identifier}`;

  return (
    <div className="w-full px-4 md:px-8 max-w-[1600px] mx-auto py-12" data-locale={locale}>
      <div className="mb-10 text-center">
        {isYearThemePage && annualSymbol?.logo && (
          <div className="mb-6 flex justify-center">
            <img
              src={annualSymbol.logo.url}
              alt={annualSymbol.logo.alternativeText || title}
              className="max-h-[300px] object-contain"
            />
          </div>
        )}
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
          {title}
        </h1>
        {topNavLinks.length > 0 && (
          <SubSectionLinks
            links={topNavLinks}
            title=""
            variant="minimal"
            className="mb-6"
            locale={locale}
          />
        )}
        {contentBlocks.length > 0 ? (
          <div className="prose prose-slate dark:prose-invert max-w-3xl mx-auto text-left">
            <ContentBlocks 
              blocks={contentBlocks} 
              className="text-lg text-slate-600 dark:text-slate-400" 
            />
          </div>
        ) : null}
        {isYearThemePage && annualSymbol?.description ? (
          <div className="mt-6 max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            {annualSymbol.description}
          </div>
        ) : null}
      </div>

      {isAdministrationPage && administration?.members && administration.members.length > 0 && (
        <AdministrationCards members={administration.members} />
      )}

      {isSpecialtiesPage && specialties?.items && specialties.items.length > 0 && (
        <SpecialtyCards items={specialties.items} locale={locale} />
      )}

      {isDocumentsPage && admissionDocuments && (
        <DocumentCards data={admissionDocuments} locale={locale} />
      )}

      {mediaList.length > 0 && (
        <section className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-800" aria-label={uiStrings.pageMedia[locale ?? "ru"]}>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {uiStrings.pageMedia[locale ?? "ru"]}
          </h2>
          <MediaSlider items={mediaList} height="420px" />
        </section>
      )}

      {pageData?.files && pageData.files.length > 0 && (
        <PageFiles files={pageData.files} locale={locale} className="mt-10" />
      )}

      {showArticleFeed && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {articles.map((item) => {
              const articlePath = item.slug || item.documentId;
              return (
                <ArticleCard
                  key={item.id}
                  article={item}
                  locale={locale ?? "ru"}
                  href={newsHref(articlePath)}
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
      )}

      {isAdmissionProgressPage && (
        <div className="mt-10">
          {admissionPeriods.length > 0 && (
            <div className="mb-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {admissionPeriods.map((period) => (
                <p key={period.title}>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{period.title}:</span> {period.value}
                </p>
              ))}
            </div>
          )}
          <AdmissionSheetEmbed
            src={admissionSheetEmbedPath}
            openHref={admissionSheetViewPath}
            title={admissionIframeTitle}
            locale={admissionLocale}
          />
        </div>
      )}

      {isRootSection && section.links && section.links.length > 0 && (
        <SubSectionLinks
          links={section.links}
          title={uiStrings.subSectionsTitle[locale ?? "ru"]}
          variant="cards"
          titleVariant="subtle"
          className="mt-12"
          locale={locale}
        />
      )}
    </div>
  );
}

export async function getSectionPageMetadata(path: string, locale?: Locale) {
  const { menuTitle, description } = await loadSectionPageMeta(path, locale);
  const title = `${menuTitle} | ${SITE_TITLE}`;
  return { title, description };
}
