import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { Footer } from "@/components/layout/Footer";
import { QuickAccessPanel } from "@/components/blocks/QuickAccessPanel";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Минский государственный железнодорожный колледж",
  description: "Официальный сайт МГЖК. Подготовка специалистов для железнодорожного транспорта.",
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
          {children}
        </main>
        <QuickAccessPanel />
        <Footer />
      </body>
    </html>
  );
}
