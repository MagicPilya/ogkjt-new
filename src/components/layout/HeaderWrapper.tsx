import { getGlobalSettings } from "@/lib/strapi";
import { defaultMenu, normalizeMenu } from "@/lib/menu-sections";
import { Header } from "./Header";

export async function HeaderWrapper() {
    const globalSettings = await getGlobalSettings();
    const menu = normalizeMenu(globalSettings?.mainMenu) ?? defaultMenu;

    return <Header initialMenu={menu} />;
}

