import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, getStrapiMediaWithFormats } from "@/lib/utils";
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
  showReadMore = false,
}: ArticleCardProps) {
  const imageUrl = getStrapiMediaWithFormats(article.cover, ["small", "thumbnail"]);
  const displayDate = article.date || article.publishedAt || article.createdAt;

  return (
    <Card className={`flex h-full flex-col gap-0 overflow-hidden py-0 transition-shadow hover:shadow-lg ${centered ? "text-center" : ""}`}>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
            />
            <div className="absolute inset-0 bg-black/10" />
            <img
              src={imageUrl}
              alt={article.cover?.alternativeText || article.title}
              loading="lazy"
              className="relative z-10 h-full w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            {uiStrings.noPhoto[locale]}
          </div>
        )}
      </div>
      <CardHeader className="pt-5">
        <div className={`flex items-center text-sm text-slate-500 mb-2 ${centered ? "justify-center" : ""}`}>
          <Calendar className="mr-2 h-4 w-4" />
          {formatDate(displayDate, locale)}
        </div>
        <CardTitle className={`line-clamp-2 hover:text-blue-600 transition-colors ${centered ? "" : "text-lg"}`}>
          <Link href={href}>{article.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className={`line-clamp-4 break-words text-slate-600 dark:text-slate-400 leading-relaxed text-sm ${centered ? "text-base" : ""}`}>
          {article.announcement}
        </p>
      </CardContent>
      {showReadMore && (
        <CardFooter className="justify-center">
          <Button variant="link" className="p-0 h-auto font-semibold text-blue-600" asChild>
            <Link href={href}>{uiStrings.readMore[locale]}</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
