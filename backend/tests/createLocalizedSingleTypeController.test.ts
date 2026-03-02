import assert from 'node:assert/strict';
import test from 'node:test';

import { createLocalizedSingleTypeController } from '../src/utils/createLocalizedSingleTypeController';

type QueueItem<T> = T | Error;

type MockDocumentsApi = {
  findFirst: (params: unknown) => Promise<unknown>;
  create: (params: unknown) => Promise<unknown>;
  update: (params: unknown) => Promise<unknown>;
};

type MockStrapi = {
  documents: (uid: string) => MockDocumentsApi;
  log: {
    warn: (message: string, error?: unknown) => void;
  };
};

function createMockStrapi(options: {
  findFirstQueue?: QueueItem<unknown>[];
  createResult?: unknown;
  updateResult?: unknown;
}) {
  const findFirstCalls: unknown[] = [];
  const createCalls: unknown[] = [];
  const updateCalls: unknown[] = [];
  const warnCalls: Array<{ message: string; error?: unknown }> = [];

  const findFirstQueue = [...(options.findFirstQueue ?? [])];

  const strapi: MockStrapi = {
    documents: () => ({
      findFirst: async (params) => {
        findFirstCalls.push(params);
        const next = findFirstQueue.shift();
        if (next instanceof Error) throw next;
        return next;
      },
      create: async (params) => {
        createCalls.push(params);
        return options.createResult ?? { documentId: 'created-doc' };
      },
      update: async (params) => {
        updateCalls.push(params);
        return options.updateResult ?? { documentId: 'updated-doc' };
      },
    }),
    log: {
      warn: (message, error) => {
        warnCalls.push({ message, error });
      },
    },
  };

  return {
    strapi,
    calls: { findFirstCalls, createCalls, updateCalls, warnCalls },
  };
}

function createCtx(locale?: string, data?: Record<string, unknown>) {
  return {
    query: locale ? { locale } : undefined,
    request: { body: { data } },
    badRequest: (message: string) => ({ error: message }),
    notFound: () => ({ error: 'not-found' }),
  };
}

test('find uses locale and populate options', async () => {
  const expectedDoc = { documentId: 'doc-1' };
  const { strapi, calls } = createMockStrapi({ findFirstQueue: [expectedDoc] });
  const controller = createLocalizedSingleTypeController(strapi as never, 'api::annual-symbol.annual-symbol', {
    populate: ['logo'],
  });

  const result = await controller.find(createCtx('ru'));

  assert.deepEqual(calls.findFirstCalls[0], {
    status: 'published',
    locale: 'ru',
    populate: ['logo'],
  });
  assert.deepEqual(result, { data: expectedDoc });
});

test('update returns badRequest when data payload is missing', async () => {
  const { strapi } = createMockStrapi({});
  const controller = createLocalizedSingleTypeController(strapi as never, 'api::global.global');
  const ctx = createCtx('ru');

  const result = await controller.update(ctx);

  assert.deepEqual(result, { error: 'Missing data' });
});

test('update modifies existing localized document and uses sanitize/transform hooks', async () => {
  const updatedEntity = { documentId: 'doc-2', title: 'Updated' };
  const { strapi, calls } = createMockStrapi({
    findFirstQueue: [{ documentId: 'doc-2' }],
    updateResult: updatedEntity,
  });
  const controller = createLocalizedSingleTypeController(strapi as never, 'api::menu.menu');
  const ctx = createCtx('ru', { title: 'Updated' });

  const result = await controller.update.call(
    {
      sanitizeOutput: async (data: unknown) => ({ sanitized: data }),
      transformResponse: (data: unknown) => ({ transformed: data }),
    },
    ctx
  );

  assert.deepEqual(calls.updateCalls[0], {
    documentId: 'doc-2',
    locale: 'ru',
    data: { title: 'Updated' },
  });
  assert.deepEqual(result, { transformed: { sanitized: updatedEntity } });
});

test('update creates document when localized and fallback documents are absent', async () => {
  const createdEntity = { documentId: 'doc-new' };
  const { strapi, calls } = createMockStrapi({
    findFirstQueue: [null, null],
    createResult: createdEntity,
  });
  const controller = createLocalizedSingleTypeController(strapi as never, 'api::specialty.specialty');
  const ctx = createCtx('ru', { title: 'New document' });

  const result = await controller.update(ctx);

  assert.equal(calls.updateCalls.length, 0);
  assert.deepEqual(calls.createCalls[0], {
    data: { title: 'New document' },
    locale: 'ru',
  });
  assert.deepEqual(result, { data: createdEntity });
});
