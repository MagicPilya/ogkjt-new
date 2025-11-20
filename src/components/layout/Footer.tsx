import { Logo } from "./Logo";

export function Footer() {
    return (
        <footer className="bg-slate-50 border-t dark:bg-slate-950">
            <div className="container py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Logo />
                        <p className="mt-4 text-sm text-slate-500">
                            Подготовка квалифицированных специалистов для железнодорожного транспорта.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Навигация</h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li><a href="/about" className="hover:text-blue-600">О колледже</a></li>
                            <li><a href="/news" className="hover:text-blue-600">Новости</a></li>
                            <li><a href="/contacts" className="hover:text-blue-600">Контакты</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Ресурсы</h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li><a href="#" className="hover:text-blue-600">Сайт Президента РБ</a></li>
                            <li><a href="#" className="hover:text-blue-600">Министерство образования</a></li>
                            <li><a href="#" className="hover:text-blue-600">Белорусская железная дорога</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Контакты</h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li>г. Минск, ул. Семашко, 3</li>
                            <li>+375 (17) 123-45-67</li>
                            <li>info@college.by</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} Минский государственный железнодорожный колледж. Все права защищены.
                </div>
            </div>
        </footer>
    );
}
