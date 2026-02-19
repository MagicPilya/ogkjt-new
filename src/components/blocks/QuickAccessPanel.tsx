"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Clock, Eye, UserCheck, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isValidLocale } from "@/lib/i18n";

const items = [
    {
        title: "Расписание",
        icon: Clock,
        href: "/students/day",
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900"
    },
    {
        title: "Одно окно",
        icon: FileText,
        href: "/one-window",
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900"
    },
    {
        title: "Приемная",
        icon: UserCheck,
        href: "/applicants",
        color: "text-purple-600",
        bg: "bg-purple-50 dark:bg-purple-900"
    },
    {
        title: "Слабовидящим",
        icon: Eye,
        href: "#",
        color: "text-slate-600",
        bg: "bg-slate-100 dark:bg-slate-800"
    }
];

export function QuickAccessPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const seg = pathname.split("/").filter(Boolean)[0];
  const locale = seg && isValidLocale(seg) ? seg : null;
  const href = (url: string) => (url === "#" ? "#" : locale ? `/${locale}${url}` : url);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Раскрывающееся меню */}
      <div
        className={cn(
          "flex flex-col items-end gap-3 transition-all duration-300 ease-in-out origin-bottom-right",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-10 pointer-events-none"
        )}
      >
        {items.map((item, index) => (
          <Link
            key={index}
            href={href(item.href)}
                        className="flex items-center gap-3 group"
                        onClick={() => setIsOpen(false)} // Закрываем при клике
                    >
                        <span className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg shadow-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-200 whitespace-nowrap">
                            {item.title}
                        </span>
                        <div 
                            className={cn(
                                "h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 border border-slate-100 dark:border-slate-800",
                                item.bg,
                                item.color
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Главная кнопка (Триггер) */}
            <Button
                size="icon"
                className={cn(
                    "h-14 w-14 rounded-full shadow-xl transition-all duration-300 hover:scale-105",
                    isOpen ? "bg-slate-800 hover:bg-slate-900 rotate-90" : "bg-blue-600 hover:bg-blue-700 rotate-0"
                )}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Быстрый доступ"
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <Zap className="h-6 w-6 text-white animate-pulse" />
                )}
            </Button>
        </div>
    );
}
