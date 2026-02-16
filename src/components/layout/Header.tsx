"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Search, Eye, Phone, ChevronDown } from "lucide-react";
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
import { Logo } from "./Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

import { MenuSection } from "@/lib/strapi";
import { defaultMenu } from "@/lib/menu-sections";

interface HeaderProps {
    initialMenu?: MenuSection[] | null;
}

export function Header({ initialMenu }: HeaderProps) {
    const menuItems = initialMenu || defaultMenu;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-slate-950 shadow-sm">
            {/* Уровень 1: Служебный функционал */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b py-2">
                <div className="w-full px-4 md:px-8 flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                        <span className="hidden md:inline-block">Оршанский колледж - филиал учреждения образования «Белорусский государственный университет транспорта»</span>
                        <span className="md:hidden">Оршанский колледж - филиал БелГУТа</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <ThemeToggle />
                        <Button variant="ghost" size="sm" className="h-8 text-slate-600 dark:text-slate-300">
                            <Search className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Поиск</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-slate-600 dark:text-slate-300">
                            <Eye className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Версия для слабовидящих</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Уровень 2: Лого и Главное меню */}
            <div className="w-full px-4 md:px-8 relative flex h-24 items-center">
                <div className="flex items-center gap-8 shrink-0 z-10">
                    <Link href="/" className="flex items-center gap-4 group">
                        {/* Логотип */}
                        <div className="h-14 w-14 relative bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl group-hover:bg-blue-700 transition-colors shrink-0">
                        <TrainFront size={36} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl leading-tight text-slate-900 dark:text-white group-hover:text-blue-700 transition-colors">
                                Оршанский колледж –
                            </span>
                            <span className="text-sm text-slate-500 font-medium">филиал БелГУТа</span>
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
                                                    href={item.url || "#"}
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
                                                                href={item.url || "#"}
                                                                className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground font-medium text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800"
                                                            >
                                                                Обзор раздела
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    </li>
                                                    {item.links.map((subItem) => (
                                                        <li key={subItem.id}>
                                                            <NavigationMenuLink asChild>
                                                                <Link
                                                                    href={subItem.url}
                                                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                                >
                                                                    <div className="text-sm font-medium leading-none">{subItem.title}</div>
                                                                </Link>
                                                            </NavigationMenuLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </NavigationMenuContent>
                                        </>
                                    ) : (
                                        <NavigationMenuLink asChild>
                                            <Link 
                                                href={item.url || "#"} 
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
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" suppressHydrationWarning>
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Меню</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto px-6">
                            <SheetTitle className="sr-only">Меню навигации</SheetTitle>
                            <div className="flex flex-col gap-6 mt-8">
                             {menuItems.map((item) => (
                                <div key={item.id} className="flex flex-col gap-2">
                                    {item.links && item.links.length > 0 ? (
                                        <>
                                            <Link
                                                href={item.url || "#"}
                                                className="font-bold text-lg text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-1"
                                            >
                                                {item.title}
                                            </Link>
                                            <div className="pl-4 flex flex-col gap-3 border-l-2 border-slate-100 dark:border-slate-800">
                                                {item.links.map((subItem) => (
                                                    <Link 
                                                        key={subItem.id} 
                                                        href={subItem.url}
                                                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                                                    >
                                                        {subItem.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <Link 
                                            href={item.url || "#"}
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
