/**
 * Извлекает плоский текст из Strapi Blocks.
 * Сохраняет пробелы между узлами, чтобы текст был пригоден для поиска/description.
 */
export function extractTextFromBlocks(blocks: unknown): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  const parts: string[] = [];

  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const children = (block as { children?: unknown[] }).children;
    if (!Array.isArray(children)) continue;

    for (const child of children) {
      if (!child || typeof child !== "object") continue;
      const childText = (child as { text?: unknown }).text;
      if (typeof childText === "string" && childText.trim()) {
        parts.push(childText.trim());
      }

      const nested = (child as { children?: unknown[] }).children;
      if (!Array.isArray(nested)) continue;
      for (const nestedChild of nested) {
        if (!nestedChild || typeof nestedChild !== "object") continue;
        const nestedText = (nestedChild as { text?: unknown }).text;
        if (typeof nestedText === "string" && nestedText.trim()) {
          parts.push(nestedText.trim());
        }
      }
    }
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}
