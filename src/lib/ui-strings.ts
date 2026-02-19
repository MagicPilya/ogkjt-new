/**
 * Строки интерфейса по локалям (новости, события, календарь, файлы).
 */
import type { Locale } from "./i18n";

export const uiStrings = {
  // Новости (главная, лента)
  newsSectionTitle: {
    ru: "Последние новости колледжа",
    be: "Апошнія навіны каледжа",
    en: "Latest college news",
  } as Record<Locale, string>,
  allNews: {
    ru: "Все новости",
    be: "Усе навіны",
    en: "All news",
  } as Record<Locale, string>,
  noPhoto: {
    ru: "Нет фото",
    be: "Няма фота",
    en: "No photo",
  } as Record<Locale, string>,

  // Событие (страница события)
  backToNews: {
    ru: "Вернуться к новостям",
    be: "Вярнуцца да навін",
    en: "Back to news",
  } as Record<Locale, string>,
  openAttachedFile: {
    ru: "Открыть вложенный файл",
    be: "Адкрыць даданы файл",
    en: "Open attached file",
  } as Record<Locale, string>,
  eventDescriptionEmpty: {
    ru: "Описание события пока не добавлено.",
    be: "Апісанне падзеі пакуль не дададзена.",
    en: "Event description has not been added yet.",
  } as Record<Locale, string>,
  eventNotFound: {
    ru: "Событие не найдено",
    be: "Падзея не знойдзена",
    en: "Event not found",
  } as Record<Locale, string>,

  // Календарь событий
  calendarTitle: {
    ru: "Календарь событий",
    be: "Каляндар падзей",
    en: "Events calendar",
  } as Record<Locale, string>,
  calendarHint: {
    ru: "Нажмите на день с точкой — откроется список.",
    be: "Націсніце на дзень з кропкай — адкрыецца спіс.",
    en: "Click on a day with a dot to open the list.",
  } as Record<Locale, string>,
  upcomingEvents: {
    ru: "Ближайшие события",
    be: "Бліжэйшыя падзеі",
    en: "Upcoming events",
  } as Record<Locale, string>,
  noEvents: {
    ru: "Событий пока нет.",
    be: "Падзей пакуль няма.",
    en: "No events yet.",
  } as Record<Locale, string>,
  close: {
    ru: "Закрыть",
    be: "Закрыць",
    en: "Close",
  } as Record<Locale, string>,

  // FileViewer (диалог файла)
  attachedFile: {
    ru: "Вложенный файл",
    be: "Даданы файл",
    en: "Attached file",
  } as Record<Locale, string>,
  imageAlt: {
    ru: "Изображение",
    be: "Выява",
    en: "Image",
  } as Record<Locale, string>,
  pdfDocument: {
    ru: "PDF документ",
    be: "PDF дакумент",
    en: "PDF document",
  } as Record<Locale, string>,
  officeCannotPreview: {
    ru: "Документ Office не может быть просмотрен в браузере",
    be: "Дакумент Office нельга прагледзець у браўзеры",
    en: "Office document cannot be viewed in the browser",
  } as Record<Locale, string>,
  fileCannotPreview: {
    ru: "Этот тип файла не может быть просмотрен в браузере",
    be: "Гэты тып файла нельга прагледзець у браўзеры",
    en: "This file type cannot be viewed in the browser",
  } as Record<Locale, string>,
  pleaseDownload: {
    ru: "Пожалуйста, скачайте файл для просмотра",
    be: "Калі ласка, спампавуйце файл для прагляду",
    en: "Please download the file to view it",
  } as Record<Locale, string>,
  downloadFile: {
    ru: "Скачать файл",
    be: "Спампаваць файл",
    en: "Download file",
  } as Record<Locale, string>,
  download: {
    ru: "Скачать",
    be: "Спампаваць",
    en: "Download",
  } as Record<Locale, string>,
} as const;
