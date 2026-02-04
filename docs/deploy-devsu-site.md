# Деплой на https://www.devsu.site — админка и API по домену

## Схема

- **Сайт (Next.js):** https://www.devsu.site
- **Strapi (API + админка):** лучше вынести на поддомен, например **https://api.devsu.site**

Тогда:
- Админка: https://api.devsu.site/admin  
- API: https://api.devsu.site/api  
- Загрузки (картинки): https://api.devsu.site/uploads/...

---

## 1. Сервер: nginx для Strapi по поддомену

Создайте конфиг для поддомена (например `api.devsu.site`):

```nginx
# /etc/nginx/sites-available/api.devsu.site
server {
    listen 443 ssl http2;
    server_name api.devsu.site;

    ssl_certificate     /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:1337;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Включите сайт и перезапустите nginx:

```bash
sudo ln -s /etc/nginx/sites-available/api.devsu.site /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

В DNS для домена добавьте A-запись: `api.devsu.site` → IP сервера.

---

## 2. Backend (Strapi): переменные окружения

В `backend/.env` на сервере:

```env
HOST=0.0.0.0
PORT=1337

# Публичный URL, по которому доступна админка и API (без слеша в конце)
STRAPI_PUBLIC_URL=https://api.devsu.site

# CORS: с каких доменов разрешены запросы к API
CORS_ORIGINS=https://www.devsu.site,https://devsu.site

# Остальные ключи (APP_KEYS, ADMIN_JWT_SECRET и т.д.) — как у вас уже настроено
```

После изменения перезапустите Strapi.

---

## 3. Frontend (Next.js): откуда тянуть API

В **корне проекта** создайте `.env.local` (или задайте переменные в панели хостинга):

```env
NEXT_PUBLIC_STRAPI_URL=https://api.devsu.site
```

Пересоберите и задеплойте фронт:

```bash
npm run build
```

Тогда и запросы к API, и картинки будут идти на `https://api.devsu.site` — без mixed content.

---

## 4. Итог

| Что              | URL |
|------------------|-----|
| Сайт             | https://www.devsu.site |
| Админка Strapi   | https://api.devsu.site/admin |
| API Strapi       | https://api.devsu.site/api |
| Загрузки (медиа) | https://api.devsu.site/uploads/... |

Если Strapi и Next крутятся на одном сервере, можно сделать и один домен с разными путями (например `/backend` → Strapi), но настройка nginx и `STRAPI_PUBLIC_URL` будет сложнее; поддомен `api.devsu.site` обычно удобнее.
