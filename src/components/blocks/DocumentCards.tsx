import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import type { AdmissionDocumentItem } from "@/lib/strapi";
import { getStrapiMedia } from "@/lib/utils";
import { uiStrings } from "@/lib/ui-strings";
import type { Locale } from "@/lib/i18n";

interface DocumentCardsProps {
  items: AdmissionDocumentItem[] | null | undefined;
  locale?: Locale;
}

/** Карточки документов для страницы «Документы приёмной комиссии». */
export function DocumentCards({ items, locale = "ru" }: DocumentCardsProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-14 mb-10" aria-label={uiStrings.downloadFile[locale]}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => {
          const file = item.file;
          const fileUrl = file?.url ? getStrapiMedia(file.url) : null;
          const label = item.title || file?.name || uiStrings.downloadFile[locale];

          return (
            <Card
              key={item.id ?? index}
              className="overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <p className="font-semibold text-lg text-slate-900 dark:text-slate-100 leading-tight line-clamp-2">
                  {item.title}
                </p>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex items-end">
                {fileUrl ? (
                  <Button asChild variant="outline" className="w-full touch-manipulation min-h-[44px]">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4 shrink-0" />
                      {uiStrings.download[locale]}
                    </a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
