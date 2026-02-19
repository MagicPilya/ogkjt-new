import { getGlobalSettings } from "@/lib/strapi";
import { Footer } from "./Footer";
import type { Locale } from "@/lib/i18n";

export async function FooterWrapper({ locale }: { locale: Locale }) {
  const globalSettings = await getGlobalSettings(locale);
  return <Footer settings={globalSettings} />;
}

