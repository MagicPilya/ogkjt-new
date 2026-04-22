# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

## Локализация (i18n) для single-type

Типы **Глобальные настройки**, **Меню**, **Специальности**, **Администрация** включены в i18n. Чтобы для каждой локали (ru, en, be) отдавались свои данные:

- **API**: в контроллере обязательно передавать `locale` из `ctx.query.locale` в `findFirst`. Дефолтный контроллер этого не делает — без кастомного `find` для ru и en может возвращаться одна и та же запись.
- **Внутренние вызовы** (bootstrap, sync страниц, подстановка title из меню) в `src/index.ts` используют константу `DEFAULT_MENU_LOCALE` ('ru'), чтобы не зависеть от «первой попавшейся» локали.

При добавлении нового single-type с i18n см. примеры в `api::global.global`, `api::menu.menu`, `api::specialty.specialty`, `api::administration.administration` и правило в `.cursor/rules/strapi-i18n-single-types.mdc`.

## Оптимизация изображений

В проекте включена автоматическая оптимизация изображений в upload pipeline Strapi:

- при загрузке новые изображения сжимаются автоматически;
- включены responsive-версии (`thumbnail`, `small`, `medium`, `large`, `xlarge`, `xsmall`);
- применяется `autoOrientation`;
- `svg` и `gif` не конвертируются.

### Как это работает

- Оптимизация происходит в момент upload/replace в Media Library.
- Старые файлы не меняются автоматически; для них есть отдельный скрипт массовой переоптимизации.
- Если файл маленький или выгода по размеру ниже порога, оригинал сохраняется без перекодирования.

### Переменные окружения (`.env`)

Доступны настройки:

- `IMAGE_OPTIMIZER_FORMAT` - `webp` или `avif`
- `IMAGE_OPTIMIZER_MAX_WIDTH` - максимальная ширина (px), без upscaling
- `IMAGE_OPTIMIZER_WEBP_QUALITY` - качество WebP (0-100)
- `IMAGE_OPTIMIZER_AVIF_QUALITY` - качество AVIF (0-100)
- `IMAGE_OPTIMIZER_MIN_SOURCE_BYTES` - минимальный размер исходника для оптимизации
- `IMAGE_OPTIMIZER_MIN_SAVINGS_PERCENT` - минимальная выгода в процентах, иначе сохраняется исходник

Пример дефолтов есть в `./.env.example`.

### Массовая переоптимизация старых файлов

Скрипт: `npm run media:reoptimize`

- Проверка без изменений (dry-run):

```
npm run media:reoptimize -- --dry-run
```

- Ограниченный тестовый прогон:

```
npm run media:reoptimize -- --dry-run --limit 20
```

- Применить изменения:

```
npm run media:reoptimize
```

В отчёте выводится:

- количество обработанных и оптимизированных файлов;
- экономия по оригиналам, по форматам и суммарно (в MB и %);
- число пропусков (tiny/no-gain/missing/unsupported).

### Резервная копия админки (SQLite, uploads, опционально `.env`)

Скрипты: `scripts/admin-backup.mjs` и `scripts/admin-restore.mjs`. Запуск из **корня монорепозитория** (как в `package.json`):

| Действие | Команда |
|----------|---------|
| Бэкап по умолчанию (без `backend/.env`) | `npm run backup:admin` |
| Бэкап с секретами | `npm run backup:admin -- --include-env` |
| Свой путь архива | `npm run backup:admin -- --out ./path/имя.zip` |
| Восстановить из указанного zip | `npm run restore:admin -- --archive ./path/имя.zip` |
| Восстановить без вопроса `yes/no` | `npm run restore:admin -- --yes` |
| Восстановить последний zip из `backend/backups/` | `npm run restore:admin` |

В архив попадают `backup-manifest.json` (поле **`envIncluded`**: был ли в архиве `.env`), при необходимости `.tmp/data.db`, `public/uploads` и **только при явном** `--include-env` — файл `backend/.env`.

При **restore**, если в архиве нет `.env`, локальный `backend/.env` не перезаписывается; скрипт выводит пояснение (в т.ч. если в манифесте `envIncluded: false`).

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

После изменения переводов или конфига в `src/admin/app.tsx` нужно пересобрать админку, иначе на проде останутся старые бандлы и ошибки в консоли (например MISSING_TRANSLATION). На деплое выполни `npm run build` и залей обновлённую папку `build/`.

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
