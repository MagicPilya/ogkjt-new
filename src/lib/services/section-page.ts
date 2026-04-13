import {
  getAdministration,
  getAdmissionDocuments,
  getArticles,
  getDormitoryNews,
  getMenu,
  getPageByPath,
  getSpecialties,
  type Article,
  type MenuSection,
  type Page,
  type Administration,
  type Specialties,
  type AdmissionDocuments,
} from "@/lib/strapi";
import { getSectionByPath, getTitleForPath, normalizeMenu } from "@/lib/menu-sections";
import { extractTextFromBlocks } from "@/lib/blocks-text";
import type { Locale } from "@/lib/i18n";

export interface SectionPageData {
  path: string;
  pathname: string;
  locale: Locale | undefined;
  menu: MenuSection[];
  section: MenuSection;
  isRootSection: boolean;
  pageData: Page | null;
  title: string;
  showArticleFeed: boolean;
  articles: Article[];
  administration: Administration | null;
  specialties: Specialties | null;
  admissionDocuments: AdmissionDocuments | null;
}

export async function loadSectionPageData(path: string, locale?: Locale): Promise<SectionPageData | null> {
  const pathname = "/" + path;
  const menuData = await getMenu(locale);
  const menu = normalizeMenu(menuData?.mainMenu, locale ?? "ru") ?? [];
  const sectionResult = getSectionByPath(pathname, menu);
  if (!sectionResult) return null;

  const pageData = await getPageByPath(path, locale);
  const feedSection = pageData?.articleFeedSection;
  const showArticleFeed = !!feedSection && feedSection !== "Не показывать";

  const isAdministrationPage = path === "about/administration";
  const isSpecialtiesPage = path === "applicants/specialties";
  const isDocumentsPage = path === "applicants/documents";

  const [articlesRes, administration, specialties, admissionDocuments] = await Promise.all([
    showArticleFeed
      ? path === "students/dormitory"
        ? getDormitoryNews(1, 50, locale)
        : getArticles(1, 50, feedSection, locale)
      : Promise.resolve({ data: [] as Article[] }),
    isAdministrationPage ? getAdministration(locale) : Promise.resolve(null),
    isSpecialtiesPage ? getSpecialties(locale) : Promise.resolve(null),
    isDocumentsPage ? getAdmissionDocuments(locale) : Promise.resolve(null),
  ]);

  const menuTitle = getTitleForPath(pathname, menu);
  const title = menuTitle !== pathname.replace(/^\//, "").trim() ? menuTitle : (pageData?.title ?? menuTitle);

  return {
    path,
    pathname,
    locale,
    menu,
    section: sectionResult.section,
    isRootSection: sectionResult.isRootSection,
    pageData,
    title,
    showArticleFeed,
    articles: articlesRes.data,
    administration,
    specialties,
    admissionDocuments,
  };
}

export async function loadSectionPageMeta(path: string, locale?: Locale) {
  const pathname = "/" + path.replace(/^\//, "").trim();
  const menuData = await getMenu(locale);
  const menu = normalizeMenu(menuData?.mainMenu, locale ?? "ru") ?? [];
  const pageData = await getPageByPath(path, locale);
  const rawMenuTitle = getTitleForPath(pathname, menu);
  const menuTitle = rawMenuTitle !== pathname.replace(/^\//, "").trim() ? rawMenuTitle : (pageData?.title ?? rawMenuTitle);

  return {
    menuTitle,
    description:
      pageData?.metaDescription ??
      (pageData?.content && Array.isArray(pageData.content)
        ? extractTextFromBlocks(pageData.content).slice(0, 160)
        : undefined),
  };
}
