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

interface FileViewerProps {
  file: StrapiImage;
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

export function FileViewer({ file, trigger }: FileViewerProps) {
  const [open, setOpen] = useState(false);
  const fileType = getFileType(file);
  const fileUrl = getStrapiMedia(file.url) || file.url;
  const canView = fileType === "image" || fileType === "pdf";
  const FileIcon = getFileIcon(fileType);

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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileIcon className="h-5 w-5" />
              {file.alternativeText || file.name || "Вложенный файл"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            {fileType === "image" && (
              <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
                <Image
                  src={fileUrl}
                  alt={file.alternativeText || file.name || "Изображение"}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}

            {fileType === "pdf" && (
              <iframe
                src={fileUrl}
                className="w-full h-[600px] border-0 rounded-lg"
                title={file.alternativeText || file.name || "PDF документ"}
              />
            )}

            {!canView && (
              <div className="text-center py-12">
                <FileIcon className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-semibold mb-2">
                  {fileType === "office"
                    ? "Документ Office не может быть просмотрен в браузере"
                    : "Этот тип файла не может быть просмотрен в браузере"}
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  Пожалуйста, скачайте файл для просмотра
                </p>
                <Button onClick={handleDownload} size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Скачать файл
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-slate-500">
              {file.name && (
                <span className="font-medium">{file.name}</span>
              )}
              {file.caption && (
                <span className="ml-2">{file.caption}</span>
              )}
            </div>
            <div className="flex gap-2">
              {canView && (
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Скачать
                </Button>
              )}
              <Button onClick={() => setOpen(false)}>Закрыть</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
