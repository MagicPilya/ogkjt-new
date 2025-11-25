import { Logo } from "./Logo";
import { GlobalSettings } from "@/lib/strapi";
import Link from "next/link";
import { Instagram, Send, Video } from "lucide-react";

interface FooterProps {
    settings?: GlobalSettings | null;
}

export function Footer({ settings }: FooterProps) {
    const address = settings?.address || "г. Орша, ул. Ленина, 1";
    const phoneReception = settings?.phoneReception || "+375 (216) 51-23-45";
    const phoneDirector = settings?.phoneDirector;
    const email = settings?.email || "info@ogkjt.by";

    return (
        <footer className="bg-slate-50 border-t dark:bg-slate-950">
            <div className="container py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Logo />
                        <p className="mt-4 text-sm text-slate-500">
                            Подготовка квалифицированных специалистов для железнодорожного транспорта.
                        </p>
                        
                        {/* Social Links */}
                        <div className="flex gap-4 mt-6">
                            {settings?.instagramLink && (
                                <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors">
                                    <Instagram className="h-5 w-5" />
                                    <span className="sr-only">Instagram</span>
                                </a>
                            )}
                            {settings?.telegramLink && (
                                <a href={settings.telegramLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors">
                                    <Send className="h-5 w-5" />
                                    <span className="sr-only">Telegram</span>
                                </a>
                            )}
                            {settings?.tiktokLink && (
                                <a href={settings.tiktokLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-black dark:hover:text-white transition-colors">
                                    <Video className="h-5 w-5" />
                                    <span className="sr-only">TikTok</span>
                                </a>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Навигация</h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li><Link href="/about" className="hover:text-blue-600">О колледже</Link></li>
                            <li><Link href="/news" className="hover:text-blue-600">Новости</Link></li>
                            <li><Link href="/applicants" className="hover:text-blue-600">Абитуриентам</Link></li>
                            <li><Link href="/one-window" className="hover:text-blue-600">Одно окно</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Ресурсы</h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li><a href="https://president.gov.by" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Сайт Президента РБ</a></li>
                            <li><a href="https://edu.gov.by" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Министерство образования</a></li>
                            <li><a href="https://rw.by" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Белорусская железная дорога</a></li>
                            <li><a href="https://обращения.бел" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Обращения.бел</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Контакты</h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li>{address}</li>
                            <li>
                                <span className="block text-xs text-slate-400">Приемная:</span>
                                <a href={`tel:${phoneReception}`} className="hover:text-blue-600">{phoneReception}</a>
                            </li>
                            {phoneDirector && (
                                <li>
                                    <span className="block text-xs text-slate-400">Директор:</span>
                                    <a href={`tel:${phoneDirector}`} className="hover:text-blue-600">{phoneDirector}</a>
                                </li>
                            )}
                            <li>
                                <a href={`mailto:${email}`} className="hover:text-blue-600">{email}</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} Оршанский колледж - филиал БелГУТ. Все права защищены.
                </div>
            </div>
        </footer>
    );
}
