import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { collegeNamesFallback } from "@/lib/site-defaults";
import { uiStrings } from "@/lib/ui-strings";

interface HeroProps {
  locale?: Locale;
  collegeShortName?: string | null;
  collegeFullName?: string | null;
  universityName?: string | null;
}

export function Hero({
  locale = "ru",
  collegeShortName,
  collegeFullName,
  universityName,
}: HeroProps) {
  const base = locale ? `/${locale}` : "";
  const fallback = collegeNamesFallback[locale];
  const shortName = collegeShortName || fallback.short;
  const fullName = collegeFullName || fallback.full;
  const university = universityName || fallback.university;

  const quotedMatch = fullName.match(/[«"](.*?)[»"]/);
  let prefixText = fullName;
  let highlightedText: string | null = null;
  let suffixText = "";

  if (quotedMatch && typeof quotedMatch.index === "number") {
    prefixText = fullName.slice(0, quotedMatch.index).trimEnd();
    highlightedText = quotedMatch[0];
    suffixText = fullName.slice(quotedMatch.index + quotedMatch[0].length);
  } else {
    const idx = fullName.indexOf(university);
    if (idx >= 0) {
      prefixText = fullName.slice(0, idx).trimEnd();
      highlightedText = university;
      suffixText = fullName.slice(idx + university.length);
    }
  }

  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden hero-section">
      {/* Background Image with Overlay */}
      <div
        className="hero-bg absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/images/Building.JPG")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-slate-900/70" />
      </div>

      {/* Content */}
      <div className="container mx-auto relative z-10 text-center text-white animate-in fade-in zoom-in duration-1000 px-4 sm:px-6">
        <span className="hidden md:inline-block py-1 px-4 md:px-5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm">
          {shortName}
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight max-w-4xl mx-auto leading-tight mt-4 md:mt-0 break-words [overflow-wrap:anywhere]">
          {highlightedText ? (
            <>
              {prefixText}
              <br className="md:hidden" />
              <br className="hidden md:block" />
              <span className="text-blue-400">{highlightedText}</span>
              {suffixText}
            </>
          ) : (
            fullName
          )}
        </h1>
        <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed break-words [overflow-wrap:anywhere]">
          {uiStrings.heroSubtitle[locale]}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center hero-touch-targets">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg min-h-[44px] min-w-[44px] px-8 shadow-lg shadow-blue-900/20 touch-manipulation" asChild>
            <Link href={`${base}/applicants/documents`}>{uiStrings.heroApplyDocuments[locale]}</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg min-h-[44px] min-w-[44px] px-8 bg-transparent hover:bg-white/10 border-white/30 text-white hover:text-white backdrop-blur-sm touch-manipulation" asChild>
            <Link href={`${base}/applicants/specialties`}>{uiStrings.heroSpecialties[locale]}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
