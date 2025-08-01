import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unused-imports": unusedImports,
    },
    rules: {
      // React hooks recommended rules
      ...reactHooks.configs.recommended.rules,

      // React refresh rule
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Unused imports & variables rules (autofixable)
      // "unused-imports/no-unused-imports": "error",
      // "unused-imports/no-unused-vars": [
      //   "error",
      //   {
      //     vars: "all",
      //     varsIgnorePattern: "^_",
      //     args: "after-used",
      //     argsIgnorePattern: "^_",
      //   },
      // ],

      // // Typescript unused vars rule
      // "@typescript-eslint/no-unused-vars": [
      //   "error",
      //   {
      //     argsIgnorePattern: "^_",
      //   },
      // ],

      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      // ✅ Fully disable type-checking related ESLint rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  }
);
