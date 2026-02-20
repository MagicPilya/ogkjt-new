import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/utils";

type Block = {
  type: string;
  level?: number;
  format?: string;
  /** Для блока code: готовый текст от Strapi */
  plainText?: string;
  /** Для блока link */
  url?: string;
  children?: Array<{
    type: string;
    text?: string;
    url?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    children?: Array<{ type?: string; text?: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; code?: boolean }>;
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

const linkClass =
  "text-blue-600 dark:text-blue-400 underline decoration-blue-600/50 dark:decoration-blue-400/50 hover:text-blue-700 dark:hover:text-blue-300 hover:decoration-blue-600 dark:hover:decoration-blue-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:rounded";

function renderInlineNodes(children: any[] | undefined): ReactNode[] {
  if (!children?.length) return [];
  return children.map((c: any, i: number) => {
    if (c.type === "text") {
      let t: ReactNode = c.text;
      if (c.bold) t = <strong key={i}>{t}</strong>;
      if (c.italic) t = <em key={i}>{t}</em>;
      if (c.underline) t = <u key={i}>{t}</u>;
      if (c.strikethrough) t = <s key={i}>{t}</s>;
      if (c.code)
        t = (
          <code
            key={i}
            className="rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 text-sm font-mono"
          >
            {t}
          </code>
        );
      return <span key={i}>{t}</span>;
    }
    if (c.type === "link" && c.url) {
      const href = c.url;
      const isInternal = href.startsWith("/") && !href.startsWith("//");
      const content = renderInlineNodes(c.children);
      const inner = content.length ? content : href;
      if (isInternal) {
        return (
          <Link key={i} href={href} className={linkClass}>
            {inner}
          </Link>
        );
      }
      const isExternal = /^https?:\/\//i.test(href);
      return (
        <a
          key={i}
          href={href}
          {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
          className={linkClass}
        >
          {inner}
        </a>
      );
    }
    return null;
  });
}

function renderLink(href: string, children: ReactNode): ReactNode {
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  if (isInternal) {
    return <Link href={href} className={linkClass}>{children}</Link>;
  }
  const isExternal = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
      className={linkClass}
    >
      {children}
    </a>
  );
}

interface ContentBlocksProps {
  blocks: Block[] | null | undefined;
  className?: string;
}

/** Проверяет, пустой ли абзац (нет текста или только пробелы) — для разделителя абзацев */
function isParagraphEmpty(block: Block): boolean {
  if (!block.children?.length) return true;
  const text = block.children
    .map((c: any) => c.text ?? (c.children?.map((cc: any) => cc?.text).join("") ?? ""))
    .join("");
  return !text || !text.trim();
}

/** Рендер блоков контента Strapi (paragraph, heading, list, quote, code, link, image) */
export function ContentBlocks({ blocks, className }: ContentBlocksProps) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null;

  const paragraphClass = "indent-[1.25em] mb-3 last:mb-0";

  return (
    <div className={className}>
      {blocks.map((block: Block, index: number) => {
        if (block.type === "paragraph") {
          if (isParagraphEmpty(block)) {
            return <div key={index} className="h-4 shrink-0" aria-hidden />;
          }
          return (
            <p key={index} className={paragraphClass}>
              {renderInlineNodes(block.children)}
            </p>
          );
        }
        if (block.type === "link" && block.url) {
          const content = renderInlineNodes(block.children);
          return (
            <p key={index} className={paragraphClass}>
              {renderLink(block.url, content.length ? content : block.url)}
            </p>
          );
        }
        if (block.type === "heading" && block.level) {
          const safeLevel = block.level >= 1 && block.level <= 6 ? block.level : 3;
          const headingClasses: Record<number, string> = {
            1: "font-bold text-3xl md:text-4xl mt-8 mb-3 text-slate-900 dark:text-slate-100",
            2: "font-bold text-2xl md:text-3xl mt-6 mb-2 text-slate-900 dark:text-slate-100",
            3: "font-semibold text-xl md:text-2xl mt-4 mb-2 text-slate-800 dark:text-slate-200",
            4: "font-semibold text-lg md:text-xl mt-3 mb-1 text-slate-800 dark:text-slate-200",
            5: "font-medium text-lg mt-2 mb-1 text-slate-700 dark:text-slate-300",
            6: "font-medium text-lg mt-2 mb-1 text-slate-700 dark:text-slate-300",
          };
          const cls = headingClasses[safeLevel] ?? "font-semibold mt-4 mb-2";
          const headingText = block.children?.map((c: any) => c.text).join("");
          if (safeLevel === 1) return <h1 key={index} className={cls}>{headingText}</h1>;
          if (safeLevel === 2) return <h2 key={index} className={cls}>{headingText}</h2>;
          if (safeLevel === 3) return <h3 key={index} className={cls}>{headingText}</h3>;
          if (safeLevel === 4) return <h4 key={index} className={cls}>{headingText}</h4>;
          if (safeLevel === 5) return <h5 key={index} className={cls}>{headingText}</h5>;
          return <h6 key={index} className={cls}>{headingText}</h6>;
        }
        if (block.type === "list") {
          const listClass =
            block.format === "ordered"
              ? "list-decimal list-outside pl-6 my-4 space-y-1"
              : "list-disc list-outside pl-6 my-4 space-y-1";
          const items = block.children?.map((item: any, itemIndex: number) => (
            <li key={itemIndex}>
              {renderInlineNodes(item.children)}
            </li>
          ));
          return block.format === "ordered" ? (
            <ol key={index} className={listClass}>{items}</ol>
          ) : (
            <ul key={index} className={listClass}>{items}</ul>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="my-6 border-l-4 border-slate-300 dark:border-slate-600 pl-4 py-1 text-slate-600 dark:text-slate-400 italic"
            >
              {renderInlineNodes(block.children)}
            </blockquote>
          );
        }
        if (block.type === "code") {
          const codeText =
            block.plainText ??
            block.children?.map((c: any) => c.text ?? "").join("") ??
            "";
          return (
            <pre
              key={index}
              className="my-6 overflow-x-auto rounded-lg bg-slate-800 px-4 py-3 text-sm text-slate-100 font-mono"
            >
              <code>{codeText}</code>
            </pre>
          );
        }
        if (block.type === "image" && block.image) {
          const media = block.image as {
            url?: string;
            alternativeText?: string | null;
            caption?: string | null;
            width?: number;
            height?: number;
          };
          const url = media.url ?? (block.image as any)?.data?.attributes?.url;
          const src = getStrapiMedia(url ?? null);
          if (!src) return null;
          const alt =
            media.alternativeText ??
            (block.image as any)?.data?.attributes?.alternativeText ??
            "";
          const width =
            media.width ?? (block.image as any)?.data?.attributes?.width ?? 800;
          const height =
            media.height ?? (block.image as any)?.data?.attributes?.height ?? 600;
          const caption =
            media.caption ?? (block.image as any)?.data?.attributes?.caption;
          return (
            <figure
              key={index}
              className="my-8 w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-md bg-slate-100 dark:bg-slate-800/50"
            >
              <span className="block relative w-full overflow-hidden">
                <Image
                  src={src}
                  alt={alt || "Изображение"}
                  width={width}
                  height={height}
                  className="h-auto w-full max-w-full object-contain"
                  unoptimized
                />
              </span>
              {caption ? (
                <figcaption className="mt-2 px-2 text-center text-sm text-slate-500 dark:text-slate-400">
                  {caption}
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
