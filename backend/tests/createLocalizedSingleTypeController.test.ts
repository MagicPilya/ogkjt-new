import assert from 'node:assert/strict';
import test from 'node:test';

import { createLocalizedSingleTypeController } from '../src/utils/createLocalizedSingleTypeController';

type QueueItem<T> = T | Error;

type MockDocumentsApi = {
  findFirst: (params: unknown) => Promise<unknown>;
  findOne: (params: unknown) => Promise<unknown>;
  create: (params: unknown) => Promise<unknown>;
  update: (params: unknown) => Promise<unknown>;
};

type MockStrapi = {
  documents: (uid: string) => MockDocumentsApi;
  db: {
    query: (uid: string) => {
      findMany: (params?: unknown) => Promise<Array<{ code?: string }>>;
    };
  };
  log: {
    warn: (message: string, error?: unknown) => void;
  };
};

function createMockStrapi(options: {
  findFirstQueue?: QueueItem<unknown>[];
  findOneByLocale?: Record<string, unknown>;
  createResult?: unknown;
  updateResult?: unknown;
  localeRows?: Array<{ code?: string }>;
}) {
  const findFirstCalls: unknown[] = [];
  const findOneCalls: unknown[] = [];
  const createCalls: unknown[] = [];
  const updateCalls: unknown[] = [];
  const warnCalls: Array<{ message: string; error?: unknown }> = [];

  const findFirstQueue = [...(options.findFirstQueue ?? [])];
  const localeRows = options.localeRows ?? [{ code: 'ru' }, { code: 'en' }, { code: 'be' }];

  const strapi: MockStrapi = {
    documents: () => ({
      findFirst: async (params) => {
        findFirstCalls.push(params);
        const next = findFirstQueue.shift();
        if (next instanceof Error) throw next;
        return next;
      },
      findOne: async (params) => {
        findOneCalls.push(params);
        const locale =
          params && typeof params === 'object' && 'locale' in (params as Record<string, unknown>)
            ? (params as { locale?: unknown }).locale
            : undefined;
        return typeof locale === 'string' ? options.findOneByLocale?.[locale] ?? null : null;
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
    db: {
      query: () => ({
        findMany: async () => localeRows,
      }),
    },
    log: {
      warn: (message, error) => {
        warnCalls.push({ message, error });
      },
    },
  };

  return {
    strapi,
    calls: { findFirstCalls, findOneCalls, createCalls, updateCalls, warnCalls },
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
  const controller = createLocalizedSingleTypeController(strapi as never, 'api::menu.menu', {
    replicateToOtherLocales: false,
  });
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
  const controller = createLocalizedSingleTypeController(strapi as never, 'api::specialty.specialty', {
    replicateToOtherLocales: false,
  });
  const ctx = createCtx('ru', { title: 'New document' });

  const result = await controller.update(ctx);

  assert.equal(calls.updateCalls.length, 0);
  assert.deepEqual(calls.createCalls[0], {
    data: { title: 'New document' },
    locale: 'ru',
  });
  assert.deepEqual(result, { data: createdEntity });
});

test('update replicates payload to other locales when enabled', async () => {
  const updatedEntity = { documentId: 'doc-ru', title: 'Updated' };
  const { strapi, calls } = createMockStrapi({
    findFirstQueue: [{ documentId: 'doc-ru' }],
    updateResult: updatedEntity,
    localeRows: [{ code: 'ru' }, { code: 'en' }, { code: 'be' }],
  });
  const controller = createLocalizedSingleTypeController(strapi as never, 'api::menu.menu', {
    replicateToOtherLocales: true,
    replicateMode: 'overwrite',
  });
  const ctx = createCtx('ru', { title: 'Updated' });

  await controller.update(ctx);

  assert.equal(calls.updateCalls.length, 3);
  assert.deepEqual(calls.updateCalls[0], {
    documentId: 'doc-ru',
    locale: 'ru',
    data: { title: 'Updated' },
  });
  assert.deepEqual(calls.updateCalls[1], {
    documentId: 'doc-ru',
    locale: 'en',
    status: 'published',
    data: { title: 'Updated' },
  });
  assert.deepEqual(calls.updateCalls[2], {
    documentId: 'doc-ru',
    locale: 'be',
    status: 'published',
    data: { title: 'Updated' },
  });
});

test('update replicates only missing fields to other locales in missingOnly mode', async () => {
  const { strapi, calls } = createMockStrapi({
    findFirstQueue: [{ documentId: 'doc-ru' }],
    localeRows: [{ code: 'ru' }, { code: 'en' }, { code: 'be' }],
    findOneByLocale: {
      en: { title: 'Translated title', subtitle: '', meta: { a: 'en' }, tags: [] },
      be: { title: 'Заголовок', subtitle: 'Подзаголовок', meta: { a: 'be', b: 'be-b' }, tags: ['ok'] },
    },
  });
  const controller = createLocalizedSingleTypeController(strapi as never, 'api::global.global', {
    replicateToOtherLocales: true,
    replicateMode: 'missingOnly',
  });
  const ctx = createCtx('ru', {
    title: 'Source title',
    subtitle: 'Source subtitle',
    meta: { a: 'ru', b: 'ru-b' },
    tags: ['filled'],
  });

  await controller.update(ctx);

  assert.equal(calls.updateCalls.length, 2);
  assert.deepEqual(calls.updateCalls[0], {
    documentId: 'doc-ru',
    locale: 'ru',
    data: {
      title: 'Source title',
      subtitle: 'Source subtitle',
      meta: { a: 'ru', b: 'ru-b' },
      tags: ['filled'],
    },
  });
  assert.deepEqual(calls.updateCalls[1], {
    documentId: 'doc-ru',
    locale: 'en',
    status: 'published',
    data: {
      subtitle: 'Source subtitle',
      meta: { b: 'ru-b' },
      tags: ['filled'],
    },
  });
  assert.deepEqual(calls.findOneCalls, [
    { documentId: 'doc-ru', locale: 'en' },
    { documentId: 'doc-ru', locale: 'be' },
  ]);
});

test('missingOnly mode appends new menu items by url without overwriting existing ones', async () => {
  const { strapi, calls } = createMockStrapi({
    findFirstQueue: [{ documentId: 'menu-doc' }],
    localeRows: [{ code: 'ru' }, { code: 'en' }],
    findOneByLocale: {
      en: {
        mainMenu: [
          { title: 'Students EN', url: '/students', links: [] },
        ],
      },
    },
  });
  const controller = createLocalizedSingleTypeController(strapi as never, 'api::menu.menu', {
    replicateToOtherLocales: true,
    replicateMode: 'missingOnly',
    replicateArrayMergeKeys: ['url'],
  });
  const ctx = createCtx('ru', {
    mainMenu: [
      { title: 'Обучающимся', url: '/students', links: [] },
      { title: 'Общежитие', url: '/students/dormitory', links: [] },
    ],
  });

  await controller.update(ctx);

  assert.equal(calls.updateCalls.length, 2);
  assert.deepEqual(calls.updateCalls[1], {
    documentId: 'menu-doc',
    locale: 'en',
    status: 'published',
    data: {
      mainMenu: [
        { title: 'Students EN', url: '/students', links: [] },
        { title: 'Общежитие', url: '/students/dormitory', links: [] },
      ],
    },
  });
});

test('missingOnly mode removes array items missing in source locale', async () => {
  const { strapi, calls } = createMockStrapi({
    findFirstQueue: [{ documentId: 'global-doc' }],
    localeRows: [{ code: 'ru' }, { code: 'en' }],
    findOneByLocale: {
      en: {
        resources: [
          { title: 'Existing', url: '/existing' },
          { title: 'To remove', url: '/obsolete' },
        ],
      },
    },
  });
  const controller = createLocalizedSingleTypeController(strapi as never, 'api::global.global', {
    replicateToOtherLocales: true,
    replicateMode: 'missingOnly',
    replicateArrayMergeKeys: ['url', 'title'],
  });
  const ctx = createCtx('ru', {
    resources: [{ title: 'Existing', url: '/existing' }],
  });

  await controller.update(ctx);

  assert.equal(calls.updateCalls.length, 2);
  assert.deepEqual(calls.updateCalls[1], {
    documentId: 'global-doc',
    locale: 'en',
    status: 'published',
    data: {
      resources: [{ title: 'Existing', url: '/existing' }],
    },
  });
});
