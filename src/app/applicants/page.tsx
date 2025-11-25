import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getPageBySlug } from "@/lib/strapi";

export const metadata: Metadata = {
    title: "Абитуриентам | Минский государственный железнодорожный колледж",
    description: "Информация для поступающих: специальности, документы, сроки.",
};

export default async function ApplicantsPage() {
    const pageData = await getPageBySlug('applicants');

    return (
        <div className="container py-12">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
                    {pageData ? pageData.title : "Поступающим"}
                </h1>
                
                {/* Если есть контент из Strapi - выводим его */}
                {pageData?.content ? (
                    <div className="prose prose-slate dark:prose-invert max-w-3xl mx-auto text-left">
                         {/* Простой рендер блоков Strapi */}
                         {pageData.content.map((block: any, index: number) => {
                            if (block.type === 'paragraph') {
                                return <p key={index} className="text-lg text-slate-600 dark:text-slate-400 text-center">{block.children.map((c:any) => c.text).join('')}</p>;
                            }
                            return null;
                        })}
                    </div>
                ) : (
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Вся необходимая информация для поступления в Минский государственный железнодорожный колледж.
                    </p>
                )}
            </div>

            {/* Хардкодные красивые карточки остаются */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Документы
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                Заявление на имя директора
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                Документ об образовании (оригинал)
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                Медицинская справка
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                6 фотографий 3х4
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                Паспорт (предъявляется лично)
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Сроки приема
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-1">На основе общего базового образования (9 классов)</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Прием документов: с 20 июля по 3 августа
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">На основе общего среднего образования (11 классов)</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Прием документов: с 20 июля по 12 августа
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900">
                    <CardHeader>
                        <CardTitle className="text-blue-700 dark:text-blue-300">
                            Приемная комиссия
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p><strong>Адрес:</strong> г. Минск, ул. Семашко, 3</p>
                            <p><strong>Телефон:</strong> +375 (17) 123-45-67</p>
                            <p><strong>Email:</strong> priem@college.by</p>
                            <p><strong>Время работы:</strong> Пн-Сб, 9:00 - 18:00</p>
                        </div>
                        <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                            Задать вопрос
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Наши специальности</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        "Техническая эксплуатация подвижного состава",
                        "Организация перевозок и управление на железнодорожном транспорте",
                        "Автоматика и телемеханика",
                        "Электроснабжение на железнодорожном транспорте"
                    ].map((spec, i) => (
                        <div key={i} className="p-6 border rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-colors dark:hover:bg-blue-900/10 dark:hover:border-blue-800">
                            <h3 className="text-lg font-semibold mb-2">{spec}</h3>
                            <p className="text-slate-500 text-sm mb-4">Квалификация: Техник-электромеханик</p>
                            <Link href="#" className="text-blue-600 text-sm font-medium hover:underline">
                                Подробнее о специальности →
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
