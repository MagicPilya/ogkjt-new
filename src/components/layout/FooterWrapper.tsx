import { getAnnualSymbol, getGlobalSettings, getMenu, getPageByPath } from "@/lib/strapi";
import { Footer } from "./Footer";
import type { Locale } from "@/lib/i18n";
import { normalizeMenu } from "@/lib/menu-sections";
import { normalizeYearThemePath } from "@/lib/year-theme";

export async function FooterWrapper({ locale }: { locale: Locale }) {
  const globalSettings = await getGlobalSettings(locale);
  const menuData = await getMenu(locale);
  const menu = normalizeMenu(menuData?.mainMenu, locale) ?? [];
  const resources = Array.isArray(menuData?.footerResources) ? menuData.footerResources : [];
  const annualSymbol = await getAnnualSymbol(locale);
  const yearThemePath = normalizeYearThemePath(annualSymbol?.pageUrl);
  const yearThemePage = await getPageByPath(yearThemePath, locale);
  const yearThemeMenuTitle = annualSymbol?.title || yearThemePage?.title;
  const yearThemeMenuItem = yearThemeMenuTitle
    ? { title: yearThemeMenuTitle, url: yearThemePath }
    : null;
  return (
    <Footer
      settings={globalSettings}
      menu={menu}
      resources={resources}
      locale={locale}
      yearThemeMenuItem={yearThemeMenuItem}
    />
  );
}

