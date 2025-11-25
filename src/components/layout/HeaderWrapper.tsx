import { getGlobalSettings } from "@/lib/strapi";
import { Header } from "./Header";

export async function HeaderWrapper() {
    const globalSettings = await getGlobalSettings();
    const menu = globalSettings?.mainMenu || null;

    return <Header initialMenu={menu} />;
}

