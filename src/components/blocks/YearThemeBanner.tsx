import Link from "next/link";
import Image from "next/image";
import { Venus } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { yearTheme } from "@/lib/year-theme";

interface YearThemeBannerProps {
  locale: Locale;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  href?: string;
}

export function YearThemeBanner({ locale, title, description, imageUrl, imageAlt, href }: YearThemeBannerProps) {
  const linkHref = href || `/${locale}${yearTheme.path}`;
  const titleText = title || yearTheme.fallbackTitle[locale];
  const descriptionText = description || yearTheme.fallbackDescription[locale];

  return (
    <section className="py-12 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800">
      <div className="w-full px-4 md:px-8 max-w-[1600px] mx-auto">
        <Link
          href={linkHref}
          className="group block rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-slate-900 dark:to-slate-900/60 p-6 md:p-8 hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-500/50 transition-all"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="shrink-0">
              {imageUrl ? (
                <div className="h-24 w-24 rounded-xl overflow-hidden bg-white shadow-lg shadow-pink-700/20">
                  <Image
                    src={imageUrl}
                    alt={imageAlt || titleText}
                    width={96}
                    height={96}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-700/20">
                  <Venus className="h-12 w-12" aria-hidden />
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-pink-700 dark:text-pink-300 mb-2">
                {yearTheme.mainPageBlockTitle[locale]}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {titleText}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 max-w-3xl">
                {descriptionText}
              </p>
              <span className="inline-flex items-center mt-4 text-pink-700 dark:text-pink-300 font-semibold group-hover:underline">
                {yearTheme.fallbackCta[locale]}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
