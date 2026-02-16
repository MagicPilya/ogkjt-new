import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { QuickAccessPanel } from "@/components/blocks/QuickAccessPanel";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Оршанский колледж - филиал БелГУТа",
  description: "Официальный сайт Оршанского колледжа – филиала учреждения образования «Белорусский государственный университет транспорта».",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950`} suppressHydrationWarning>
        <HeaderWrapper />
        <main className="flex-1">
          <Breadcrumbs />
          {children}
        </main>
        <QuickAccessPanel />
        <FooterWrapper />
      </body>
    </html>
  );
}
