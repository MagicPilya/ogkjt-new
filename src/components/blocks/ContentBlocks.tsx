import type { ReactNode } from "react";

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
};

interface ContentBlocksProps {
  blocks: Block[] | null | undefined;
  className?: string;
}

/** Рендер блоков контента Strapi (paragraph, heading, list) */
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
        return null;
      })}
    </div>
  );
}
