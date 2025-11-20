import Link from "next/link";
import { TrainFront } from "lucide-react";

export function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
                <TrainFront size={24} />
            </div>
            <div className="flex flex-col leading-none">
                <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                    ЖД Колледж
                </span>
                <span className="text-xs text-slate-500 font-medium">
                    Минский государственный
                </span>
            </div>
        </Link>
    );
}
