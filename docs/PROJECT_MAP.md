# Карта проекта

Веб-сайт Оршанского колледжа – филиала учреждения образования «Белорусский государственный университет транспорта»

## 🏗️ Архитектура проекта

Проект состоит из двух основных частей:
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Backend**: Strapi 5 (Headless CMS)

## 📁 Структура проекта

```
ogkjt-new/
├── src/                    # Frontend (Next.js)
│   ├── app/                # Страницы и маршруты (App Router)
│   ├── components/         # React компоненты
│   ├── lib/                # Утилиты и интеграции
│   └── hooks/              # React хуки
├── backend/                # Backend (Strapi)
│   ├── src/
│   │   ├── api/            # API endpoints и модели данных
│   │   ├── components/    # Strapi компоненты
│   │   └── index.ts        # Точка входа
│   └── config/             # Конфигурация Strapi
└── public/                 # Статические файлы
```

## 🎯 Frontend (Next.js)

### Структура страниц (`src/app/`)

#### Главная страница
- `page.tsx` - Главная страница с Hero, новостями и событиями

#### Раздел "Новости"
- `news/page.tsx` - Список всех новостей
- `news/[slug]/page.tsx` - Детальная страница новости (динамический маршрут)

#### Раздел "О колледже" (`about/`)
- `about/page.tsx` - Главная страница раздела
- `about/administration/page.tsx` - Администрация
- `about/contacts/page.tsx` - Контакты и схема проезда
- `about/corruption/page.tsx` - Профилактика коррупции
- `about/history/page.tsx` - История колледжа
- `about/services/page.tsx` - Платные услуги
- `about/symbols/page.tsx` - Государственные символы и символика

#### Раздел "Абитуриентам" (`applicants/`)
- `applicants/page.tsx` - Главная страница раздела
- `applicants/specialties/page.tsx` - Специальности
- `applicants/plan/page.tsx` - План приема
- `applicants/documents/page.tsx` - Документы для подачи
- `applicants/transfer/page.tsx` - Информация о свободных местах (перевод/восстановление)

#### Раздел "Обучающимся" (`students/`)
- `students/page.tsx` - Главная страница раздела
- `students/day/page.tsx` - Дневное отделение (расписание, графики)
- `students/correspondence/page.tsx` - Заочное отделение (график сессий, объявления)
- `students/dormitory/page.tsx` - Общежитие (новости, правила)

#### Раздел "Воспитательная работа" (`ideology/`)
- `ideology/page.tsx` - Главная страница раздела
- `ideology/spps/page.tsx` - СППС (психолог, социальный педагог)
- `ideology/youth-policy/page.tsx` - Молодежная политика (БРСМ, Кодекс чести, кружки)
- `ideology/curator/page.tsx` - В помощь куратору

#### Другие разделы
- `one-window/page.tsx` - Одно окно (административные процедуры)
- `appeals/page.tsx` - Электронные обращения

### Компоненты (`src/components/`)

#### Layout компоненты (`layout/`)
- `Header.tsx` - Шапка сайта
- `HeaderWrapper.tsx` - Обертка для Header с загрузкой данных из Strapi
- `Footer.tsx` - Подвал сайта
- `FooterWrapper.tsx` - Обертка для Footer с загрузкой данных из Strapi
- `Logo.tsx` - Логотип колледжа
- `PlaceholderPage.tsx` - Заглушка для страниц в разработке

#### Блоки контента (`blocks/`)
- `Hero.tsx` - Hero-секция главной страницы
- `Features.tsx` - Блок преимуществ и ценностей
- `NewsGrid.tsx` - Сетка новостей с пагинацией
- `Events.tsx` - Календарь событий
- `QuickAccessPanel.tsx` - Плавающая панель быстрого доступа
- `QuickLinks.tsx` - Блок быстрых ссылок
- `FeedbackForm.tsx` - Форма обратной связи

