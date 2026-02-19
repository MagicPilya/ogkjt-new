import { getGlobalSettings, getMenu } from "@/lib/strapi";
import { Header } from "./Header";
import type { Locale } from "@/lib/i18n";
import { normalizeMenu } from "@/lib/menu-sections";

export async function HeaderWrapper({ locale }: { locale: Locale }) {
  const globalSettings = await getGlobalSettings(locale);
  const menuData = await getMenu(locale);
  const menu = normalizeMenu(menuData?.mainMenu, locale) ?? [];

  return <Header initialMenu={menu} settings={globalSettings} locale={locale} />;
}

