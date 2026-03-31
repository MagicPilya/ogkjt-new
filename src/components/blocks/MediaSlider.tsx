"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  type CarouselApi,
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

  const entries = useMemo(
    () =>
      items
        .map((item) => {
          const maybeImage = item as StrapiImage;
          const url = maybeImage.formats
            ? getStrapiMediaWithFormats(maybeImage, ["large", "medium", "small"])
            : getStrapiMedia(item?.url ?? (item as { url?: string })?.url ?? null);
          const alt = (item as StrapiImage).alternativeText ?? (item as StrapiFile).name ?? "";
          return { url, alt };
        })
        .filter((e) => e.url),
    [items]
  );
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const pointerStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (entries.length === 0) return;

    // Подогреваем первые кадры, чтобы уменьшить «белый» старт.
    const preloadTargets = entries.slice(0, 3);
    preloadTargets.forEach((entry) => {
      const img = new window.Image();
      img.src = entry.url!;
    });
  }, [entries]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + entries.length) % entries.length);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % entries.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [entries.length, lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const scrollTo = useCallback(
    (index: number) => {
      setActiveIndex(index);
      api?.scrollTo(index);
    },
    [api]
  );

  const showPrevInLightbox = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + entries.length) % entries.length);
  }, [entries.length]);

  const showNextInLightbox = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % entries.length);
  }, [entries.length]);

  const handleLightboxPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") return;
    pointerStartXRef.current = event.clientX;
  }, []);

  const handleLightboxPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "touch") return;
      const touchStartX = pointerStartXRef.current;
      const touchEndX = event.clientX;
      pointerStartXRef.current = null;

      if (touchStartX == null || touchEndX == null) return;
      const deltaX = touchStartX - touchEndX;
      const swipeThreshold = 40;

      if (Math.abs(deltaX) < swipeThreshold) return;
      if (deltaX > 0) {
        showNextInLightbox();
      } else {
        showPrevInLightbox();
      }
    },
    [showNextInLightbox, showPrevInLightbox]
  );

  if (entries.length === 0) return null;
  if (entries.length === 1) {
    return (
      <>
        <figure className={className}>
          <button
            type="button"
            aria-label="Открыть изображение на весь экран"
            onClick={() => setLightboxOpen(true)}
            className="block relative w-full overflow-hidden rounded-xl bg-slate-100"
            style={{ height }}
          >
            <img
              src={entries[0].url!}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
            />
            <div className="absolute inset-0 bg-black/15" />
            <img
              src={entries[0].url!}
              alt={entries[0].alt || "Изображение"}
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              draggable={false}
              className="relative z-10 h-full w-full select-none object-contain"
            />
          </button>
        </figure>

        {lightboxOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/90"
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр изображения"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/60 to-transparent" />
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="pointer-events-none relative flex h-full w-full items-center justify-center p-4 md:p-8">
              <img
                src={entries[0].url!}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-3xl opacity-35"
              />
              <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <img
                  src={entries[0].url!}
                  alt={entries[0].alt || "Изображение"}
                  loading="eager"
                  decoding="async"
                  draggable={false}
                  className="relative z-10 max-h-[90vh] max-w-[95vw] select-none object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className={className}>
        <Carousel opts={{ loop: true, align: "start" }} setApi={setApi}>
          <CarouselContent>
            {entries.map((entry, index) => (
              <CarouselItem key={index}>
                <figure className="relative w-full overflow-hidden rounded-xl bg-slate-100" style={{ height }}>
                  <button
                    type="button"
                    onClick={() => {
                      scrollTo(index);
                      setLightboxOpen(true);
                    }}
                    aria-label={`Открыть слайд ${index + 1} на весь экран`}
                    className="h-full w-full"
                  >
                    <img
                      src={entry.url!}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <img
                      src={entry.url!}
                      alt={entry.alt || `Слайд ${index + 1}`}
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      decoding={index === 0 ? "sync" : "async"}
                      draggable={false}
                      className="relative z-10 h-full w-full select-none object-contain"
                    />
                  </button>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 md:left-4" />
          <CarouselNext className="right-2 md:right-4" />
        </Carousel>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {entries.map((entry, index) => (
            <button
              key={`thumb-${index}`}
              type="button"
              onClick={() => scrollTo(index)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border transition ${
                activeIndex === index
                  ? "border-blue-500 ring-2 ring-blue-500/30"
                  : "border-slate-200 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500"
              }`}
              aria-label={`Перейти к слайду ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
            >
              <img
                src={entry.url!}
                alt={entry.alt || `Миниатюра ${index + 1}`}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>

        <div className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          {activeIndex + 1} / {entries.length}
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр изображений"
          onClick={() => setLightboxOpen(false)}
          onPointerDown={handleLightboxPointerDown}
          onPointerUp={handleLightboxPointerUp}
          style={{ touchAction: "pan-y" }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/60 to-transparent" />

          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showPrevInLightbox();
            }}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            aria-label="Предыдущее изображение"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showNextInLightbox();
            }}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            aria-label="Следующее изображение"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="pointer-events-none relative flex h-full w-full items-center justify-center p-4 md:p-8">
            <img
              src={entries[activeIndex].url!}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-3xl opacity-35"
            />
            <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <img
                src={entries[activeIndex].url!}
                alt={entries[activeIndex].alt || `Слайд ${activeIndex + 1}`}
                loading="eager"
                decoding="async"
                draggable={false}
                className="relative z-10 max-h-[90vh] max-w-[95vw] select-none object-contain"
              />
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
            {activeIndex + 1} / {entries.length}
          </div>
        </div>
      )}
    </>
  );
}
