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
    <Card className={`flex flex-col overflow-hidden hover:shadow-lg transition-shadow ${centered ? "text-center" : "h-full"}`}>
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={article.cover?.alternativeText || article.title}
            loading="lazy"
            className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            {uiStrings.noPhoto[locale]}
          </div>
        )}
      </div>
      <CardHeader>
        <div className={`flex items-center text-sm text-slate-500 mb-2 ${centered ? "justify-center" : ""}`}>
          <Calendar className="mr-2 h-4 w-4" />
          {formatDate(displayDate, locale)}
        </div>
        <CardTitle className={`line-clamp-2 hover:text-blue-600 transition-colors ${centered ? "" : "text-lg"}`}>
          <Link href={href}>{article.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className={`text-slate-600 dark:text-slate-400 line-clamp-3 ${centered ? "" : "text-sm"}`}>
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
