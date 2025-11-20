import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1474487548417-781cb714c223?q=80&w=2070&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-slate-900/60 bg-gradient-to-t from-slate-900/90 to-transparent" />
            </div>

            {/* Content */}
            <div className="container relative z-10 text-center text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                    Путь к успешной карьере <br /> начинается здесь
                </h1>
                <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
                    Минский государственный железнодорожный колледж — ведущее учебное заведение по подготовке специалистов для транспортной отрасли.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg h-12 px-8" asChild>
                        <Link href="/applicants">Поступающим</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg h-12 px-8 bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white" asChild>
                        <Link href="/about">О колледже</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
