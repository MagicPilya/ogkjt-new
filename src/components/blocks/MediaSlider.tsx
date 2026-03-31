"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getStrapiMedia, getStrapiMediaWithFormats } from "@/lib/utils";
import type { StrapiImage, StrapiFile } from "@/lib/strapi";

export type MediaItem = StrapiImage | StrapiFile | { url?: string; alternativeText?: string | null };

interface MediaSliderProps {
  items: MediaItem[] | null | undefined;
  className?: string;
  /** Высота контейнера, например "400px" или "50vh" */
  height?: string;
}

/** Слайдер медиа (изображения/файлы) для новостей и страниц. */
export function MediaSlider({ items, className, height = "400px" }: MediaSliderProps) {
  if (!items?.length) return null;

  const entries = items
    .map((item) => {
      const maybeImage = item as StrapiImage;
      const url = maybeImage.formats
        ? getStrapiMediaWithFormats(maybeImage, ["large", "medium", "small"])
        : getStrapiMedia(item?.url ?? (item as { url?: string })?.url ?? null);
      const alt = (item as StrapiImage).alternativeText ?? (item as StrapiFile).name ?? "";
      return { url, alt };
    })
    .filter((e) => e.url);

  if (entries.length === 0) return null;
  if (entries.length === 1) {
    return (
      <figure className={className}>
        <span className="block relative w-full overflow-hidden rounded-xl bg-slate-100" style={{ height }}>
          <Image
            src={entries[0].url!}
            alt={entries[0].alt || "Изображение"}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 900px"
            className="h-full w-full object-contain"
          />
        </span>
      </figure>
    );
  }

  return (
    <Carousel className={className} opts={{ loop: true, align: "start" }}>
      <CarouselContent>
        {entries.map((entry, index) => (
          <CarouselItem key={index}>
            <figure className="relative w-full overflow-hidden rounded-xl bg-slate-100" style={{ height }}>
              <Image
                src={entry.url!}
                alt={entry.alt || `Слайд ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 900px"
                priority={index === 0}
                className="h-full w-full object-contain"
              />
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 md:left-4" />
      <CarouselNext className="right-2 md:right-4" />
    </Carousel>
  );
}
