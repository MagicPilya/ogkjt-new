import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getPageByPath, getArticles } from "@/lib/strapi";
import { formatDate, getStrapiMedia } from "@/lib/utils";
import { Events } from "@/components/blocks/Events";
import { ContentBlocks } from "@/components/blocks/ContentBlocks";

const SITE_TITLE = "Оршанский колледж – филиал БелГУТа";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageByPath("news");
  const pageTitle = pageData?.title ?? "Новости колледжа";
  const title = `${pageTitle} | ${SITE_TITLE}`;
  const description = pageData?.metaDescription ?? undefined;
  return { title, description };
}

export default async function NewsPage() {
  const pageData = await getPageByPath("news");
  const title = pageData?.title ?? "Новости колледжа";
  const feedSection = pageData?.articleFeedSection && pageData.articleFeedSection !== "Не показывать"
    ? pageData.articleFeedSection
    : "НОВОСТИ КОЛЛЕДЖА";
  const { data: rawArticles } = await getArticles(1, 50, feedSection);
  const articles = Array.isArray(rawArticles) ? rawArticles : [];

  return (
    <div className="w-full px-4 md:px-8 max-w-[1600px] mx-auto py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
          {title}
        </h1>
        {pageData?.content && pageData.content.length > 0 && (
          <div className="prose prose-slate dark:prose-invert max-w-2xl mx-auto text-left">
            <ContentBlocks blocks={pageData.content} className="text-lg text-slate-600 dark:text-slate-400" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {articles.map((item) => {
              const imageUrl = getStrapiMedia(item.cover?.url || null);
              return (
                <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow text-center">
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.cover?.alternativeText || item.title}
                        loading="lazy"
                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        Нет фото
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-center text-sm text-slate-500 mb-2">
                      <Calendar className="mr-2 h-4 w-4" />
                      {item.date ? formatDate(item.date) : "Без даты"}
                    </div>
                    <CardTitle className="line-clamp-2 hover:text-blue-600 transition-colors">
                      <Link href={`/news/${item.slug}`}>
                        {item.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-3">
                      {item.announcement}
                    </p>
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Button variant="link" className="p-0 h-auto font-semibold text-blue-600" asChild>
                      <Link href={`/news/${item.slug}`}>
                        Читать далее
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-3">
          <Events />
        </div>
      </div>
    </div>
  );
}
