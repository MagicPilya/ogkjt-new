import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { getArticles } from "@/lib/strapi";
import { formatDate, getStrapiMedia } from "@/lib/utils";

export async function NewsGrid() {
    const { data: articles } = await getArticles(1, 3);

    // В Strapi 5 дата публикации - publishedAt, а поле date мы создали сами вручную.
    // Переносим логику внутрь map, так как item доступен только там.

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col items-center mb-8 text-center relative">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Последние новости
                </h2>
                <Button variant="ghost" className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2" asChild>
                    <Link href="/news">
                        Все новости <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {articles.map((item) => {
                    const imageUrl = getStrapiMedia(item.cover?.url || null);
                    const displayDate = item.date || item.publishedAt || item.createdAt;
                    
                    return (
                        <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow h-full">
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
                                <div className="flex items-center text-sm text-slate-500 mb-2">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {formatDate(displayDate)}
                                </div>
                                <CardTitle className="line-clamp-2 hover:text-blue-600 transition-colors text-lg">
                                    <Link href={`/news/${item.slug}`}>
                                        {item.title}
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-slate-600 dark:text-slate-400 line-clamp-3 text-sm">
                                    {item.announcement}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-8 text-center sm:hidden">
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/news">Все новости</Link>
                </Button>
            </div>
        </div>
    );
}
