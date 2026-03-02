import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HtmlLang } from "@/components/layout/HtmlLang";
import { RouteChangeIndicator } from "@/components/layout/RouteChangeIndicator";
import { isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  return (
    <ThemeProvider>
      <HtmlLang locale={locale as Locale} />
      <RouteChangeIndicator />
      <HeaderWrapper locale={locale as Locale} />
      <main className="flex-1">
        <Breadcrumbs />
        {children}
      </main>
      <FooterWrapper locale={locale as Locale} />
    </ThemeProvider>
  );
}
