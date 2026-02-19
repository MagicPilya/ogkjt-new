"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { locales, localeShortLabels, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
  currentLocale: Locale;
  className?: string;
}

const localeLoadingLabel: Record<Locale, string> = {
  ru: "Загрузка...",
  be: "Загрузка...",
  en: "Loading...",
};

/** Переключатель языка: ссылки на ту же страницу с другим locale (ru, be, en). */
export function LocaleSwitcher({ currentLocale, className }: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  const [isPending, startTransition] = useTransition();
  const segments = pathname.split("/").filter(Boolean);
  const pathWithoutLocale = segments.length > 1 ? "/" + segments.slice(1).join("/") : "/";

  useEffect(() => {
    if (!isPending) {
      setPendingLocale(null);
    }
  }, [isPending]);

  return (
    <nav
      aria-label="Выбор языка"
      aria-busy={isPending}
      className={cn("flex items-center gap-1", className)}
    >
      {locales.map((loc) => {
        const href = `/${loc}${pathWithoutLocale}`;
        const isActive = loc === currentLocale;
        const isLoadingThisLocale = isPending && pendingLocale === loc;
        return (
          <Link
            key={loc}
            href={href}
            onClick={(event) => {
              if (isActive || isPending) {
                event.preventDefault();
                return;
              }

              event.preventDefault();
              setPendingLocale(loc);
              startTransition(() => {
                router.push(href);
              });
            }}
            className={cn(
              "px-2 py-1 text-xs font-medium rounded transition-colors inline-flex items-center gap-1",
              isPending && "opacity-80 pointer-events-none",
              isActive
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            aria-current={isActive ? "true" : undefined}
            aria-disabled={isPending ? "true" : undefined}
          >
            {isLoadingThisLocale ? (
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full border border-current border-t-transparent animate-spin"
              />
            ) : null}
            {localeShortLabels[loc]}
          </Link>
        );
      })}
      {isPending ? (
        <span className="sr-only" role="status" aria-live="polite">
          {localeLoadingLabel[currentLocale]}
        </span>
      ) : null}
    </nav>
  );
}
