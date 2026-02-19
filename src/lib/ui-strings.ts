/**
 * Строки интерфейса по локалям (новости, события, календарь, файлы).
 */
import type { Locale } from "./i18n";

export const uiStrings = {
  breadcrumbsLabel: {
    ru: "Хлебные крошки",
    be: "Хлебныя крошкі",
    en: "Breadcrumbs",
  } as Record<Locale, string>,
  home: {
    ru: "Главная",
    be: "Галоўная",
    en: "Home",
  } as Record<Locale, string>,
  newsItem: {
    ru: "Новость",
    be: "Навіна",
    en: "News item",
  } as Record<Locale, string>,
  eventItem: {
    ru: "Событие",
    be: "Падзея",
    en: "Event",
  } as Record<Locale, string>,

  search: {
    ru: "Поиск",
    be: "Пошук",
    en: "Search",
  } as Record<Locale, string>,
  searchSite: {
    ru: "Поиск по сайту",
    be: "Пошук па сайце",
    en: "Search the site",
  } as Record<Locale, string>,
  searchPlaceholderMobile: {
    ru: "Поиск (2+ символа)",
    be: "Пошук (2+ сімвалы)",
    en: "Search (2+ chars)",
  } as Record<Locale, string>,
  searchPlaceholderDesktop: {
    ru: "Введите запрос (минимум 2 символа)...",
    be: "Увядзіце запыт (мінімум 2 сімвалы)...",
    en: "Enter a query (at least 2 characters)...",
  } as Record<Locale, string>,
  enterMinChars: {
    ru: "Введите минимум",
    be: "Увядзіце мінімум",
    en: "Enter at least",
  } as Record<Locale, string>,
  symbolsCount: {
    ru: "символа",
    be: "сімвалы",
    en: "characters",
  } as Record<Locale, string>,
  searching: {
    ru: "Поиск...",
    be: "Пошук...",
    en: "Searching...",
  } as Record<Locale, string>,
  notFound: {
    ru: "Ничего не найдено",
    be: "Нічога не знойдзена",
    en: "Nothing found",
  } as Record<Locale, string>,

  switchToLightTheme: {
    ru: "Включить светлую тему",
    be: "Уключыць светлую тэму",
    en: "Enable light theme",
  } as Record<Locale, string>,
  switchToDarkTheme: {
    ru: "Включить тёмную тему",
    be: "Уключыць цёмную тэму",
    en: "Enable dark theme",
  } as Record<Locale, string>,
  lightTheme: {
    ru: "Светлая тема",
    be: "Светлая тэма",
    en: "Light theme",
  } as Record<Locale, string>,
  darkTheme: {
    ru: "Тёмная тема",
    be: "Цёмная тэма",
    en: "Dark theme",
  } as Record<Locale, string>,
  enableLowVision: {
    ru: "Включить версию для слабовидящих",
    be: "Уключыць версію для людзей са слабым зрокам",
    en: "Enable low vision mode",
  } as Record<Locale, string>,
  disableLowVision: {
    ru: "Выключить версию для слабовидящих",
    be: "Выключыць версію для людзей са слабым зрокам",
    en: "Disable low vision mode",
  } as Record<Locale, string>,
  lowVisionLabel: {
    ru: "Версия для слабовидящих",
    be: "Версія для людзей са слабым зрокам",
    en: "Low vision mode",
  } as Record<Locale, string>,

  footerFollowUs: {
    ru: "Подписывайтесь и следите за нами в соцсетях:",
    be: "Падпісвайцеся і сачыце за намі ў сацсетках:",
    en: "Follow us on social media:",
  } as Record<Locale, string>,
  footerNavigation: {
    ru: "Навигация",
    be: "Навігацыя",
    en: "Navigation",
  } as Record<Locale, string>,
  footerResources: {
    ru: "Ресурсы",
    be: "Рэсурсы",
    en: "Resources",
  } as Record<Locale, string>,
  footerContacts: {
    ru: "Контакты",
    be: "Кантакты",
    en: "Contacts",
  } as Record<Locale, string>,
  receptionLabel: {
    ru: "Приемная:",
    be: "Прыёмная:",
    en: "Reception:",
  } as Record<Locale, string>,
  directorLabel: {
    ru: "Директор:",
    be: "Дырэктар:",
    en: "Director:",
  } as Record<Locale, string>,
  allRightsReserved: {
    ru: "Все права защищены.",
    be: "Усе правы абаронены.",
    en: "All rights reserved.",
  } as Record<Locale, string>,
  footerYearPrefix: {
    ru: "©",
    be: "©",
    en: "©",
  } as Record<Locale, string>,

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
