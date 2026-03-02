import type { Core } from '@strapi/strapi';

type QueryLocale = {
  locale?: unknown;
};

type ControllerRequestBody = {
  data?: Record<string, unknown>;
};

type ControllerContext = {
  query?: QueryLocale;
  request: {
    body?: ControllerRequestBody;
  };
  badRequest: (message: string) => unknown;
  notFound: () => unknown;
};

type ControllerInstance = {
  sanitizeOutput?: (data: unknown, ctx: ControllerContext) => Promise<unknown>;
  transformResponse?: (data: unknown) => unknown;
};

type SingleTypeControllerOptions = {
  populate?: unknown;
};

type DocumentUid = Parameters<Core.Strapi['documents']>[0];

function resolveLocale(ctx: ControllerContext): string | undefined {
  return typeof ctx.query?.locale === 'string' ? ctx.query.locale : undefined;
}

async function transformEntityResponse(
  controller: ControllerInstance,
  entity: unknown,
  ctx: ControllerContext
) {
  const out = await controller.sanitizeOutput?.(entity, ctx);
  return controller.transformResponse?.(out ?? entity) ?? { data: entity };
}

export function createLocalizedSingleTypeController(
  strapi: Core.Strapi,
  uid: string,
  options: SingleTypeControllerOptions = {}
) {
  const { populate } = options;
  const documentUid = uid as DocumentUid;

  return {
    async find(ctx: ControllerContext) {
      const locale = resolveLocale(ctx);
      const doc = await strapi.documents(documentUid).findFirst({
        status: 'published',
        ...(locale && { locale }),
        ...(populate !== undefined && { populate }),
      });

      if (!doc) return ctx.notFound();
      return { data: doc };
    },

    async update(this: ControllerInstance, ctx: ControllerContext) {
      const locale = resolveLocale(ctx);
      const data = ctx.request.body?.data;

      if (!data || typeof data !== 'object') {
        return ctx.badRequest('Missing data');
      }

      let documentId: string | undefined;

      try {
        const existing = await strapi.documents(documentUid).findFirst({ ...(locale && { locale }) });
        documentId = existing?.documentId;
      } catch (error) {
        strapi.log.warn(`[${uid}] Failed to resolve localized document for update.`, error);
      }

      if (!documentId) {
        try {
          const anyLocaleDocument = await strapi.documents(documentUid).findFirst({});
          documentId = anyLocaleDocument?.documentId;
        } catch (error) {
          strapi.log.warn(`[${uid}] Failed to resolve fallback document for update.`, error);
        }
      }

      if (!documentId) {
        const created = await strapi.documents(documentUid).create({
          data,
          ...(locale && { locale }),
        });
        return transformEntityResponse(this, created, ctx);
      }

      const updated = await strapi.documents(documentUid).update({
        documentId,
        ...(locale && { locale }),
        data,
      });

      return transformEntityResponse(this, updated, ctx);
    },
  };
}
