import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HtmlLang } from "@/components/layout/HtmlLang";
import { RouteChangeIndicator } from "@/components/layout/RouteChangeIndicator";
import { isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { normalizeMenu } from "@/lib/menu-sections";
import { getMenu } from "@/lib/strapi";

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const menuData = await getMenu(typedLocale);
  const breadcrumbMenu = normalizeMenu(menuData?.mainMenu, typedLocale) ?? [];

  return (
    <ThemeProvider>
      <HtmlLang locale={typedLocale} />
      <RouteChangeIndicator />
      <HeaderWrapper locale={typedLocale} />
      <main className="flex-1">
        <Breadcrumbs menu={breadcrumbMenu} />
        {children}
      </main>
      <FooterWrapper locale={typedLocale} />
    </ThemeProvider>
  );
}
