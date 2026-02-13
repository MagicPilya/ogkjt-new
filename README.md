This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install all dependencies (frontend + Strapi backend) from the project root:

```bash
npm run install:all
```

Then run the development servers:

```bash
npm run dev
```

Note: `npm run dev` will run `npm run build:all` first (build Next.js + build Strapi), then start both dev servers. If you want a faster start without a pre-build, use `dev:web` and/or `dev:cms` separately.

This will start:
- Next.js frontend at [http://localhost:3000](http://localhost:3000)
- Strapi admin panel at [http://localhost:1337/admin](http://localhost:1337/admin)

You can also run them separately:

```bash
# только фронтенд (Next.js)
npm run dev:web

# только CMS (Strapi)
npm run dev:cms
```

You can start editing the main page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Production (remote server)

1. **Скопировать проект и переменные окружения**
   - Склонировать репозиторий на сервер.
   - Скопировать `backend/.env.example` в `backend/.env` и заполнить все секреты/БД-переменные.
   - При необходимости скопировать `.env.example` в `.env` в корне и задать `NEXT_PUBLIC_STRAPI_URL` на ваш инстанс Strapi (по умолчанию используется указанный в коде).

2. **Установить зависимости (в корне проекта):**

   ```bash
   npm run install:all
   ```

3. **Запустить production-сборку одним скриптом:**

   ```bash
   npm run production
   ```

   Скрипт выполнит `npm run build:all` (Next.js + Strapi) и затем `npm run start:all`.

   - Next.js: `http://<host>:3000`
   - Strapi admin: `http://<host>:1337/admin`

Рекомендуется повесить `npm run production` на `systemd`/PM2 и завернуть в reverse-proxy (Nginx) с SSL.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
