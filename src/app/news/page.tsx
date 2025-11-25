import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getArticles } from "@/lib/strapi";
import { formatDate, getStrapiMedia } from "@/lib/utils";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Новости | Минский государственный железнодорожный колледж",
    description: "Последние новости и события МГЖК.",
};

export default async function NewsPage() {
    const { data: articles } = await getArticles(1, 50); // Fetch more articles for the main list

    return (
        <div className="container py-12">
            <div className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
                    Новости колледжа
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                    Будьте в курсе последних событий, достижений наших студентов и важных объявлений.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((item) => {
                    const imageUrl = getStrapiMedia(item.cover?.url || null);

                    return (
                        <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt={item.cover?.alternativeText || item.title}
                                        fill
                                        unoptimized
                                        className="object-cover hover:scale-105 transition-transform duration-300"
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
                            <CardFooter>
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
    );
}
