export const DEFAULT_LOCALE = 'ru';
export const SINGLE_TYPE_PREFIX = '/content-manager/single-types/';

export const MIRRORED_SINGLE_TYPE_UIDS = new Set([
  'api::administration.administration',
  'api::admission-document.admission-document',
  'api::specialty.specialty',
  'api::global.global',
  'api::annual-symbol.annual-symbol',
]);

export const DEFAULT_ARRAY_MERGE_KEYS = [
  'url',
  'pageUrl',
  'slug',
  'link',
  'code',
  'title',
  'name',
  'label',
  'fullName',
  'documentId',
  'id',
];

export const ARRAY_MERGE_KEYS_BY_UID: Record<string, string[]> = {
  'api::global.global': ['url', 'title', 'label', 'name'],
  'api::administration.administration': ['photo.documentId', 'photo.id', 'contacts', 'url', 'fullName', 'name', 'title'],
  'api::admission-document.admission-document': ['url', 'title', 'label', 'name'],
  'api::specialty.specialty': ['code', 'slug', 'url', 'title', 'name'],
};

export const POPULATE_BY_UID: Record<string, unknown> = {
  'api::administration.administration': {
    members: { populate: ['photo'] },
  },
  'api::global.global': {
    resources: true,
    admissionCampaign: true,
  },
  'api::specialty.specialty': {
    items: { populate: ['specializations', 'workerProfessions'] },
  },
  'api::annual-symbol.annual-symbol': {
    logo: true,
  },
};
