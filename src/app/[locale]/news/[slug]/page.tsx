import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Languages, FileDown } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { getArticleBySlugOrDocumentId } from "@/lib/strapi";
import { getArticleForLocale } from "@/lib/translateArticle";
import { formatDate, getStrapiMedia, getStrapiMediaWithFormats } from "@/lib/utils";
import { ContentBlocks } from "@/components/blocks/ContentBlocks";
import { MediaSlider, type MediaItem } from "@/components/blocks/MediaSlider";
import { translationDisclaimer, type Locale } from "@/lib/i18n";
import { uiStrings } from "@/lib/ui-strings";

interface Props {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  if (!slug || slug === "null") {
    return { title: "404" };
  }
  const result = await getArticleForLocale(getArticleBySlugOrDocumentId, slug, locale);

  if (!result) {
    return { title: "Новость не найдена" };
  }

  return {
    title: `${result.article.title} | МГЖК`,
    description: result.article.announcement,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug, locale } = await params;
  if (!slug || slug === "null") notFound();
  if (locale !== "ru") {
    redirect(`/ru/news/${slug}`);
  }

  const result = await getArticleForLocale(getArticleBySlugOrDocumentId, slug, locale);

  if (!result) notFound();

  const { article: item, isTranslated } = result;
  const imageUrl = getStrapiMediaWithFormats(item.cover, ["large", "medium", "small"]);
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
          <Link href={`/${locale}/news`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {uiStrings.backToNews[locale]}
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

        <div className="relative h-[400px] w-full overflow-hidden rounded-xl mb-10 bg-slate-100">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={item.cover?.alternativeText || item.title}
              loading="eager"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {mediaList.length > 0 && (
          <div className="mb-10">
            <MediaSlider items={mediaList} height="400px" />
          </div>
        )}

        <div className="prose prose-slate dark:prose-invert max-w-none lg:prose-lg">
          <p className="lead text-xl text-slate-600 dark:text-slate-300 mb-6">
            {item.announcement}
          </p>
          <ContentBlocks blocks={item.content ?? undefined} />
        </div>

        {attachments.length > 0 && (
          <section className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-800" aria-label={uiStrings.attachments[locale]}>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {uiStrings.attachments[locale]}
            </h2>
            <ul className="space-y-3">
              {attachments.map((file, index) => {
                const fileUrl = file?.url ? getStrapiMedia(file.url) : null;
                if (!fileUrl) return null;
                const label = file.name || file.alternativeText || `${uiStrings.download[locale]} ${index + 1}`;
                return (
                  <li key={file.id ?? index}>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 text-blue-600 transition hover:underline dark:text-blue-400"
                    >
                      <FileDown className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
