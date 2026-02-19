import { getGlobalSettings, getMenu } from "@/lib/strapi";
import { Footer } from "./Footer";
import type { Locale } from "@/lib/i18n";
import { normalizeMenu } from "@/lib/menu-sections";

export async function FooterWrapper({ locale }: { locale: Locale }) {
  const globalSettings = await getGlobalSettings(locale);
  const menuData = await getMenu(locale);
  const menu = normalizeMenu(menuData?.mainMenu, locale) ?? [];
  return <Footer settings={globalSettings} menu={menu} locale={locale} />;
}

