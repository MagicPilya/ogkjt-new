const { spawn } = require("child_process");

const child = spawn(process.execPath, ["./node_modules/@strapi/strapi/bin/strapi.js", "start"], {
  cwd: __dirname,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
