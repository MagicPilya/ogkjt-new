"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getBreadcrumbItems } from "@/lib/menu-sections";
import { cn } from "@/lib/utils";
import { defaultLocale, isValidLocale } from "@/lib/i18n";
import { uiStrings } from "@/lib/ui-strings";
import type { MenuSection } from "@/lib/strapi";

interface BreadcrumbsProps {
  className?: string;
  menu: MenuSection[];
}

export function Breadcrumbs({ className, menu }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments.length > 0 && isValidLocale(segments[0]) ? segments[0] : defaultLocale;
  const pathWithoutLocale = "/" + segments.slice(1).join("/") || "/";

  if (pathWithoutLocale.startsWith("/events")) return null;

  const items = getBreadcrumbItems(pathWithoutLocale, menu, locale);
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
