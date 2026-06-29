"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { pathWithoutLocale } from "@/lib/breadcrumb-path";
import { getBreadcrumbItems } from "@/lib/menu-sections";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import { uiStrings } from "@/lib/ui-strings";
import type { MenuSection } from "@/lib/strapi";

interface BreadcrumbsNavProps {
  className?: string;
  menu: MenuSection[];
  locale: Locale;
  initialPathname: string;
  initialArticleTitle: string | null;
}

export function BreadcrumbsNav({
  className,
  menu,
  locale,
  initialPathname,
  initialArticleTitle,
}: BreadcrumbsNavProps) {
  const pathname = usePathname() ?? "";
  const currentPath = pathWithoutLocale(pathname);
  const ssrPath = pathWithoutLocale(initialPathname);

  const [articleTitle, setArticleTitle] = useState<string | null>(() =>
    currentPath === ssrPath ? initialArticleTitle : null
  );

  useEffect(() => {
    if (currentPath === ssrPath && initialArticleTitle) {
      setArticleTitle(initialArticleTitle);
      return;
    }

    const pathKey = currentPath.replace(/^\//, "");
    if (!pathKey) {
      setArticleTitle(null);
      return;
    }

    let cancelled = false;

    void fetch(
      `/api/breadcrumb-title?path=${encodeURIComponent(pathKey)}&locale=${encodeURIComponent(locale)}`
    )
      .then((res) => (res.ok ? res.json() : { title: null }))
      .then((data: { title?: string | null }) => {
        if (!cancelled) {
          setArticleTitle(data.title ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArticleTitle(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentPath, locale, ssrPath, initialArticleTitle]);

  if (currentPath.startsWith("/events")) return null;

  const items = getBreadcrumbItems(currentPath, menu, locale, articleTitle);
  if (items.length === 0) return null;

  const prefix = (href: string) => (href === "/" ? `/${locale}` : `/${locale}${href}`);

  return (
    <nav
      aria-label={uiStrings.breadcrumbsLabel[locale]}
      className={cn(
        "w-full border-b bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800",
        className
      )}
    >
      <div className="w-full px-4 md:px-8 max-w-[1600px] mx-auto py-3">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
                    aria-hidden
                  />
                )}
                {isLast ? (
                  <span
                    className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-none"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={prefix(item.href)}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[200px] sm:max-w-none"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
