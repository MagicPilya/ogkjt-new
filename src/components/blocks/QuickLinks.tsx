import Link from "next/link";
import { quickLinks } from "@/lib/mock-data";
import { ArrowRight } from "lucide-react";

export function QuickLinks() {
    return (
        <section className="py-16 bg-slate-100 dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-10 text-center">
                    Полезная информация
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href}
                            className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full ${link.color}`} />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 transition-colors">
                                {link.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                                {link.description}
                            </p>
                            <div className="flex items-center text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                                Перейти <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
