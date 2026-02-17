import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="hero-bg absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("/images/Building.JPG")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-slate-900/70" />
            </div>

            {/* Content */}
            <div className="container mx-auto relative z-10 text-center text-white animate-in fade-in zoom-in duration-1000 px-4 sm:px-6">
                <span className="hidden md:inline-block py-1 px-4 md:px-5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm">
                    Филиал БелГУТа
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight max-w-4xl mx-auto leading-tight mt-4 md:mt-0">
                    Оршанский колледж — филиал учреждения образования <br className="hidden md:block" />
                    <span className="text-blue-400">«Белорусский государственный университет транспорта»</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Качественное образование. Гарантированное трудоустройство. Уверенное будущее.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg h-14 px-8 shadow-lg shadow-blue-900/20" asChild>
                        <Link href="/applicants/documents">Подать документы</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg h-14 px-8 bg-transparent hover:bg-white/10 border-white/30 text-white hover:text-white backdrop-blur-sm" asChild>
                        <Link href="/applicants/specialties">Наши специальности</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
