import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Languages } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import SectionPage, { getSectionPageMetadata } from "@/components/layout/SectionPage";
import { getArticleForLocale } from "@/lib/translateArticle";
import { formatDate } from "@/lib/utils";
import { ContentBlocks } from "@/components/blocks/ContentBlocks";
import { MediaSlider, type MediaItem } from "@/components/blocks/MediaSlider";
import { PageFiles } from "@/components/blocks/PageFiles";
import { translationDisclaimer, type Locale } from "@/lib/i18n";
import { IDEOLOGY_PATH, isIdeologySubsectionSlug, ideologyLabels } from "@/lib/ideology";
import { getMenu } from "@/lib/strapi";
import { getIdeologyItemBySlugOrDocumentId } from "@/lib/strapi/ideology";
import { normalizeMenu } from "@/lib/menu-sections";

interface Props {
  params: Promise<{ locale: Locale; slug: string }>;
}

async function isSubsectionPage(slug: string, locale: Locale) {
  const menuData = await getMenu(locale);
  const menu = normalizeMenu(menuData?.mainMenu, locale) ?? [];
  return isIdeologySubsectionSlug(slug, menu);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;

  if (await isSubsectionPage(slug, locale)) {
    return getSectionPageMetadata(`${IDEOLOGY_PATH}/${slug}`, locale);
  }

  if (!slug || slug === "null") {
    return { title: "404" };
  }

  const result = await getArticleForLocale(getIdeologyItemBySlugOrDocumentId, slug, locale);
  if (!result) {
    return { title: "Материал не найден" };
  }

  return {
    title: `${result.article.title} | МГЖК`,
  };
}

export default async function IdeologySlugPage({ params }: Props) {
  const { slug, locale } = await params;

  if (await isSubsectionPage(slug, locale)) {
    return <SectionPage path={`${IDEOLOGY_PATH}/${slug}`} locale={locale} />;
  }

  if (!slug || slug === "null") notFound();

  const result = await getArticleForLocale(getIdeologyItemBySlugOrDocumentId, slug, locale);
  if (!result) notFound();

  const { article: item, isTranslated } = result;
  const labels = ideologyLabels[locale];
  const mediaList: MediaItem[] = Array.isArray(item.media)
    ? item.media
    : ((item as { Media?: MediaItem[] }).Media ?? []);
  const attachments = Array.isArray(item.files) ? item.files : [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {isTranslated && (
        <div
          className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
          role="note"
          aria-label={translationDisclaimer[locale]}
        >
          <Languages className="h-4 w-4 shrink-0" />
          <span>{translationDisclaimer[locale]}</span>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-blue-600" asChild>
          <Link href={`/${locale}/${IDEOLOGY_PATH}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {labels.back}
          </Link>
        </Button>
      </div>

      <article>
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center text-sm text-slate-500 mb-4">
            <Calendar className="mr-2 h-4 w-4" />
            {item.date ? formatDate(item.date, locale) : "Без даты"}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6">
            {item.title}
          </h1>
        </div>

        <MediaSlider items={item.cover ? [item.cover] : null} height="400px" className="mb-10" />

        {mediaList.length > 0 && (
          <section className="mb-10 mt-14 border-t border-slate-200 pt-8 dark:border-slate-800" aria-label="Фотогалерея">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Фотогалерея</h2>
            <MediaSlider items={mediaList} height="340px" />
          </section>
        )}

        <div className="prose prose-slate dark:prose-invert max-w-none lg:prose-lg">
          <ContentBlocks blocks={item.content ?? undefined} />
        </div>

        {attachments.length > 0 && <PageFiles files={attachments} locale={locale} className="mt-10" />}
      </article>
    </div>
  );
}
