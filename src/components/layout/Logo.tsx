import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    /** Вариант для футера: крупнее и по центру */
    variant?: "default" | "footer";
}

export function Logo({ className, variant = "default" }: LogoProps) {
    const isFooter = variant === "footer";
    return (
        <Link
            href="/"
            className={cn(
                "flex items-center gap-2 hover:opacity-90 transition-opacity",
                isFooter && "flex-col items-center text-center gap-3",
                className
            )}
        >
            <img
                src="/icons/logo.png"
                alt="Логотип Оршанский колледж"
                className={cn(
                    "object-contain",
                    isFooter ? "h-32 w-56 md:h-36 md:w-64" : "h-20 w-20"
                )}
            />
            <div className={cn("flex flex-col leading-none", isFooter && "items-center")}>
                <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                    Оршанский колледж –
                </span>
                <span className="text-xs text-slate-500 font-medium">
                    Филиал БелГУТа
                </span>
            </div>
        </Link>
    );
}
