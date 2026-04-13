export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface StrapiImage {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  name?: string | null;
  formats?: Partial<Record<"thumbnail" | "small" | "medium" | "large", { url?: string }>>;
}

export interface StrapiFile {
  id: number;
  documentId: string;
  url: string;
  name?: string | null;
  alternativeText?: string | null;
  caption?: string | null;
  ext?: string;
  mime?: string;
  size?: number;
}

export interface Event {
  id: number;
  documentId: string;
  title: string;
  date: string;
  location?: string | null;
  description?: unknown[] | null;
  file?: StrapiImage | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  announcement: string;
  content: unknown[];
  date: string;
  cover: StrapiImage | null;
  media?: (StrapiImage | StrapiFile)[] | null;
  files?: StrapiFile[] | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Page {
  id: number;
  documentId: string;
  pageUrl: string;
  title: string;
  metaDescription?: string | null;
  content: unknown[];
  media?: (StrapiImage | StrapiFile)[] | null;
  files?: StrapiFile[] | null;
  articleFeedSection?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}

export interface AdministrationMember {
  id?: number;
  documentId?: string;
  fullName: string;
  position: string;
  contacts?: string | null;
  photo?: StrapiImage | null;
}

export interface Administration {
  id?: number;
  documentId?: string;
  members?: AdministrationMember[] | null;
}

export interface SpecializationItem {
  name: string;
  code: string;
}

export interface WorkerProfession {
  title: string;
}

export interface SpecialtyItem {
  name: string;
  code: string;
  specializations?: SpecializationItem[] | null;
  qualification?: string | null;
  workerProfessions?: WorkerProfession[] | null;
}

export interface Specialties {
  id?: number;
  documentId?: string;
  items?: SpecialtyItem[] | null;
}

export interface AdmissionDocumentNameItem {
  id?: number;
  name: string;
}

export interface AdmissionDocuments {
  id?: number;
  documentId?: string;
  fullTimeBase?: string | null;
  partTimeBase?: string | null;
  fullTimeItems?: AdmissionDocumentNameItem[] | null;
  partTimeItems?: AdmissionDocumentNameItem[] | null;
}

export interface MenuSublink {
  id: number;
  title: string;
  url: string;
}

export interface MenuLink {
  id: number;
  title: string;
  url: string;
  sublinks?: MenuSublink[];
}

export interface MenuSection {
  id: number;
  title: string;
  url: string | null;
  links: MenuLink[];
}

export interface GlobalSettings {
  id: number;
  documentId: string;
  collegeFullName?: string | null;
  collegeShortName?: string | null;
  collegeMainName?: string | null;
  collegeBranchShortName?: string | null;
  heroBranchWord?: string | null;
  universityName?: string | null;
  address: string;
  phoneReception: string;
  phoneDirector: string;
  email: string;
  instagramLink: string | null;
  telegramLink: string | null;
  tiktokLink: string | null;
  vkLink: string | null;
  resources?: Array<{
    id?: number;
    title: string;
    url: string;
  }> | null;
}

export interface AnnualSymbol {
  id: number;
  documentId: string;
  title: string;
  description?: string | null;
  pageUrl?: string | null;
  logo?: StrapiImage | null;
}

export interface MenuData {
  id: number;
  documentId: string;
  mainMenu: MenuSection[];
  footerResources?: Array<{
    id?: number;
    title: string;
    url: string;
  }> | null;
}
