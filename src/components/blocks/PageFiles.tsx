import { FileDown } from "lucide-react";
import type { StrapiFile } from "@/lib/strapi";
import { getStrapiMedia } from "@/lib/utils";
import { uiStrings } from "@/lib/ui-strings";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface PageFilesProps {
  files: StrapiFile[];
  locale?: Locale;
  className?: string;
}

/** Блок «Вложения к странице»: список файлов для скачивания. */
export function PageFiles({ files, locale = "ru", className }: PageFilesProps) {
  if (!files?.length) return null;

  return (
    <section className={cn("py-6", className)} aria-label={uiStrings.downloadFile[locale]}>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
        {uiStrings.downloadFile[locale]}
      </h2>
      <ul className="space-y-2">
        {files.map((file, index) => {
          const url = file?.url ? getStrapiMedia(file.url) : null;
          const label = file?.name || file?.alternativeText || `${uiStrings.download[locale]} ${index + 1}`;
          if (!url) return null;
          return (
            <li key={file.id ?? index}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline touch-manipulation min-h-[44px]"
              >
                <FileDown className="h-4 w-4 shrink-0" />
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