#### UI компоненты (`ui/`)
Библиотека переиспользуемых компонентов на базе Radix UI:
- `button.tsx` - Кнопки
- `card.tsx` - Карточки
- `input.tsx` - Поля ввода
- `textarea.tsx` - Текстовые области
- `dialog.tsx` - Модальные окна
- `sheet.tsx` - Выдвижные панели (для мобильного меню)
- `navigation-menu.tsx` - Навигационное меню
- `calendar.tsx` - Календарь
- `carousel.tsx` - Карусель

### Утилиты и интеграции (`src/lib/`)

- `strapi.ts` - Интеграция с Strapi API
  - `getArticles()` - Получение списка новостей
  - `getArticleBySlug()` - Получение новости по slug
  - `getEvents()` - Получение предстоящих событий
  - `getGlobalSettings()` - Получение глобальных настроек (меню, контакты)
  - `getPageBySlug()` - Получение страницы по slug

- `utils.ts` - Вспомогательные функции
  - `getStrapiURL()` - URL Strapi API
  - `getStrapiMedia()` - Формирование URL медиафайлов
  - `formatDate()` - Форматирование дат
  - `cn()` - Утилита для объединения классов CSS

## 🔧 Backend (Strapi)

### API модели (`backend/src/api/`)

#### Article (Новости)
- **Схема**: `article/content-types/article/schema.json`
- **Поля**:
  - `title` (string) - Заголовок
  - `slug` (uid) - Уникальный идентификатор для URL
  - `announcement` (text) - Анонс
  - `content` (blocks) - Основное содержимое (Rich Text)
  - `cover` (media) - Обложка
  - `date` (date) - Дата публикации
- **Endpoints**: `/api/articles`

#### Event (События)
- **Схема**: `event/content-types/event/schema.json`
- **Поля**:
  - `title` (string) - Название
  - `date` (datetime) - Дата и время
  - `location` (string) - Место проведения
  - `description` (blocks) - Описание
  - `file` (media) - Прикрепленный файл
- **Endpoints**: `/api/events`

#### Page (Страницы)
- **Схема**: `page/content-types/page/schema.json`
- **Поля**:
  - `title` (string) - Заголовок
  - `slug` (uid) - Уникальный идентификатор
  - `content` (blocks) - Содержимое страницы
- **Endpoints**: `/api/pages`

#### Global (Глобальные настройки)
- **Тип**: Single Type
- **Схема**: `global/content-types/global/schema.json`
- **Поля**:
  - `mainMenu` (component, repeatable) - Главное меню
  - `address` (string) - Адрес
  - `phoneReception` (string) - Телефон приемной
  - `phoneDirector` (string) - Телефон директора
  - `email` (email) - Электронная почта
  - `instagramLink`, `telegramLink`, `tiktokLink` (string) - Ссылки на соцсети
- **Endpoints**: `/api/global`

### Strapi компоненты (`backend/src/components/`)

#### MenuSection
- **Файл**: `elements/menu-section.json`
- **Поля**:
  - `title` (string) - Название раздела
  - `url` (string) - Ссылка раздела
  - `links` (component, repeatable) - Массив ссылок подразделов

#### MenuLink
- **Файл**: `elements/menu-link.json`
- **Поля**:
  - `title` (string) - Название ссылки
  - `url` (string) - URL ссылки

## 🛠️ Технологический стек

### Frontend
- **Framework**: Next.js 16.0.3 (App Router)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4.1.17
- **UI Components**: Radix UI
  - `@radix-ui/react-navigation-menu` - Навигация
  - `@radix-ui/react-dialog` - Модальные окна
  - `@radix-ui/react-slot` - Слоты
- **Icons**: Lucide React 0.554.0
- **Date Handling**: date-fns 4.1.0, react-day-picker 9.11.1
- **Carousel**: embla-carousel-react 8.6.0
- **TypeScript**: 5.x

### Backend
- **CMS**: Strapi 5.31.2
- **Database**: SQLite (better-sqlite3 12.4.1) - для разработки
- **TypeScript**: 5.x

## 🔄 Интеграция Frontend ↔ Backend

