import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, MapPin, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventById } from "@/lib/strapi";
import { formatDate } from "@/lib/utils";
import { FileViewer } from "@/components/ui/file-viewer";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return {
      title: "Событие не найдено",
    };
  }

  return {
    title: `${event.title} | МГЖК`,
    description: event.location || undefined,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.date);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex justify-center mb-8">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-blue-600"
          asChild
        >
          <Link href="/news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к новостям
          </Link>
        </Button>
      </div>

      <article>
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center text-sm text-slate-500 mb-4 gap-3 flex-wrap">
            <span className="inline-flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {formatDate(event.date)}
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
              trigger={
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Открыть вложенный файл
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
                        if (child.bold) {
                          text = <strong key={childIndex}>{text}</strong>;
                        }
                        if (child.italic) {
                          text = <em key={childIndex}>{text}</em>;
                        }
                        if (child.underline) {
                          text = <u key={childIndex}>{text}</u>;
                        }
                        return <span key={childIndex}>{text}</span>;
                      }
                      return null;
                    })}
                  </p>
                );
              }

              if (block.type === "heading") {
                const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
                return (
                  <Tag key={index}>
                    {block.children
                      .map((child: any) => child.text)
                      .join("")}
                  </Tag>
                );
              }

              if (block.type === "list") {
                const ListTag = block.format === "ordered" ? "ol" : "ul";
                return (
                  <ListTag key={index}>
                    {block.children.map((item: any, itemIndex: number) => (
                      <li key={itemIndex}>
                        {item.children
                          .map((child: any) => child.text)
                          .join("")}
                      </li>
                    ))}
                  </ListTag>
                );
              }

              return null;
            })
          ) : (
            <p className="text-slate-600 dark:text-slate-300">
              Описание события пока не добавлено.
            </p>
          )}
        </div>
      </article>
    </div>
  );
}

