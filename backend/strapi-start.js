/**
 * Passenger-friendly entry: run Strapi in the same process so the app listens
 * on process.env.PORT (or 1337). Do not spawn a child process.
 */
const path = require("path");
const { createStrapi } = require("@strapi/core");

const appDir = __dirname;
const distDir = path.join(appDir, "dist");

createStrapi({ appDir, distDir })
  .start()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
