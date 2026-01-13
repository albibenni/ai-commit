// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import { defineConfig } from "eslint/config";
import { configs } from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["eslint.config.js"],
  },
  eslint.configs.recommended,
  ...configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.es2025,
        ...globals.node,
        ...globals.vitest,
        React: "readonly",
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        projectService: {
          allowDefaultProject: ["*.js", "*.cjs", "eslint.config.js"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-unsafe-declaration-merging": "error",
      "@typescript-eslint/ban-ts-comment": "off",
      "prefer-spread": "off",
      "no-case-declarations": "off",
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
    },
  },
);
