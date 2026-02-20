import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, MapPin, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventById } from "@/lib/strapi";
import { getEventForLocale } from "@/lib/translateEvent";
import { formatDate } from "@/lib/utils";
import { FileViewer } from "@/components/ui/file-viewer";
import { uiStrings } from "@/lib/ui-strings";
import type { Locale } from "@/lib/i18n";

interface Props {
  params: Promise<{ locale: Locale; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const result = await getEventForLocale(getEventById, id, locale);

  if (!result) {
    return { title: uiStrings.eventNotFound[locale] };
  }

  return {
    title: `${result.event.title} | МГЖК`,
    description: result.event.location || undefined,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id, locale } = await params;
  const result = await getEventForLocale(getEventById, id, locale);

  if (!result) notFound();

  const event = result.event;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex justify-center mb-8">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-blue-600"
          asChild
        >
          <Link href={`/${locale}/news`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {uiStrings.backToNews[locale]}
          </Link>
        </Button>
      </div>

      <article>
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center text-sm text-slate-500 mb-4 gap-3 flex-wrap">
            <span className="inline-flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {formatDate(event.date, locale)}
            </span>
            {event.location && (
              <span className="inline-flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                {event.location}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
            {event.title}
          </h1>
        </div>

        {event.file && (
          <div className="mb-8 flex justify-center">
            <FileViewer
              file={event.file}
              locale={locale}
              trigger={
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  {uiStrings.openAttachedFile[locale]}
                </Button>
              }
            />
          </div>
        )}

        <div className="prose prose-slate dark:prose-invert max-w-none lg:prose-lg">
          {Array.isArray(event.description) && event.description.length > 0 ? (
            event.description.map((block: any, index: number) => {
              if (block.type === "paragraph") {
                return (
                  <p key={index}>
                    {block.children.map((child: any, childIndex: number) => {
                      if (child.type === "text") {
                        let text: React.ReactNode = child.text;
                        if (child.bold) text = <strong key={childIndex}>{text}</strong>;
                        if (child.italic) text = <em key={childIndex}>{text}</em>;
                        if (child.underline) text = <u key={childIndex}>{text}</u>;
                        return <span key={childIndex}>{text}</span>;
                      }
                      return null;
                    })}
                  </p>
                );
              }
              if (block.type === "heading") {
                const level = Number(block.level);
                const safeLevel = Number.isInteger(level) && level >= 1 && level <= 6 ? level : 3;
                const headingText = block.children.map((child: any) => child.text).join("");
                if (safeLevel === 1) return <h1 key={index}>{headingText}</h1>;
                if (safeLevel === 2) return <h2 key={index}>{headingText}</h2>;
                if (safeLevel === 3) return <h3 key={index}>{headingText}</h3>;
                if (safeLevel === 4) return <h4 key={index}>{headingText}</h4>;
                if (safeLevel === 5) return <h5 key={index}>{headingText}</h5>;
                return <h6 key={index}>{headingText}</h6>;
              }
              if (block.type === "list") {
                const items = block.children.map((item: any, itemIndex: number) => (
                  <li key={itemIndex}>
                    {item.children.map((child: any) => child.text).join("")}
                  </li>
                ));
                return block.format === "ordered" ? (
                  <ol key={index}>{items}</ol>
                ) : (
                  <ul key={index}>{items}</ul>
                );
              }
              return null;
            })
          ) : (
            <p className="text-slate-600 dark:text-slate-300">
              {uiStrings.eventDescriptionEmpty[locale]}
            </p>
          )}
        </div>
      </article>
    </div>
  );
}
