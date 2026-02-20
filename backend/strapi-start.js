const { spawn } = require("child_process");

const child = spawn("npm", ["run", "start"], {
  cwd: __dirname,
  env: process.env,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
