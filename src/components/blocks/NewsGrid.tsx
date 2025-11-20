import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { news } from "@/lib/mock-data";

export function NewsGrid() {
    return (
        <section className="py-16 container">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Последние новости
                </h2>
                <Button variant="ghost" className="hidden sm:flex" asChild>
                    <Link href="/news">
                        Все новости <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                    <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-48 w-full overflow-hidden">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <CardHeader>
                            <div className="flex items-center text-sm text-slate-500 mb-2">
                                <Calendar className="mr-2 h-4 w-4" />
                                {item.date}
                            </div>
                            <CardTitle className="line-clamp-2 hover:text-blue-600 transition-colors">
                                <Link href={`/news/${item.slug}`}>
                                    {item.title}
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-slate-600 dark:text-slate-400 line-clamp-3">
                                {item.description}
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
                ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/news">Все новости</Link>
                </Button>
            </div>
        </section>
    );
}
