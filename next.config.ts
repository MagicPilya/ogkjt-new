import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost', // Разрешаем localhost
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1', // Разрешаем IP
      },
      {
        protocol: 'http',
        hostname: '178.172.137.227', // Strapi на сервере
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
};

export default nextConfig;
