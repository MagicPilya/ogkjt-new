import Link from "next/link";
import { TrainFront } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <Link
            href="/"
            className={cn(
                "flex items-center gap-2 hover:opacity-90 transition-opacity",
                className
            )}
        >
            <div className="bg-blue-600 p-2 rounded-lg text-white">
                <TrainFront size={24} />
            </div>
            <div className="flex flex-col leading-none">
                <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                    Оршанский колледж
                </span>
                <span className="text-xs text-slate-500 font-medium">
                    Филиал БелГУТа
                </span>
            </div>
        </Link>
    );
}
