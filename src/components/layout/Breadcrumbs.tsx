import { headers } from "next/headers";
import { getArticleBreadcrumbTitle } from "@/lib/breadcrumb-article-title";
import { pathWithoutLocale } from "@/lib/breadcrumb-path";
import type { Locale } from "@/lib/i18n";
import type { MenuSection } from "@/lib/strapi";
import { BreadcrumbsNav } from "./BreadcrumbsNav";

interface BreadcrumbsProps {
  className?: string;
  menu: MenuSection[];
  locale: Locale;
}

export async function Breadcrumbs({ className, menu, locale }: BreadcrumbsProps) {
  const headersList = await headers();
  const fullPathname = headersList.get("x-pathname") ?? "";
  const currentPath = pathWithoutLocale(fullPathname);
  const initialArticleTitle = await getArticleBreadcrumbTitle(
    currentPath.replace(/^\//, ""),
    locale,
    menu
  );

  return (
    <BreadcrumbsNav
      className={className}
      menu={menu}
      locale={locale}
      initialPathname={fullPathname}
      initialArticleTitle={initialArticleTitle}
    />
  );
}
