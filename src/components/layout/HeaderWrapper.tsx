import { getMenu } from "@/lib/strapi";
import { defaultMenu, normalizeMenu } from "@/lib/menu-sections";
import { Header } from "./Header";

export async function HeaderWrapper() {
    const menuData = await getMenu();
    const menu = normalizeMenu(menuData?.mainMenu) ?? defaultMenu;

    return <Header initialMenu={menu} />;
}

