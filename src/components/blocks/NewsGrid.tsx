import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getArticles } from "@/lib/strapi";
import { getArticlesForLocale } from "@/lib/translateArticle";
import { uiStrings } from "@/lib/ui-strings";
import type { Locale } from "@/lib/i18n";
import { ArticleCard } from "@/components/blocks/ArticleCard";

export async function NewsGrid({ locale }: { locale?: Locale }) {
  const loc = locale ?? "ru";
  const { data: articles } = await getArticlesForLocale(getArticles, 1, 6, null, loc);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col items-center mb-8 text-center relative">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {uiStrings.newsSectionTitle[loc]}
        </h2>
        <Button variant="ghost" className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 touch-manipulation min-h-[44px]" asChild>
          <Link href={`/${loc}/news`}>
            {uiStrings.allNews[loc]} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {articles.map((item) => {
          const articlePath = item.slug || item.documentId;

          return (
            <ArticleCard
              key={item.id}
              article={item}
              locale={loc}
              href={`/${loc}/news/${articlePath}`}
            />
          );
        })}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Button variant="outline" className="w-full min-h-[44px] touch-manipulation" asChild>
          <Link href={`/${loc}/news`}>{uiStrings.allNews[loc]}</Link>
        </Button>
      </div>
    </div>
  );
}
