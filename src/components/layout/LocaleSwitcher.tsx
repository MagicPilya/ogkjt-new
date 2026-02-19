"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeShortLabels, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
  currentLocale: Locale;
  className?: string;
}

/** Переключатель языка: ссылки на ту же страницу с другим locale (ru, be, en). */
export function LocaleSwitcher({ currentLocale, className }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const pathWithoutLocale = segments.length > 1 ? "/" + segments.slice(1).join("/") : "/";

  return (
    <nav aria-label="Выбор языка" className={cn("flex items-center gap-1", className)}>
      {locales.map((loc) => {
        const href = `/${loc}${pathWithoutLocale}`;
        const isActive = loc === currentLocale;
        return (
          <Link
            key={loc}
            href={href}
            className={cn(
              "px-2 py-1 text-xs font-medium rounded transition-colors",
              isActive
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            aria-current={isActive ? "true" : undefined}
          >
            {localeShortLabels[loc]}
          </Link>
        );
      })}
    </nav>
  );
}
