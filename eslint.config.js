// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  prettier,
  {
    ignores: ["dist/", ".astro/"],
  },
  {
    // Build-time scripts run under Node.
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: { process: "readonly", console: "readonly" } },
  },
  {
    // is:inline scripts are browser IIFEs — relax rules that don't apply
    files: ["**/*.astro"],
    rules: {
      "no-var": "off",
    },
  },
);
