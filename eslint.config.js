import js from "@eslint/js";
import importX from "eslint-plugin-import-x";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/", "coverage/", "node_modules/"] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  sonarjs.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ["*.js", "scripts/*.mjs"] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { "import-x": importX },
    rules: {
      complexity: ["error", 8],
      "max-depth": ["error", 3],
      "max-params": ["error", 4],
      "max-lines-per-function": [
        "error",
        { max: 40, skipBlankLines: true, skipComments: true },
      ],
      "max-lines": [
        "error",
        { max: 250, skipBlankLines: true, skipComments: true },
      ],
      "no-console": "error",
      eqeqeq: "error",
      "import-x/no-cycle": "error",
      "import-x/no-self-import": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "sonarjs/cognitive-complexity": ["error", 10],
    },
  },
  {
    // The three contexts only talk through messages, never by importing each other.
    files: ["src/background/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/offscreen/**", "**/page/**"],
              message:
                "the service worker talks to the page and the offscreen document by message",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/page/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/background/**", "**/offscreen/**"],
              message: "the page script talks to the service worker by message",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/offscreen/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/background/**", "**/page/**"],
              message:
                "the offscreen document talks to the service worker by message",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/background/**", "**/offscreen/**", "**/page/**"],
              message: "shared code depends on nothing",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["tests/**/*.ts"],
    rules: {
      "max-lines-per-function": "off",
      "max-lines": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/unbound-method": "off",
      "sonarjs/no-nested-functions": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
);
