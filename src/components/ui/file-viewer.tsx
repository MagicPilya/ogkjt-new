"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image as ImageIcon, File } from "lucide-react";
import Image from "next/image";
import type { StrapiImage } from "@/lib/strapi";
import { getStrapiMedia } from "@/lib/utils";
import { uiStrings } from "@/lib/ui-strings";
import type { Locale } from "@/lib/i18n";

interface FileViewerProps {
  file: StrapiImage;
  locale?: Locale;
  trigger: React.ReactNode;
}

// Типы файлов, которые можно просматривать в браузере
const VIEWABLE_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
const VIEWABLE_PDF_TYPES = ["application/pdf"];

// Типы файлов Office, которые нельзя просматривать напрямую
const OFFICE_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
  "application/msword", // DOC
  "application/vnd.ms-excel", // XLS
  "application/vnd.ms-powerpoint", // PPT
];

function getFileType(file: StrapiImage): "image" | "pdf" | "office" | "other" {
  // Пытаемся определить тип по расширению, если mime type недоступен
  const url = file.url.toLowerCase();
  const ext = url.split(".").pop()?.split("?")[0] || "";
  
  // Проверяем по расширению
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
    return "image";
  }
  if (ext === "pdf") {
    return "pdf";
  }
  if (["docx", "xlsx", "pptx", "doc", "xls", "ppt"].includes(ext)) {
    return "office";
  }
  
  // Если есть mime type в данных (хотя в StrapiImage его может не быть)
  // Можно расширить интерфейс StrapiImage, если нужно
  
  return "other";
}

function getFileIcon(type: "image" | "pdf" | "office" | "other") {
  switch (type) {
    case "image":
      return ImageIcon;
    case "pdf":
      return FileText;
    default:
      return File;
  }
}

export function FileViewer({ file, locale = "ru", trigger }: FileViewerProps) {
  const [open, setOpen] = useState(false);
  const fileType = getFileType(file);
  const fileUrl = getStrapiMedia(file.url) || file.url;
  const canView = fileType === "image" || fileType === "pdf";
  const FileIcon = getFileIcon(fileType);
  const t = uiStrings;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = file.name || "file";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="shrink-0 px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2 truncate">
              <FileIcon className="h-5 w-5 shrink-0" />
              <span className="min-w-0 truncate">
                {file.alternativeText || file.name || t.attachedFile[locale]}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-auto flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg mx-6">
            {fileType === "image" && (
              <div className="relative w-full min-h-[300px] flex items-center justify-center">
                <Image
                  src={fileUrl}
                  alt={file.alternativeText || file.name || t.imageAlt[locale]}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}

            {fileType === "pdf" && (
              <iframe
                src={fileUrl}
                className="w-full min-h-[400px] flex-1 border-0 rounded-lg"
                title={file.alternativeText || file.name || t.pdfDocument[locale]}
              />
            )}

            {!canView && (
              <div className="text-center py-8">
                <FileIcon className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-semibold mb-2">
                  {fileType === "office"
                    ? t.officeCannotPreview[locale]
                    : t.fileCannotPreview[locale]}
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  {t.pleaseDownload[locale]}
                </p>
                <Button onClick={handleDownload} size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  {t.downloadFile[locale]}
                </Button>
              </div>
            )}
          </div>

          <div className="shrink-0 flex flex-wrap justify-between items-center gap-2 px-6 py-4 border-t">
            <div className="text-sm text-slate-500 min-w-0">
              {file.name && (
                <span className="font-medium truncate block">{file.name}</span>
              )}
              {file.caption && (
                <span className="truncate block">{file.caption}</span>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {canView && (
                <Button variant="outline" onClick={handleDownload} size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  {t.download[locale]}
                </Button>
              )}
              <Button onClick={() => setOpen(false)} size="sm">
                {t.close[locale]}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
