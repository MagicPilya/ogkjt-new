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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
