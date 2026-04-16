import type { Core } from '@strapi/strapi';

import { pickBetterCandidate } from './helpers';

export type PageLocaleRecord = {
  documentId: string;
  pageUrl: string;
  title?: string;
  locale?: string;
  content?: unknown;
  updatedAt?: string;
};

export function pickBestRecord(records: PageLocaleRecord[]): PageLocaleRecord | undefined {
  if (!records.length) return undefined;
  return records.reduce((best, current) => pickBetterCandidate(best, current));
}

export async function publishPageLocale(
  strapi: Core.Strapi,
  documentId: string,
  locale: string,
  data: { pageUrl: string; title: string; content?: unknown }
) {
  await strapi.documents('api::page.page').update({
    documentId,
    locale,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi update typings are narrower than runtime support.
    data: data as any,
  });
  await strapi.documents('api::page.page').update({
    documentId,
    locale,
    status: 'published',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Strapi update typings are narrower than runtime support.
    data: data as any,
  });
}
