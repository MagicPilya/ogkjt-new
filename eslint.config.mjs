import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    rules: {
      "no-debugger": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["scripts/**/*", "backend/scripts/**/*"],
    rules: {
      "no-console": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "backend/dist/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
