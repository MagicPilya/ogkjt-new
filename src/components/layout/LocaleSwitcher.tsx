"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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

/** Переключатель языка: на маленьких экранах — select, на больших — ссылки RU / BY / EN. */
export function LocaleSwitcher({ currentLocale, className }: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  const [isPending, startTransition] = useTransition();
  const segments = pathname.split("/").filter(Boolean);
  const pathWithoutLocale = segments.length > 1 ? "/" + segments.slice(1).join("/") : "/";

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loc = e.target.value as Locale;
    if (loc === currentLocale || isPending) return;
    const href = `/${loc}${pathWithoutLocale}`;
    setPendingLocale(loc);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <nav
      aria-label="Выбор языка"
      aria-busy={isPending}
      className={cn("flex items-center gap-1", className)}
    >
      {/* На узких экранах (до 480px) — select, чтобы не уезжали кнопки и не съезжала версия для слабовидящих */}
      <div className="xs:hidden min-w-0">
        <label htmlFor="locale-select" className="sr-only">
          Язык
        </label>
        <select
          id="locale-select"
          value={currentLocale}
          onChange={handleSelectChange}
          disabled={isPending}
          className="h-8 min-h-[36px] max-w-[4.5rem] rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium px-2 py-1 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
          aria-label="Выбор языка"
        >
          {locales.map((loc) => (
            <option key={loc} value={loc}>
              {localeShortLabels[loc]}
            </option>
          ))}
        </select>
      </div>

      {/* От 480px — три кнопки-ссылки */}
      <div className="hidden xs:flex items-center gap-1">
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
      </div>

      {isPending ? (
        <span className="sr-only" role="status" aria-live="polite">
          {localeLoadingLabel[currentLocale]}
        </span>
      ) : null}
    </nav>
  );
}
