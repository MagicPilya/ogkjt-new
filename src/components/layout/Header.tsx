"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { TrainFront } from "lucide-react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuContent,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LowVisionToggle } from "@/components/theme/LowVisionToggle";
import { SearchDialog } from "./SearchDialog";
import { LocaleSwitcher } from "./LocaleSwitcher";

import { GlobalSettings, MenuSection } from "@/lib/strapi";
import type { Locale } from "@/lib/i18n";
import { collegeNamesFallback } from "@/lib/site-defaults";
import { uiStrings } from "@/lib/ui-strings";

interface HeaderProps {
  initialMenu?: MenuSection[] | null;
  settings?: GlobalSettings | null;
  locale?: Locale;
  yearThemeMenuItem?: { title: string; url: string } | null;
}

export function Header({ initialMenu, settings, locale = "ru", yearThemeMenuItem }: HeaderProps) {
  const menuItems = React.useMemo(() => {
    const baseItems = [...(initialMenu ?? [])];
    if (!yearThemeMenuItem) return baseItems;
    const exists = baseItems.some((item) => item.url === yearThemeMenuItem.url);
    if (exists) return baseItems;
    return [
      ...baseItems,
      {
        id: Number.MAX_SAFE_INTEGER,
        title: yearThemeMenuItem.title,
        url: yearThemeMenuItem.url,
        links: [],
      },
    ];
  }, [initialMenu, yearThemeMenuItem]);
  const fallback = collegeNamesFallback[locale];
  const fullCollegeName = settings?.collegeFullName || collegeNamesFallback[locale].full;
  const shortCollegeName = settings?.collegeShortName || collegeNamesFallback[locale].short;
  const logoLine1 = settings?.collegeMainName || fallback.main;
  const logoLine2 = settings?.collegeBranchShortName || fallback.branchShort;
  const prefix = (url: string) => (url?.startsWith("/") ? `/${locale}${url}` : `/${locale}/${url}` || `/${locale}`);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const closeMobileMenu = React.useCallback(() => setMobileMenuOpen(false), []);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-slate-950 shadow-sm">
            {/* Уровень 1: Служебный функционал */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b py-2">
                <div className="w-full px-4 md:px-8 flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                        <span className="hidden md:inline-block">{fullCollegeName}</span>
                        <span className="md:hidden">{shortCollegeName}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <LocaleSwitcher currentLocale={locale} />
                        <ThemeToggle locale={locale} />
                        <SearchDialog locale={locale} />
                        <LowVisionToggle locale={locale} />
                    </div>
                </div>
            </div>

            {/* Уровень 2: Лого и Главное меню */}
            <div className="w-full px-4 md:px-8 relative flex h-24 items-center">
                <div className="flex items-center gap-8 shrink-0 z-10">
                    <Link href={prefix("/")} className="flex items-center gap-4 group">
                        {/* Логотип */}
                        <div className="h-14 w-14 relative bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl group-hover:bg-blue-700 transition-colors shrink-0">
                        <TrainFront size={36} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl leading-tight text-slate-900 dark:text-white group-hover:text-blue-700 transition-colors">
                                {logoLine1}
                            </span>
                            <span className="text-sm text-slate-500 font-medium">{logoLine2}</span>
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation - Centered */}
                <div className="hidden xl:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <NavigationMenu viewport={false} delayDuration={0} skipDelayDuration={0}>
                        <NavigationMenuList>
                            {menuItems.map((item) => (
                                <NavigationMenuItem key={item.id}>
                                    {item.links && item.links.length > 0 ? (
                                        <>
                                            <NavigationMenuTrigger asChild>
                                                <Link
                                                    href={prefix(item.url || "#")}
                                                    className={cn(
                                                        navigationMenuTriggerStyle(),
                                                        "text-base font-medium bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2"
                                                    )}
                                                >
                                                    {item.title}
                                                    <ChevronDown className="relative top-[1px] ml-1 size-3 transition duration-150 group-data-[state=open]:rotate-180" aria-hidden />
                                                </Link>
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                                    <li className="md:col-span-2">
                                                        <NavigationMenuLink asChild>
                                                            <Link
                                                                href={prefix(item.url || "#")}
                                                                className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground font-medium text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800"
                                                            >
                                                                {locale === "be"
                                                                  ? "Агляд раздзела"
                                                                  : locale === "en"
                                                                    ? "Section overview"
                                                                    : "Обзор раздела"}
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    </li>
                                                    {item.links.map((subItem) => (
                                                        <li key={subItem.id} className="space-y-1">
                                                            <NavigationMenuLink asChild>
                                                                <Link
                                                                    href={prefix(subItem.url)}
                                                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                                >
                                                                    <div className="text-sm font-medium leading-none">{subItem.title}</div>
                                                                </Link>
                                                            </NavigationMenuLink>
                                                            {subItem.sublinks && subItem.sublinks.length > 0 && (
                                                                <ul className="pl-3 ml-2 border-l border-slate-200 dark:border-slate-700 space-y-1">
                                                                    {subItem.sublinks.map((subSubItem) => (
                                                                        <li key={subSubItem.id}>
                                                                            <NavigationMenuLink asChild>
                                                                                <Link
                                                                                    href={prefix(subSubItem.url)}
                                                                                    className="block select-none rounded-md py-2 px-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-xs text-muted-foreground hover:text-foreground"
                                                                                >
                                                                                    {subSubItem.title}
                                                                                </Link>
                                                                            </NavigationMenuLink>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </NavigationMenuContent>
                                        </>
                                    ) : (
                                        <NavigationMenuLink asChild>
                                            <Link 
                                                href={prefix(item.url || "#")} 
                                                className={cn(navigationMenuTriggerStyle(), "text-base font-medium bg-transparent")}
                                            >
                                                {item.title}
                                            </Link>
                                        </NavigationMenuLink>
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Mobile Menu Button */}
                <div className="xl:hidden shrink-0 ml-auto">
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" suppressHydrationWarning>
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">{locale === "be" ? "Меню" : locale === "en" ? "Menu" : "Меню"}</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto px-6 pb-12">
                            <SheetTitle className="sr-only">{uiStrings.footerNavigation[locale]}</SheetTitle>
                            <div className="flex flex-col gap-6 mt-8">
                             {menuItems.map((item) => (
                                <div key={item.id} className="flex flex-col gap-2">
                                    {item.links && item.links.length > 0 ? (
                                        <>
                                            <Link
                                                href={prefix(item.url || "#")}
                                                onClick={closeMobileMenu}
                                                className="font-bold text-lg text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-1"
                                            >
                                                {item.title}
                                            </Link>
                                            <div className="pl-4 flex flex-col gap-3 border-l-2 border-slate-100 dark:border-slate-800">
                                                {item.links.map((subItem) => (
                                                    <div key={subItem.id} className="flex flex-col gap-2">
                                                        <Link 
                                                            href={prefix(subItem.url)}
                                                            onClick={closeMobileMenu}
                                                            className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                                                        >
                                                            {subItem.title}
                                                        </Link>
                                                        {subItem.sublinks && subItem.sublinks.length > 0 && (
                                                            <div className="pl-3 flex flex-col gap-1.5 border-l-2 border-slate-200 dark:border-slate-700">
                                                                {subItem.sublinks.map((subSubItem) => (
                                                                    <Link 
                                                                        key={subSubItem.id} 
                                                                        href={prefix(subSubItem.url)}
                                                                        onClick={closeMobileMenu}
                                                                        className="text-slate-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                                                                    >
                                                                        {subSubItem.title}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <Link 
                                            href={prefix(item.url || "#")}
                                            onClick={closeMobileMenu}
                                            className="font-bold text-lg text-slate-900 dark:text-white hover:text-blue-600"
                                        >
                                            {item.title}
                                        </Link>
                                    )}
                                </div>
                             ))}
                        </div>
                    </SheetContent>
                </Sheet>
                </div>
            </div>
        </header>
    );
}
