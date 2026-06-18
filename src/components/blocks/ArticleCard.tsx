import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { cn, formatDate, getStrapiMediaWithFormats } from "@/lib/utils";
import { uiStrings } from "@/lib/ui-strings";
import type { Article } from "@/lib/strapi";
import type { Locale } from "@/lib/i18n";

interface ArticleCardProps {
  article: Article;
  locale: Locale;
  href: string;
  centered?: boolean;
  showReadMore?: boolean;
}

export function ArticleCard({
  article,
  locale,
  href,
  centered = false,
  showReadMore = true,
}: ArticleCardProps) {
  const imageUrl = getStrapiMediaWithFormats(article.cover, ["small", "thumbnail"]);
  const displayDate = article.date || article.publishedAt || article.createdAt;
  const hasAnnouncement = Boolean(article.announcement?.trim());

  return (
    <Link
      href={href}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <article
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300",
          "hover:-translate-y-0.5 hover:border-blue-200/90 hover:shadow-md",
          "dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800/60"
        )}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200/80 dark:from-slate-900 dark:to-slate-800">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-80"
              />
              <div className="absolute inset-0 bg-black/10" />
              <img
                src={imageUrl}
                alt={article.cover?.alternativeText || article.title}
                loading="lazy"
                className="relative z-10 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-500">
              {uiStrings.noPhoto[locale]}
            </div>
          )}
        </div>

        <div className={cn("flex flex-1 flex-col p-4 sm:p-5", centered && "items-center text-center")}>
          <div
            className={cn(
              "mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400",
              centered && "justify-center"
            )}
          >
            <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <time dateTime={displayDate}>{formatDate(displayDate, locale)}</time>
          </div>

          <h3
            className={cn(
              "line-clamp-2 text-lg font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-400",
              centered ? "w-full" : "text-left"
            )}
          >
            {article.title}
          </h3>

          {hasAnnouncement && (
            <p
              className={cn(
                "mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400",
                centered && "w-full"
              )}
            >
              {article.announcement}
            </p>
          )}
        </div>

        {showReadMore && (
          <div
            className={cn(
              "border-t border-slate-100 bg-slate-50/80 px-4 py-3.5 transition-colors group-hover:bg-blue-50/80 dark:border-slate-800 dark:bg-slate-900/50 dark:group-hover:bg-blue-950/20",
              centered ? "text-center" : ""
            )}
          >
            <span
              className={cn(
                "inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300",
                centered ? "justify-center" : ""
              )}
            >
              {uiStrings.readMore[locale]}
              <ArrowRight
                className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        )}
      </article>
    </Link>
  );
}
