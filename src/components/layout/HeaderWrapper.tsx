import { getMenu } from "@/lib/strapi";
import { defaultMenu, normalizeMenu } from "@/lib/menu-sections";
import { Header } from "./Header";
import type { Locale } from "@/lib/i18n";

export async function HeaderWrapper({ locale }: { locale: Locale }) {
  const menuData = await getMenu(locale);
  const menu = normalizeMenu(menuData?.mainMenu) ?? defaultMenu;

  return <Header initialMenu={menu} locale={locale} />;
}

