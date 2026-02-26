"use client";

import Link from "next/link";
import { ArrowRight, LayoutList, Layers } from "lucide-react";
import type { SubSectionLink } from "@/lib/menu-sections";
import { cn } from "@/lib/utils";
import { uiStrings } from "@/lib/ui-strings";
import type { Locale } from "@/lib/i18n";

type Variant = "cards" | "list" | "pills" | "minimal";

interface SubSectionLinksProps {
  links: SubSectionLink[];
  title?: string;
  /** Стиль заголовка: обычный (крупный) или более спокойный */
  titleVariant?: "default" | "subtle";
  variant?: Variant;
  className?: string;
  locale?: Locale;
}

/** Блок ссылок на подразделы — несколько вариантов отображения для страниц разделов с подразделами */
export function SubSectionLinks({
  links,
  title,
  variant = "cards",
  titleVariant = "default",
  className,
  locale,
}: SubSectionLinksProps) {
  const displayTitle = title ?? (locale ? uiStrings.subSectionsTitle[locale] : "Подразделы");
  if (!links.length) return null;
  const href = (url: string) => (locale ? `/${locale}${url}` : url);

  return (
    <section className={cn(variant === "minimal" ? "py-2" : "py-8", className)}>
      {displayTitle ? (
        titleVariant === "subtle" ? (
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
            {displayTitle}
          </h2>
        ) : (
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            {displayTitle}
          </h2>
        )
      ) : null}

      {variant === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {links.map((link) => (
            <Link
              key={link.id}
              href={href(link.url)}
                            className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 transition-colors"
                        >
                            <span className="flex-1 font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {link.title}
                            </span>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                        </Link>
                    ))}
                </div>
            )}

            {variant === "list" && (
        <ul className="space-y-2 border-l-2 border-blue-200 dark:border-blue-800 pl-6">
          {links.map((link) => (
            <li key={link.id}>
              <Link
                href={href(link.url)}
                                className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-1.5 group"
                            >
                                <LayoutList className="h-4 w-4 text-slate-400 group-hover:text-blue-500 shrink-0" />
                                {link.title}
                                <ArrowRight className="h-3.5 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            {variant === "pills" && (
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <Link
              key={link.id}
              href={href(link.url)}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/40 dark:hover:text-blue-300 transition-colors"
                        >
                            <Layers className="h-4 w-4 shrink-0" />
                            {link.title}
                        </Link>
                    ))}
                </div>
            )}

            {variant === "minimal" && (
        <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-4 md:gap-x-5 lg:gap-x-6 text-xs sm:text-sm md:text-base lg:text-lg text-slate-600 dark:text-slate-400">
          {links.map((link) => (
            <Link
              key={link.id}
              href={href(link.url)}
                            className="hover:text-blue-600 dark:hover:text-blue-400 underline-offset-2 hover:underline"
                        >
                            {link.title}
                        </Link>
                    ))}
                </nav>
            )}
        </section>
    );
}
