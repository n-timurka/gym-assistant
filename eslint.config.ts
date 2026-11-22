import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginCypress from 'eslint-plugin-cypress'
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import globals from 'globals'

export default withVueTs(
  // 1. Base JS recommended rules
  js.configs.recommended,

  // 2. Vue 3 recommended rules
  ...pluginVue.configs['flat/recommended'],

  // 3. TypeScript recommended (works with .vue files)
  vueTsConfigs.recommended,

  // -------------------------------------------------
  // 5. Application source files
  // -------------------------------------------------
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      // Vue specific
      'vue/multi-word-component-names': 'off',          // Ionic often uses single-word page names
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'off',
      'vue/attribute-hyphenation': ['error', 'never'],   // Ionic prefers camelCase

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],

      // General
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },

  // -------------------------------------------------
  // 6. Unit tests (Vitest)
  // -------------------------------------------------
  {
    name: 'app/unit-tests',
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/unit/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // -------------------------------------------------
  // 7. Cypress E2E tests
  // -------------------------------------------------
  {
    name: 'app/cypress',
    files: [
      'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}',
      'cypress/support/**/*.{js,ts}',
    ],
    plugins: {
      cypress: pluginCypress,
    },
    languageOptions: {
      globals: {
        ...pluginCypress.configs.globals.languageOptions.globals,
        ...globals.browser,
        ...globals.mocha,
      },
    },
    rules: {
      ...pluginCypress.configs.recommended.rules,
      '@typescript-eslint/no-namespace': 'off',   // Cypress uses namespaces
      'cypress/no-unnecessary-waiting': 'warn',
    },
  },

  // -------------------------------------------------
  // 8. Ionic specific overrides (very useful)
  // -------------------------------------------------
  {
    name: 'app/ionic',
    files: ['**/*.{vue,ts}'],
    rules: {
      // Ionic components often use short names and special attributes
      'vue/component-name-in-template-casing': ['error', 'kebab-case', {
        registeredComponentsOnly: false,
      }],
      'vue/no-unused-refs': 'warn',
      'vue/no-deprecated-slot-attribute': ['error', {
        ignore: ['/^ion-/']
      }]
    },
  },

  // -------------------------------------------------
  // Files / folders to ignore
  // -------------------------------------------------
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.vscode/**',
      '**/.idea/**',
      '**/public/**',
      '**/android/**',
      '**/ios/**',
      '**/*.d.ts',
      '**/*.config.ts',
      '**/data/**/*.ts',
    ],
  },
)