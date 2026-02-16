import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337', // Strapi на локальной разработке
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '178.172.137.227', // Strapi на сервере
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.devsu.site',
      },
      {
        protocol: 'https',
        hostname: 'devsu.site',
      },
      {
        protocol: 'https',
        hostname: 'api.devsu.site',
      }
    ],
  },
};

export default nextConfig;