### API взаимодействие
- **Протокол**: REST API
- **Base URL**: Настраивается через `NEXT_PUBLIC_STRAPI_URL` (по умолчанию: `http://127.0.0.1:1337`)
- **Endpoints**:
  - `GET /api/articles` - Список новостей
  - `GET /api/articles?filters[slug][$eq]=...` - Новость по slug
  - `GET /api/events` - Список событий
  - `GET /api/pages?filters[slug][$eq]=...` - Страница по slug
  - `GET /api/global` - Глобальные настройки
  - `GET /api/administration` - Администрация (single type: список сотрудников с ФИО, должностью, контактами, фото для страницы «О колледже → Администрация»)

### Стратегии рендеринга
- **SSG/ISR**: Статичные страницы разделов "О колледже", "Абитуриентам"
- **SSR**: Динамические страницы новостей по slug
- **Client-side**: Фильтрация событий, интерактивные элементы

### Кеширование
- Запросы к Strapi (страницы, меню, новости, события) используют `cache: "no-store"`, чтобы после нажатия «Опубликовать» в админке данные подтягивались при следующей загрузке страницы.
- Медиафайлы оптимизируются через Next.js Image.

## 📝 Основные функции

1. **Управление контентом** через Strapi Admin Panel
2. **Динамическое меню** - управляется из Strapi без изменения кода
3. **Новости** - создание, редактирование, публикация через CMS
4. **События** - календарь предстоящих событий
5. **Адаптивный дизайн** - поддержка мобильных устройств
6. **Темная тема** - поддержка dark mode
7. **Оптимизация изображений** - автоматическая через Next.js Image

## 🚀 Запуск проекта

### Frontend
```bash
npm run dev      # Разработка
npm run build    # Сборка
npm run start    # Продакшн
```

### Backend
```bash
cd backend
npm run develop  # Разработка с hot reload
npm run build    # Сборка
npm run start    # Продакшн
```

## 📌 Важные файлы конфигурации

- `next.config.ts` - Конфигурация Next.js
- `tsconfig.json` - Настройки TypeScript
- `tailwind.config.js` / `postcss.config.mjs` - Конфигурация Tailwind CSS
- `backend/config/` - Конфигурация Strapi (database, server, plugins, etc.)

## 🔐 Безопасность

- CORS настроен для разрешения запросов с фронтенда
- Роли доступа в Strapi:
  - `Public` - чтение публичного контента
  - `Authenticated` - полный доступ для администраторов

## ⚠️ Если после «Опубликовать» контент не появляется на сайте

1. **Права API**  
   В Strapi: **Settings → Users & Permissions → Roles → Public**. Для типов **Page**, **Article**, **Menu**, **Global**, **Event**, **Administration** должны быть включены права **find** и **findOne** (галочки в колонке Permissions).

2. **Страница привязана к пункту меню**  
   В **Content Manager → Страница (Page)** у записи «Администрация» в поле **Страница** (pageUrl) должно быть выбрано **«О колледже → Администрация»** (в Strapi сохраняется как URL `/about/administration`). Если выбрано другое или пусто — фронт не найдёт страницу по адресу `/about/administration`.

3. **Запись опубликована**  
   В списке страниц у нужной записи должен быть статус **Published**, не **Draft**. Кнопка **Publish** в редакторе должна быть нажата после заполнения контента.

4. **Адрес Strapi**  
   В корне проекта в `.env` задайте `NEXT_PUBLIC_STRAPI_URL` на тот же инстанс, где запущена админка (например `http://127.0.0.1:1337`). После смены URL перезапустите `npm run dev`.

5. **Обновите страницу сайта**  
   После публикации обновите страницу в браузере (F5 или Ctrl+R). Кэш отключён — данные подтягиваются заново при каждом запросе.

6. **Отладка**  
   При `npm run dev` в терминале Next.js при ошибках запросов к Strapi выводятся предупреждения вида `[Strapi] 403 Forbidden: ...` или `[Strapi] Запрос не выполнен`. По ним можно понять, что Strapi недоступен или права запрещают доступ.

## 📊 Статус разработки

Проект находится в стадии активной разработки. Основная структура и базовый функционал реализованы, некоторые страницы могут быть в стадии разработки (используется `PlaceholderPage`).

