import { Hero } from "@/components/blocks/Hero";
import { NewsGrid } from "@/components/blocks/NewsGrid";
import { Events } from "@/components/blocks/Events";
import { Features } from "@/components/blocks/Features";
import type { Locale } from "@/lib/i18n";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="flex flex-col min-h-screen">
      <Hero locale={locale} />
      <Features />

      <section className="py-16 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="w-full px-4 md:px-8 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
            <div className="lg:col-span-8 xl:col-span-9">
              <NewsGrid locale={locale} />
            </div>
            <div className="lg:col-span-4 xl:col-span-3">
              <Events locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
