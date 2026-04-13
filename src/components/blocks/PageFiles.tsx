"use client";

import { useMemo, useState } from "react";
import { FileArchive, FileDown, FileSpreadsheet, FileText } from "lucide-react";
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

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pdf" | "docx" | "xls" | "zip">("all");
  const showSearch = files.length > 10;

  const normalizeFileTitle = (rawName: string, ext: string) => {
    const escapedExt = ext ? ext.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
    const withoutExt = escapedExt
      ? rawName.replace(new RegExp(`\\.${escapedExt}$`, "i"), "")
      : rawName;
    return withoutExt
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const normalizedFiles = useMemo(
    () =>
      files
        .map((file, index) => {
          const url = file?.url ? getStrapiMedia(file.url) : null;
          if (!url) return null;
          const baseName = file?.name || file?.alternativeText || `${uiStrings.download[locale]} ${index + 1}`;
          const extRaw = file.ext?.replace(".", "") || baseName.split(".").pop() || "";
          const ext = extRaw.toLowerCase();
          const label = normalizeFileTitle(baseName, ext);
          const type: "pdf" | "docx" | "xls" | "pptx" | "zip" | "other" =
            ext === "pdf"
              ? "pdf"
              : ["doc", "docx", "odt", "rtf"].includes(ext)
                ? "docx"
                : ["xls", "xlsx", "ods", "csv"].includes(ext)
                  ? "xls"
                : ["ppt", "pptx", "odp"].includes(ext)
                  ? "pptx"
                : ["zip", "rar", "7z"].includes(ext)
                  ? "zip"
                  : "other";
          return { file, index, url, label, ext, type };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [files, locale],
  );

  const filteredFiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalizedFiles.filter((item) => {
      const byType = filter === "all" || item.type === filter;
      const byText = !q || item.label.toLowerCase().includes(q);
      return byType && byText;
    });
  }, [filter, normalizedFiles, query]);

  const getTypeIcon = (type: "pdf" | "docx" | "xls" | "pptx" | "zip" | "other") => {
    if (type === "xls") return <FileSpreadsheet className="h-4 w-4 shrink-0" />;
    if (type === "zip") return <FileArchive className="h-4 w-4 shrink-0" />;
    return <FileText className="h-4 w-4 shrink-0" />;
  };

  const getTypeLabel = (type: "pdf" | "docx" | "xls" | "pptx" | "zip" | "other", ext: string) => {
    if (type === "pdf") return "PDF";
    if (type === "docx") return "DOCX";
    if (type === "xls") return "XLS";
    if (type === "pptx") return "PPTX";
    if (type === "zip") {
      if (ext === "rar") return "RAR";
      if (ext === "7z") return "7Z";
      return "ZIP";
    }
    return ext ? ext.toUpperCase() : "FILE";
  };

  const getTypeBadgeClass = (type: "pdf" | "docx" | "xls" | "pptx" | "zip" | "other") => {
    if (type === "pdf") {
      return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";
    }
    if (type === "docx") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
    }
    if (type === "xls") {
      return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300";
    }
    if (type === "pptx") {
      return "bg-[#C43E1C]/15 text-[#C43E1C] dark:bg-[#C43E1C]/25 dark:text-[#ff9f88]";
    }
    if (type === "zip") {
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    }
    return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
  };

  return (
    <section className={cn("py-6", className)} aria-label={uiStrings.attachments[locale]}>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
        {uiStrings.attachments[locale]}
      </h2>
      {showSearch ? (
        <div className="mb-4 space-y-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={uiStrings.attachmentsSearchPlaceholder[locale]}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <div className="flex flex-wrap items-center gap-2">
            {([
              ["all", uiStrings.attachmentsFilterAll[locale]],
              ["pdf", "PDF"],
              ["docx", "DOCX"],
              ["xls", "XLS"],
              ["zip", "ZIP/RAR"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                  filter === value
                    ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {filteredFiles.length ? (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filteredFiles.map((item) => (
            <li
              key={item.file.id ?? item.index}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex min-h-[44px] items-center justify-between gap-3">
                <div className="group relative min-w-0 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  {getTypeIcon(item.type)}
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                      getTypeBadgeClass(item.type),
                    )}
                  >
                    {getTypeLabel(item.type, item.ext)}
                  </span>
                  <span className="min-w-0 break-words whitespace-normal md:truncate md:whitespace-nowrap">
                    {item.label}
                  </span>
                  <div className="pointer-events-none absolute left-0 top-full z-20 mt-1 hidden max-w-[28rem] rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block group-focus-within:block dark:bg-slate-700 md:block md:opacity-0 md:transition-opacity md:duration-150 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                    <span className="hidden md:inline">{item.label}</span>
                  </div>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-blue-600 px-2.5 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-950/30"
                >
                  <FileDown className="h-4 w-4" />
                  {uiStrings.download[locale]}
                </a>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-300">{uiStrings.notFound[locale]}</p>
      )}
    </section>
  );
}
