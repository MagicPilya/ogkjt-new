import { getGlobalSettings } from "@/lib/strapi";
import { Footer } from "./Footer";

export async function FooterWrapper() {
    const globalSettings = await getGlobalSettings();
    return <Footer settings={globalSettings} />;
}

