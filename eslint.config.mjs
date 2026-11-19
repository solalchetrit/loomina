import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", ".next-artifact/**", "out/**", "build/**", "next-env.d.ts", ".claude/**", "voice/**", "lib/brand/kit/**"]),
]);

export default eslintConfig;
