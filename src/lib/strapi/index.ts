export {
  getArticleBySlug,
  getArticleBySlugOrDocumentId,
  getArticles,
} from "./articles";
export {
  getDormitoryNews,
  getDormitoryNewsBySlugOrDocumentId,
} from "./dormitory-news";
export {
  getAdministration,
  getAdmissionDocuments,
  getSpecialties,
} from "./admissions";
export {
  getAnnualSymbol,
  getGlobalSettings,
  getMenu,
} from "./globals";
export { getEventById, getEvents, getEventsInRange } from "./events";
export { getPageByPath, getPageBySlug } from "./pages";
export type {
  Administration,
  AdministrationMember,
  AdmissionDocumentNameItem,
  AdmissionDocuments,
  AnnualSymbol,
  Article,
  Event,
  GlobalSettings,
  MenuData,
  MenuLink,
  MenuSection,
  MenuSublink,
  Page,
  SpecializationItem,
  Specialties,
  SpecialtyItem,
  StrapiFile,
  StrapiImage,
  StrapiResponse,
  StrapiSingleResponse,
  WorkerProfession,
} from "./types";
