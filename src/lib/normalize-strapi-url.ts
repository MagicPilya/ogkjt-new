export function normalizeStrapiUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `http://${trimmed}`;
}
