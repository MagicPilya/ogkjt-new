import type { ReactNode } from "react";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/utils";

type Block = {
  type: string;
  level?: number;
  format?: string;
  children?: Array<{
    type: string;
    text?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    children?: Array<{ text?: string }>;
  }>;
  /** Блок изображения: медиа из Strapi (после populate) */
  image?: {
    url?: string;
    alternativeText?: string | null;
    caption?: string | null;
    width?: number;
    height?: number;
  } | null;
};

interface ContentBlocksProps {
  blocks: Block[] | null | undefined;
  className?: string;
}

/** Рендер блоков контента Strapi (paragraph, heading, list, image) */
export function ContentBlocks({ blocks, className }: ContentBlocksProps) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <div className={className}>
      {blocks.map((block: Block, index: number) => {
        if (block.type === "paragraph") {
          return (
            <p key={index}>
              {block.children?.map((child: any, childIndex: number) => {
                if (child.type === "text") {
                  let text: ReactNode = child.text;
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
        if (block.type === "heading" && block.level) {
          const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
          return (
            <Tag key={index}>
              {block.children?.map((c: any) => c.text).join("")}
            </Tag>
          );
        }
        if (block.type === "list") {
          const ListTag = block.format === "ordered" ? "ol" : "ul";
          return (
            <ListTag key={index}>
              {block.children?.map((item: any, itemIndex: number) => (
                <li key={itemIndex}>
                  {item.children?.map((c: any) => c.text).join("")}
                </li>
              ))}
            </ListTag>
          );
        }
        if (block.type === "image" && block.image) {
          const media = block.image as { url?: string; alternativeText?: string | null; width?: number; height?: number };
          const url = media.url ?? (block.image as any)?.data?.attributes?.url;
          const src = getStrapiMedia(url ?? null);
          if (!src) return null;
          const alt = media.alternativeText ?? (block.image as any)?.data?.attributes?.alternativeText ?? "";
          const width = media.width ?? (block.image as any)?.data?.attributes?.width ?? 800;
          const height = media.height ?? (block.image as any)?.data?.attributes?.height ?? 600;
          return (
            <figure key={index} className="my-6 w-full max-w-2xl mx-auto">
              <span className="block relative w-full overflow-hidden rounded-md">
                {/* unoptimized: грузим напрямую со Strapi; размер ограничен по ширине контейнера */}
                <Image
                  src={src}
                  alt={alt || "Изображение"}
                  width={width}
                  height={height}
                  className="h-auto w-full max-w-full object-contain"
                  unoptimized
                />
              </span>
              {media.caption ?? (block.image as any)?.data?.attributes?.caption ? (
                <figcaption className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                  {media.caption ?? (block.image as any)?.data?.attributes?.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }
        return null;
      })}
    </div>
  );
}
